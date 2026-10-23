import Foundation
@testable import OmniCore
import Testing

@Suite("NormalizedRect")
struct NormalizedRectTests {
    @Test("holds coordinates")
    func values() {
        let rect = NormalizedRect(x: 0.25, y: 0.5, width: 0.5, height: 0.25)
        #expect(rect.x == 0.25)
        #expect(rect.y == 0.5)
        #expect(rect.width == 0.5)
        #expect(rect.height == 0.25)
    }

    @Test("equality compares all components")
    func equality() {
        let a = NormalizedRect(x: 0, y: 0, width: 1, height: 1)
        let b = NormalizedRect(x: 0, y: 0, width: 1, height: 1)
        let c = NormalizedRect(x: 0, y: 0, width: 1, height: 0.5)
        #expect(a == b)
        #expect(a != c)
    }

    @Test("Codable roundtrip preserves components")
    func codableRoundtrip() throws {
        let rect = NormalizedRect(x: 0.2, y: 0.1, width: 0.6, height: 0.4)
        let data = try JSONEncoder().encode(rect)
        let decoded = try JSONDecoder().decode(NormalizedRect.self, from: data)
        #expect(decoded == rect)
    }
}
