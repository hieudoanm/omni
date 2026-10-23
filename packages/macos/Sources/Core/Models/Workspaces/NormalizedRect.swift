import Foundation

/// A rectangle in 0...1 coordinate space, where (0, 0) is the top-left of a
/// screen's visible frame and `y` grows downward. Keeps saved layouts
/// resolution- and monitor-independent.
public struct NormalizedRect: Codable, Hashable {
    public var x: Double
    public var y: Double
    public var width: Double
    public var height: Double

    public init(x: Double, y: Double, width: Double, height: Double) {
        self.x = x
        self.y = y
        self.width = width
        self.height = height
    }
}
