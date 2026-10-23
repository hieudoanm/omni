@preconcurrency import CoreNFC
import Foundation

/// Errors surfaced by NFC scan/write operations.
enum NfcError: Error, Equatable {
    case unavailable
    case cancelled
    case tagNotNdef
    case failed(String)
}

extension NfcError: LocalizedError {
    var errorDescription: String? {
        switch self {
        case .unavailable:
            "NFC is not available on this device."
        case .cancelled:
            "Scan cancelled."
        case .tagNotNdef:
            "Tag does not support NDEF."
        case let .failed(message):
            message
        }
    }
}

/// CoreNFC session wrapper — counterpart of Android's `TagDispatcher` +
/// `NdefReader` + `NdefWriter` + `TagTechInspector`.
///
/// iOS requires a user-initiated `NFCTagReaderSession` per scan, so reads and
/// writes are `async` one-shot operations instead of Android's ambient
/// foreground dispatch. CoreNFC delivers delegate callbacks on the session's
/// own serial queue and its session methods are documented as callable from
/// any thread; all mutable state below is only touched from that queue or
/// from the single caller that started the operation, so the class is
/// `@unchecked Sendable`.
final class NfcService: NSObject, @unchecked Sendable {
    /// What the next session should do when a tag connects.
    enum ScanMode: Equatable {
        case read
        case write([NdefRecord])
    }

    private var session: NFCTagReaderSession?
    private var readContinuation: CheckedContinuation<TagInfo, Error>?
    private var writeContinuation: CheckedContinuation<Void, Error>?
    private var pendingMode: ScanMode = .read
    private var operationFinished = false

    /// Whether this device can run NFC tag reader sessions.
    static var isAvailable: Bool {
        NFCTagReaderSession.readingAvailable
    }

    // MARK: - Read

    /// Presents the system scanning UI and reads the first tag presented.
    func readTag() async throws -> TagInfo {
        try await withCheckedThrowingContinuation { continuation in
            guard readContinuation == nil, writeContinuation == nil else {
                continuation.resume(throwing: NfcError.failed("Another scan is already in progress."))
                return
            }
            readContinuation = continuation
            beginSession(mode: .read)
        }
    }

    // MARK: - Write

    /// Presents the system scanning UI and writes an NDEF message built from
    /// `records` to the first NDEF-capable tag presented.
    func writeTag(_ records: [NdefRecord]) async throws {
        try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
            guard readContinuation == nil, writeContinuation == nil else {
                continuation.resume(throwing: NfcError.failed("Another scan is already in progress."))
                return
            }
            writeContinuation = continuation
            beginSession(mode: .write(records))
        }
    }

    /// Dismisses an in-flight scan session (e.g. view disappeared).
    func cancelScan() {
        session?.invalidate()
    }

    // MARK: - Session lifecycle

    private func beginSession(mode: ScanMode) {
        operationFinished = false
        pendingMode = mode

        guard Self.isAvailable, let session = makeSession() else {
            resumeRead(throwing: NfcError.unavailable)
            resumeWrite(throwing: NfcError.unavailable)
            return
        }

        session.alertMessage = mode == .read
            ? "Hold your iPhone near the tag."
            : "Hold your iPhone near the tag to write."
        self.session = session
        session.begin()
    }

    private func makeSession() -> NFCTagReaderSession? {
        let polling: NFCTagReaderSession.PollingOption = [.iso14443, .iso15693, .iso18092]
        if #available(iOS 26.4, *) {
            return NFCTagReaderSession(
                configuration: .init(
                    pollingOption: polling,
                    iso7816SelectIdentifiers: [],
                    feliCaSystemCodes: []
                ),
                delegate: self,
                queue: nil
            )
        }
        return NFCTagReaderSession(pollingOption: polling, delegate: self, queue: nil)
    }

    private func resumeRead(returning info: TagInfo? = nil, throwing error: Error? = nil) {
        guard let continuation = readContinuation else { return }
        readContinuation = nil
        if let error {
            continuation.resume(throwing: error)
        } else if let info {
            continuation.resume(returning: info)
        }
    }

    private func resumeWrite(throwing error: Error? = nil) {
        guard let continuation = writeContinuation else { return }
        writeContinuation = nil
        if let error {
            continuation.resume(throwing: error)
        } else {
            continuation.resume()
        }
    }

    private func finishSession(alert: String? = nil, errorMessage: String? = nil) {
        guard !operationFinished else { return }
        operationFinished = true
        if let alert {
            session?.alertMessage = alert
        }
        if let errorMessage {
            session?.invalidate(errorMessage: errorMessage)
        } else {
            session?.invalidate()
        }
        session = nil
    }

    // MARK: - Tag handling

    private func handleDetectedTag(_ tag: NFCTag) {
        guard let session else { return }
        let boxedTag = SendableBox(tag)
        session.connect(to: tag) { [weak self] error in
            guard let self else { return }
            if let error {
                self.failOperation(error: error)
                return
            }
            switch self.pendingMode {
            case .read:
                self.readConnectedTag(boxedTag.value)
            case let .write(records):
                self.writeConnectedTag(boxedTag.value, records: records)
            }
        }
    }

    private func readConnectedTag(_ tag: NFCTag) {
        session?.alertMessage = "Reading tag…"
        let uid = Self.uid(of: tag)
        let techList = Self.techList(of: tag)

        guard let ndefTag = Self.ndefTag(of: tag) else {
            let info = TagInfo(
                uid: uid,
                techList: techList,
                isWritable: false,
                isNdefFormattable: false,
                maxSize: 0,
                usedSize: 0,
                ndefRecords: []
            )
            resumeRead(returning: info)
            finishSession(alert: "Tag read")
            return
        }

        let boxedNdefTag = SendableBox(ndefTag)
        ndefTag.queryNDEFStatus { status, capacity, error in
            if error != nil || status == .notSupported {
                let info = TagInfo(
                    uid: uid,
                    techList: techList,
                    isWritable: false,
                    isNdefFormattable: false,
                    maxSize: capacity,
                    usedSize: 0,
                    ndefRecords: []
                )
                self.resumeRead(returning: info)
                self.finishSession(alert: "Tag read")
                return
            }

            boxedNdefTag.value.readNDEF { message, readError in
                if let readError {
                    self.failOperation(error: readError)
                    return
                }
                let payloads = message?.records ?? []
                let records = payloads.map { NdefCodec.record(from: Self.convert($0)) }
                let usedSize = payloads.reduce(0) {
                    $0 + $1.payload.count + $1.type.count + $1.identifier.count + 3
                }
                let info = TagInfo(
                    uid: uid,
                    techList: techList,
                    isWritable: status == .readWrite,
                    isNdefFormattable: status == .readWrite,
                    maxSize: capacity,
                    usedSize: usedSize,
                    ndefRecords: records
                )
                self.resumeRead(returning: info)
                self.finishSession(alert: "Tag read")
            }
        }
    }

    private func writeConnectedTag(_ tag: NFCTag, records: [NdefRecord]) {
        guard let ndefTag = Self.ndefTag(of: tag) else {
            resumeWrite(throwing: NfcError.tagNotNdef)
            finishSession(errorMessage: "Tag does not support NDEF")
            return
        }

        session?.alertMessage = "Writing tag…"
        let nfcPayloads = records.map { record -> NFCNDEFPayload in
            let payload = NdefCodec.payload(for: record)
            return NFCNDEFPayload(
                format: payload.tnf.nfcFormat,
                type: payload.type,
                identifier: payload.identifier,
                payload: payload.payload
            )
        }
        let message = NFCNDEFMessage(records: nfcPayloads)

        ndefTag.writeNDEF(message) { error in
            if let error {
                self.resumeWrite(throwing: NfcError.failed(error.localizedDescription))
                self.finishSession(errorMessage: "Write failed")
            } else {
                self.resumeWrite()
                self.finishSession(alert: "Write complete")
            }
        }
    }

    private func failOperation(error: Error) {
        let mapped = Self.mapError(error)
        if pendingMode == .read {
            resumeRead(throwing: mapped)
        } else {
            resumeWrite(throwing: mapped)
        }
        finishSession(errorMessage: error.localizedDescription)
    }

    // MARK: - Error mapping

    private static func mapError(_ error: Error) -> Error {
        if let nfcError = error as? NFCReaderError,
           nfcError.code == .readerSessionInvalidationErrorUserCanceled
        {
            return NfcError.cancelled
        }
        return error
    }

    // MARK: - Tag inspection helpers (Android: TagTechInspector)

    /// `NFCTag` is a Swift enum wrapping per-technology protocol
    /// existentials; NDEF capability lives on the underlying object.
    private static func ndefTag(of tag: NFCTag) -> (any NFCNDEFTag)? {
        let underlying: Any
        switch tag {
        case let .feliCa(t): underlying = t
        case let .iso7816(t): underlying = t
        case let .iso15693(t): underlying = t
        case let .miFare(t): underlying = t
        @unknown default: return nil
        }
        return underlying as? NFCNDEFTag
    }

    private static func uid(of tag: NFCTag) -> String {
        let identifier: Data?
        switch tag {
        case let .iso7816(t): identifier = t.identifier
        case let .miFare(t): identifier = t.identifier
        case let .iso15693(t): identifier = t.identifier
        case .feliCa: identifier = nil
        @unknown default: identifier = nil
        }
        guard let identifier, !identifier.isEmpty else { return "" }
        return identifier.map { String(format: "%02X", $0) }.joined()
    }

    private static func techList(of tag: NFCTag) -> [String] {
        var names: [String]
        switch tag {
        case .iso15693: names = ["ISO15693"]
        case .feliCa: names = ["FeliCa"]
        case .iso7816: names = ["ISO14443-4"]
        case .miFare: names = ["MIFARE"]
        @unknown default: names = ["Unknown"]
        }
        if ndefTag(of: tag) != nil {
            names.append("NDEF")
        }
        return names
    }

    private static func convert(_ payload: NFCNDEFPayload) -> NdefPayload {
        NdefPayload(
            tnf: NdefPayload.TypeNameFormat(nfcFormat: payload.typeNameFormat),
            type: payload.type,
            identifier: payload.identifier,
            payload: payload.payload
        )
    }
}

/// Boxes a non-Sendable CoreNFC object captured by a `@Sendable` completion.
/// The value is only used on the session's serial callback queue.
private struct SendableBox<T>: @unchecked Sendable {
    let value: T
    init(_ value: T) {
        self.value = value
    }
}

// MARK: - NFCTagReaderSessionDelegate

extension NfcService: NFCTagReaderSessionDelegate {
    func tagReaderSessionDidBecomeActive(_: NFCTagReaderSession) {}

    func tagReaderSession(_ session: NFCTagReaderSession, didDetect tags: [NFCTag]) {
        guard let tag = tags.first else {
            session.invalidate()
            return
        }
        handleDetectedTag(tag)
    }

    func tagReaderSession(_: NFCTagReaderSession, didInvalidateWithError error: Error) {
        session = nil

        // Reaching here with a pending continuation means the session was
        // torn down before the operation completed (user cancel, timeout,
        // or system invalidation). Operations that finished normally have
        // already resumed and cleared their continuations.
        guard readContinuation != nil || writeContinuation != nil else { return }
        let mapped = Self.mapError(error)
        resumeRead(throwing: mapped)
        resumeWrite(throwing: mapped)
    }
}

// MARK: - TNF bridging

extension NdefPayload.TypeNameFormat {
    /// CoreNFC `NFCTypeNameFormat` equivalent.
    var nfcFormat: NFCTypeNameFormat {
        switch self {
        case .empty: .empty
        case .wellKnown: .nfcWellKnown
        case .media: .media
        case .absoluteURI: .absoluteURI
        case .external: .nfcExternal
        case .unknown: .unknown
        case .unchanged: .unchanged
        }
    }

    init(nfcFormat: NFCTypeNameFormat) {
        switch nfcFormat {
        case .empty: self = .empty
        case .nfcWellKnown: self = .wellKnown
        case .media: self = .media
        case .absoluteURI: self = .absoluteURI
        case .nfcExternal: self = .external
        case .unknown: self = .unknown
        case .unchanged: self = .unchanged
        default: self = .unknown
        }
    }
}
