import OmniCore
import SwiftUI

extension Color {
    init(usageThreshold: UsageThreshold) {
        switch usageThreshold {
        case .normal: self = .secondary
        case .elevated: self = .orange
        case .high: self = .red
        }
    }
}
