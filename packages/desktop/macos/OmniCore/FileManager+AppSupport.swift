import Foundation

extension FileManager {
    /// The user's Application Support directory.
    ///
    /// Falls back to `~/Library/Application Support` when the search API
    /// returns an empty result instead of force-unwrapping.
    var applicationSupportDirectoryURL: URL {
        urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? homeDirectoryForCurrentUser.appendingPathComponent(
                "Library/Application Support",
                isDirectory: true
            )
    }
}
