import Foundation
import OmniCore

/// Captures the current on-screen windows into a named workspace.
struct WorkspaceCaptureService: WorkspaceCapturing {
    private let lister: any WindowListing
    private let screens: ScreenManager

    init(lister: any WindowListing = CoreGraphicsWindowLister(), screens: ScreenManager = .shared) {
        self.lister = lister
        self.screens = screens
    }

    func captureCurrentWorkspace(name: String) -> Workspace {
        let currentScreens = screens.screens
        let windows = lister.listWindows().compactMap {
            WorkspaceWindowBuilder.window(from: $0, screens: currentScreens)
        }
        return Workspace(name: name, windows: windows)
    }
}
