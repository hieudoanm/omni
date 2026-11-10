@testable import OmniCore
import XCTest

final class PackageModelTests: XCTestCase {
    func testPackageIdentifiesByType() {
        let formula = Package(name: "node", type: .formula)
        XCTAssertEqual(formula.type, .formula)
        XCTAssertEqual(formula.id, "node")
    }

    func testFormulaAndCaskAreDistinct() {
        let node = Package(name: "node", type: .formula)
        let firefox = Package(name: "firefox", type: .cask)
        XCTAssertNotEqual(node.type, firefox.type)
    }

    func testInstalledStatusReflectsInstalledTrue() {
        let installed = Package(name: "git", type: .formula, status: .installed)
        let notInstalled = Package(name: "jq", type: .formula, status: .notInstalled)
        XCTAssertTrue(installed.status.installed)
        XCTAssertFalse(notInstalled.status.installed)
    }

    func testOutdatedIsInstalled() {
        let outdated = Package(name: "node", type: .formula, status: .outdated)
        XCTAssertTrue(outdated.status.installed)
    }

    func testInstalledVersionStringDefaultsToNotInstalled() {
        let package = Package(name: "node", type: .formula)
        XCTAssertEqual(package.installedVersionString, "Not installed")
    }

    func testInstalledVersionStringReflectsInstalledVersion() {
        let package = Package(
            name: "node", type: .formula, installedVersion: "22.15.0", status: .installed
        )
        XCTAssertEqual(package.installedVersionString, "22.15.0")
    }

    func testPackagesSortByName() {
        let packages = [
            Package(name: "zlib", type: .formula),
            Package(name: "git", type: .formula),
            Package(name: "node", type: .formula),
        ]
        XCTAssertEqual(packages.sorted().map(\.name), ["git", "node", "zlib"])
    }
}
