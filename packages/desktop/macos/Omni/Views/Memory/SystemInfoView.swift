import OmniCore
import SwiftUI

struct SystemInfoView: View {
    let info: SystemInfo?

    var body: some View {
        if let info {
            Text("\(info.chip) · \(info.coresText) · \(info.uptimeText)")
                .font(.caption)
                .lineLimit(1)
                .truncationMode(.tail)
                .foregroundColor(.secondary)
        }
    }
}
