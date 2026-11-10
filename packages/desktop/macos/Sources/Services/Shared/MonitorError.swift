import Foundation

public enum MonitorError: Error {
    case unableToReadMemory
    case unableToReadSwap
    case unableToReadCPU
    case unableToReadMemoryPressure
    case unableToReadNetwork
    case unableToReadBattery
    case unavailableFileSystem
}
