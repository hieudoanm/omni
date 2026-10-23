import Foundation
import Observation

/// NFC home screen state — mirrors Android's `HomeUiState`.
enum NfcHomeState: Equatable {
    case waiting
    case scanning
    case success(TagInfo)
    case error(String)
}

@Observable
@MainActor
final class NfcHomeViewModel {
    private(set) var state: NfcHomeState = .waiting
    /// Transient status line (e.g. "Write complete").
    private(set) var notice: String?

    /// Persist hook — the view wires this to SwiftData history storage.
    var onTagScanned: (@MainActor (TagInfo) -> Void)?

    let service: NfcService

    init(service: NfcService = NfcService()) {
        self.service = service
    }

    var nfcAvailable: Bool {
        NfcService.isAvailable
    }

    /// Start a read scan (Android: ambient tag detection; iOS: user-initiated).
    func scan() {
        guard state != .scanning else { return }
        notice = nil
        state = .scanning
        Task {
            do {
                let info = try await service.readTag()
                state = .success(info)
                onTagScanned?(info)
            } catch {
                state = Self.isCancellation(error) ? .waiting : .error(error.localizedDescription)
            }
        }
    }

    /// Write composed records to a tag.
    func write(_ records: [NdefRecord]) {
        guard !records.isEmpty, state != .scanning else { return }
        notice = nil
        state = .scanning
        Task {
            do {
                try await service.writeTag(records)
                state = .waiting
                notice = "Write complete"
            } catch {
                state = Self.isCancellation(error)
                    ? .waiting
                    : .error(error.localizedDescription)
            }
        }
    }

    /// Back to the idle "scan" prompt (Android: resetState).
    func reset() {
        service.cancelScan()
        state = .waiting
        notice = nil
    }

    private static func isCancellation(_ error: Error) -> Bool {
        error is CancellationError || (error as? NfcError) == .cancelled
    }
}
