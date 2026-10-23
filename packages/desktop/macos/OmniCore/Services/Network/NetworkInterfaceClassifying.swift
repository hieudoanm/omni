/// Resolves the link type of a BSD network interface name.
public protocol NetworkInterfaceClassifying: Sendable {
    func kind(for name: String) -> NetworkInterfaceKind
}
