import Foundation

/// Raw NDEF payload fields — the iOS counterpart of Android's `NdefRecord`
/// (tnf / type / payload). Kept free of CoreNFC so the codec stays testable.
struct NdefPayload: Equatable {
    /// NDEF Type Name Format values (TNF).
    enum TypeNameFormat: Int, Sendable {
        case empty = 0x00
        case wellKnown = 0x01
        case media = 0x02
        case absoluteURI = 0x03
        case external = 0x04
        case unknown = 0x05
        case unchanged = 0x06
    }

    var tnf: TypeNameFormat
    var type: Data
    var identifier: Data
    var payload: Data

    init(tnf: TypeNameFormat, type: Data, identifier: Data = Data(), payload: Data) {
        self.tnf = tnf
        self.type = type
        self.identifier = identifier
        self.payload = payload
    }
}
