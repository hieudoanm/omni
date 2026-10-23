import Foundation
@testable import OmniCore
import XCTest

final class AppCatalogTests: XCTestCase {
    private var tempDir: URL!

    override func setUp() {
        super.setUp()
        tempDir = FileManager.default.temporaryDirectory
            .appendingPathComponent("BreweryAppCatalog-\(UUID().uuidString)")
        try! FileManager.default.createDirectory(at: tempDir, withIntermediateDirectories: true)
    }

    override func tearDown() {
        try? FileManager.default.removeItem(at: tempDir)
        super.tearDown()
    }

    @discardableResult
    private func makeBundle(named name: String, plist: [String: Any]) throws -> URL {
        let bundle = tempDir.appendingPathComponent(name)
        let contents = bundle.appendingPathComponent("Contents")
        try FileManager.default.createDirectory(at: contents, withIntermediateDirectories: true)
        let data = try PropertyListSerialization.data(fromPropertyList: plist, format: .xml, options: 0)
        try data.write(to: contents.appendingPathComponent("Info.plist"))
        return bundle
    }

    private func simplePlist(name: String, identifier: String, category: String? = nil) -> [String: Any] {
        var plist: [String: Any] = [
            "CFBundleDisplayName": name,
            "CFBundleIdentifier": identifier,
            "CFBundleShortVersionString": "1.2.3",
        ]
        if let category {
            plist["LSApplicationCategoryType"] = category
        }
        return plist
    }

    func testEnumeratesTopLevelAndNestedApps() throws {
        try makeBundle(named: "Firefox.app", plist: simplePlist(name: "Firefox", identifier: "org.mozilla.firefox"))
        try makeBundle(
            named: "Utilities/Disk Utility.app",
            plist: simplePlist(name: "Disk Utility", identifier: "com.apple.DiskUtility")
        )
        try makeBundle(named: "Some App.app", plist: ["CFBundleIdentifier": "no.display.name"])

        let apps = AppCatalog.enumerateApps(in: [tempDir])

        XCTAssertEqual(Set(apps.map(\.name)), Set(["Firefox", "Disk Utility", "Some App"]))
        XCTAssertEqual(apps.first(where: { $0.name == "Firefox" })?.bundleIdentifier, "org.mozilla.firefox")
        XCTAssertEqual(apps.first(where: { $0.name == "Firefox" })?.version, "1.2.3")
    }

    func testReadsFunctionalCategoryFromPlist() throws {
        try makeBundle(
            named: "Code.app",
            plist: simplePlist(name: "Code", identifier: "com.example.Code", category: "public.app-category.developer-tools")
        )
        try makeBundle(
            named: "Player.app",
            plist: simplePlist(name: "Player", identifier: "com.example.Player", category: "public.app-category.video")
        )

        let apps = AppCatalog.enumerateApps(in: [tempDir])

        XCTAssertEqual(apps.first(where: { $0.name == "Code" })?.category, .developerTools)
        XCTAssertEqual(apps.first(where: { $0.name == "Player" })?.category, .video)
    }

    func testUnknownCategoryFallsBackToUncategorized() throws {
        try makeBundle(
            named: "Mystery.app",
            plist: simplePlist(name: "Mystery", identifier: "com.example.Mystery", category: "public.app-category.time-travel")
        )

        let apps = AppCatalog.enumerateApps(in: [tempDir])

        XCTAssertEqual(apps.first?.category, .uncategorized)
    }

    func testIgnoresNonAppFiles() throws {
        let text = tempDir.appendingPathComponent("notes.txt")
        try Data("hello".utf8).write(to: text)
        FileManager.default.createFile(atPath: tempDir.appendingPathComponent("Some App").path, contents: nil)

        let apps = AppCatalog.enumerateApps(in: [tempDir])

        XCTAssertTrue(apps.isEmpty)
    }
}
