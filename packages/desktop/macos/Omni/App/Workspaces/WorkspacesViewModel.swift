import OmniCore
import SwiftUI

/// Owns saved workspaces: capture, list, restore, and delete.
@MainActor
final class WorkspacesViewModel: ObservableObject {
    @Published private(set) var workspaces: [Workspace] = []
    @Published private(set) var hasAccessibilityPermission = false
    @Published private(set) var isRestoring = false
    @Published private(set) var restoreMessage: String?

    private let store: any WorkspaceStoring
    private let capturer: any WorkspaceCapturing
    private let restorer: any WorkspaceRestoring
    private let accessibility: AccessibilityManager

    init(
        store: any WorkspaceStoring = WorkspaceStore.shared,
        capturer: any WorkspaceCapturing = WorkspaceCaptureService(),
        restorer: any WorkspaceRestoring = WorkspaceRestoreService(),
        accessibility: AccessibilityManager = .shared
    ) {
        self.store = store
        self.capturer = capturer
        self.restorer = restorer
        self.accessibility = accessibility
    }

    func refresh() {
        workspaces = store.workspaces
    }

    func saveCurrentWorkspace(name: String) {
        let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        let workspace = capturer.captureCurrentWorkspace(name: trimmed)
        store.save(workspace)
        refresh()
    }

    func remove(_ workspace: Workspace) {
        store.deleteWorkspace(id: workspace.id)
        refresh()
    }

    func restore(_ workspace: Workspace) {
        guard !isRestoring else { return }
        guard hasAccessibilityPermission else {
            restoreMessage = "Accessibility permission is required to arrange windows."
            return
        }
        isRestoring = true
        restoreMessage = nil

        let restorer = self.restorer
        Task.detached(priority: .userInitiated) {
            let result = await restorer.restore(workspace)
            await MainActor.run {
                self.isRestoring = false
                self.restoreMessage = Self.summary(for: workspace, result: result)
            }
        }
    }

    func checkAccessibilityPermission() {
        hasAccessibilityPermission = accessibility.isAccessibilityEnabled
    }

    func requestAccessibilityPermission() {
        accessibility.requestAccessibilityPermission()
        Task { @MainActor in
            try? await Task.sleep(for: .seconds(1))
            checkAccessibilityPermission()
        }
    }

    private static func summary(for workspace: Workspace, result: WorkspaceRestoreResult) -> String {
        if result.totalWindows == 0 {
            return "\"\(workspace.name)\" had no windows to arrange."
        }
        if result.windowsFailed == result.totalWindows {
            return "Could not arrange any of \(result.totalWindows) windows for \"\(workspace.name)\"."
        }
        return "Restored \(result.windowsPlaced) of \(result.totalWindows) windows"
            + (result.failedToLaunchApps.isEmpty
                ? "."
                : "; \(result.failedToLaunchApps.count) apps could not be launched.")
    }
}
