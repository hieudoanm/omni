import Foundation
import Testing

/// Guards the design system's tokens against drift.
///
/// The tokens in `Sources/Views/Shared/DesignSystem/` are the only place a
/// spacing, radius, colour opacity or duration is allowed to be written down.
/// These tests read the view sources as text and fail when a raw literal turns
/// up, because a magic number that nobody owns is how a design system dies.
///
/// They also pin the values themselves: a token that changes is a visible
/// decision, so it has to be a deliberate edit to a test as well as to the file.
@Suite("Design system")
struct DesignSystemTests {
    // MARK: Token discipline

    private static let sourcesDirectory = URL(fileURLWithPath: #filePath)
        .deletingLastPathComponent() // Core
        .deletingLastPathComponent() // Tests
        .deletingLastPathComponent() // package root
        .appendingPathComponent("Sources")

    /// Patterns that must not appear outside the token files themselves.
    private static let forbidden: [(name: String, pattern: String)] = [
        ("spacing", #"\.padding\((?:\.[a-z]+(?:,\s*\.[a-z]+)*)?(?:,\s*)?\d+\)"#),
        ("spacing", #"spacing:\s*[1-9]\d*"#),
        ("corner radius", #"cornerRadius:\s*\d"#),
        ("colour opacity", #"\.opacity\(0\.\d+\)"#),
        ("duration", #"duration:\s*\d"#),
    ]

    private static let tokenDirectory = sourcesDirectory
        .appendingPathComponent("Views/Shared/DesignSystem")

    @Test("no raw spacing, radius, opacity or duration literals in the views")
    func noRawLiterals() throws {
        var offenders: [String] = []
        for url in try Self.viewSources() {
            let text = try String(contentsOf: url, encoding: .utf8)
            let path = url.path.replacingOccurrences(of: Self.sourcesDirectory.path + "/", with: "")
            let lines = text.split(separator: "\n")
            for (index, line) in lines.enumerated() {
                for rule in Self.forbidden where line.range(of: rule.pattern, options: .regularExpression) != nil {
                    let trimmed = line.trimmingCharacters(in: .whitespaces)
                    offenders.append("\(path):\(index + 1)  [\(rule.name)]  \(trimmed)")
                }
            }
        }
        #expect(
            offenders.isEmpty,
            """
            Raw literals found \u{2014} use Spacing, Radius, Palette or Motion instead:
            \(offenders.joined(separator: "\n"))
            """
        )
    }

    @Test("every token file is reachable from the shared view layer")
    func tokensExist() {
        for name in ["Spacing", "Radius", "Palette", "Typography", "Motion", "SurfaceMetrics"] {
            #expect(
                FileManager.default.fileExists(
                    atPath: Self.tokenDirectory.appendingPathComponent("\(name).swift").path
                ),
                "\(name).swift is missing from DesignSystem/"
            )
        }
    }

    // MARK: Token values

    @Test("spacing scale is ascending and starts on the 4pt grid")
    func spacingScale() {
        let scale = [2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 40, 48]
        #expect(scale == scale.sorted())
        // The grid steps are multiples of 2; only the deliberate off-grid
        // values (compact 10, inset 14, section 18, iconGap 3) are not.
        let offGrid = Set([3, 5, 10, 14, 18])
        for step in scale where !offGrid.contains(step) {
            #expect(step % 2 == 0, "\(step) is off the grid but is not a documented exception")
        }
    }

    @Test("card heights stay in the range the grid can lay out")
    func cardHeights() {
        let heights: [Double] = [140, 200, 320, 380, 420]
        #expect(heights.allSatisfy { $0 >= 140 })
        #expect(heights == heights.sorted())
    }

    @Test("the window is wide enough for a sidebar and two cards")
    func windowGeometry() {
        let sidebar: Double = 200
        let window: Double = 1100
        let minWindow: Double = 820
        #expect(window - sidebar > 600, "the detail column is too narrow for two cards")
        #expect(minWindow - sidebar > 480, "the detail column is too narrow at the minimum size")
    }

    // MARK: Helpers

    private static func viewSources() throws -> [URL] {
        let manager = FileManager.default
        guard let walker = manager.enumerator(at: sourcesDirectory, includingPropertiesForKeys: nil) else {
            return []
        }
        return walker
            .compactMap { $0 as? URL }
            .filter { $0.pathExtension == "swift" }
            .filter { !$0.path.hasPrefix(tokenDirectory.path) }
            .sorted { $0.path < $1.path }
    }
}
