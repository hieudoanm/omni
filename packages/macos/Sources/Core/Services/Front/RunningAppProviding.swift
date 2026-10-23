/// Discover what running applications can be brought to the front.
public protocol RunningAppProviding {
    /// Returns the running user-facing applications, sorted by name.
    func runningApps() -> [RunningAppInfo]

    /// Brings all of the given app's windows to the front.
    func bringAllWindowsToFront(for app: RunningAppInfo)
}
