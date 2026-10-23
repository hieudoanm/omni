@testable import OmniCore
import XCTest

final class HomebrewServiceTests: XCTestCase {
    private func makeService(_ responses: [String: ProcessResult]) -> HomebrewService {
        HomebrewService(client: MockBrewClient(responses: responses))
    }

    // MARK: - Detection

    func testIsHomebrewAvailableWhenVersionSucceeds() async {
        let service = makeService(["--version": MockBrewClient.success(stdout: "Homebrew 6.0.20")])
        let available = await service.isHomebrewAvailable()
        XCTAssertTrue(available)
    }

    func testIsHomebrewAvailableWhenVersionFails() async {
        let service = makeService(["--version": ProcessResult(stdout: "", stderr: "not found", exitCode: 127)])
        let available = await service.isHomebrewAvailable()
        XCTAssertFalse(available)
    }

    // MARK: - Installed

    func testListInstalledGathersFormulaeAndCasks() async throws {
        let service = makeService([
            "list": MockBrewClient.success(stdout: "node\ngit"),
            "outdated": MockBrewClient.success(stdout: "{\"formulae\":[],\"casks\":[]}"),
        ])
        // MockBrewClient keys on first argument only, so both list calls match "list".
        let packages = try await service.listInstalled()
        XCTAssertEqual(packages.count, 4)
        XCTAssertEqual(packages.filter { $0.type == .formula }.count, 2)
        XCTAssertEqual(packages.filter { $0.type == .cask }.count, 2)
        XCTAssertTrue(packages.allSatisfy { $0.status == .installed })
    }

    // MARK: - Search

    func testSearchReturnsFormulaAndCaskMatches() async throws {
        let service = makeService([
            "search": MockBrewClient.success(stdout: "postgresql\npostgresql@17"),
        ])
        let results = try await service.search(query: "postgres")
        XCTAssertEqual(results.count, 4)
        XCTAssertEqual(results.filter { $0.type == .formula }.count, 2)
        XCTAssertEqual(results.filter { $0.type == .cask }.count, 2)
    }

    func testSearchRejectsBlankQuery() async throws {
        let service = makeService([:])
        let results = try await service.search(query: "   ")
        XCTAssertTrue(results.isEmpty)
    }

    // MARK: - Invalid names

    func testInstallValidatesPackageName() async {
        let service = makeService([:])
        do {
            _ = try await service.install(name: "node; rm -rf ~", type: .formula)
            XCTFail("Expected invalid name error")
        } catch {
            guard case BrewError.invalidPackageName = error else {
                return XCTFail("Expected invalidPackageName, got \(error)")
            }
        }
    }

    // MARK: - Cask index

    func testInstalledCaskIndexMapsAppsToTokens() async throws {
        let service = makeService([
            "list": MockBrewClient.success(stdout: "firefox\ndocker"),
            "info": MockBrewClient.success(stdout: """
            {
              "casks": [
                {
                  "token": "firefox",
                  "bundle_id": "org.mozilla.firefox",
                  "artifacts": [{ "app": ["/Applications/Firefox.app"] }]
                },
                {
                  "token": "docker",
                  "artifacts": [{ "app": ["Docker.app"] }]
                }
              ]
            }
            """),
        ])

        let index = try await service.installedCaskIndex()

        let byPath = InstalledApp(name: "Firefox", path: "/Applications/Firefox.app")
        XCTAssertEqual(index.token(for: byPath), "firefox")

        let byBundleID = InstalledApp(
            name: "Firefox",
            path: "/Applications/Firefox.app",
            bundleIdentifier: "org.mozilla.firefox"
        )
        XCTAssertEqual(index.token(for: byBundleID), "firefox")

        let unresolved = InstalledApp(name: "Docker", path: "/Applications/Docker.app", caskToken: nil)
        let token = index.token(for: unresolved)
        XCTAssertEqual(token, "docker", "A relative artifact path should normalize to /Applications")
    }

    func testInstalledCaskIndexIsEmptyWhenNoCasks() async throws {
        let service = makeService(["list": MockBrewClient.success(stdout: "")])
        let index = try await service.installedCaskIndex()
        XCTAssertNil(index.token(for: InstalledApp(name: "X", path: "/Applications/X.app")))
    }

    func testInstalledCaskIndexPropagatesCommandFailure() async {
        let service = makeService(["list": ProcessResult(stdout: "", stderr: "boom", exitCode: 1)])
        do {
            _ = try await service.installedCaskIndex()
            XCTFail("Expected failure")
        } catch {
            guard case let BrewError.commandFailed(exitCode, _) = error else {
                return XCTFail("Expected commandFailed, got \(error)")
            }
            XCTAssertEqual(exitCode, 1)
        }
    }

    // MARK: - Command failure

    func testUpgradeAllPropagatesFailure() async {
        let service = makeService([
            "upgrade": ProcessResult(stdout: "", stderr: "some failure", exitCode: 1),
        ])
        do {
            _ = try await service.upgradeAll()
            XCTFail("Expected failure")
        } catch {
            guard case let BrewError.commandFailed(exitCode, _) = error else {
                return XCTFail("Expected commandFailed, got \(error)")
            }
            XCTAssertEqual(exitCode, 1)
        }
    }
}
