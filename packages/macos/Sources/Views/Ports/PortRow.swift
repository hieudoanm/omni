import OmniCore
import SwiftUI

struct PortRow: View {
    let port: PortInfo
    let onKill: () -> Void
    let onForceKill: () -> Void

    var body: some View {
        HStack(spacing: Spacing.md) {
            Text(String(port.endpoint.port))
                .font(.system(.title3, design: .rounded))
                .fontWeight(.semibold)
                .monospacedDigit()
                .frame(minWidth: 48, alignment: .leading)
                .accessibilityLabel("Port \(port.endpoint.port)")

            VStack(alignment: .leading, spacing: Spacing.hairline) {
                Text(port.processName)
                    .font(.callout)
                    .foregroundColor(.primary)
                    .lineLimit(1)
                Text(secondaryText)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: Spacing.hairline) {
                Text("PID \(port.pid)")
                    .font(.caption)
                    .monospacedDigit()
                    .foregroundColor(.secondary)
                Text(port.endpoint.protocolType.title)
                    .font(.caption2)
                    .foregroundColor(.secondary)
            }
        }
        .padding(.vertical, Spacing.xs)
        .padding(.horizontal, Spacing.compact)
        .contextMenu {
            Button("Copy Address") {
                copy(port.endpoint.addressString)
            }
            Button("Copy Port") {
                copy(String(port.endpoint.port))
            }
            Button("Copy PID") {
                copy(String(port.pid))
            }
            Divider()
            Button("Kill Process", role: .destructive) {
                onKill()
            }
            Button("Force Kill", role: .destructive) {
                onForceKill()
            }
        }
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(port.endpoint.port), \(port.processName)\(accessibilityPID)")
    }

    private var secondaryText: String {
        port.command
            ?? port.executablePath
            ?? port.workingDirectory
            ?? port.endpoint.addressString
    }

    private var accessibilityPID: String {
        " PID \(port.pid)"
    }

    private func copy(_ text: String) {
        NSPasteboard.general.clearContents()
        NSPasteboard.general.setString(text, forType: .string)
    }
}
