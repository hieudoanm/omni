import AppKit
import OmniCore
import SwiftUI

/// The loaded state of the IP lookup: provider badges and the full detail list.
struct IPDetailsView: View {
    let info: IPInfo
    let vpnDetected: Bool

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: Spacing.xs) {
                badges

                infoSection
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(maxHeight: .infinity)
    }

    private var badges: some View {
        HStack(spacing: Spacing.xs) {
            CapsuleBadge(text: "via \(info.provider)", tint: .secondary, labelColor: .primary)
            if vpnDetected {
                CapsuleBadge(text: "VPN / shared hosting", tint: .orange, labelColor: .orange)
            }
            Spacer()
        }
        .padding(.top, Spacing.xs)
        .accessibilityElement(children: .combine)
        .accessibilityLabel(vpnBadgeAccessibilityLabel)
    }

    private var infoSection: some View {
        VStack(alignment: .leading, spacing: 0) {
            InfoRow(label: "IP", value: info.ip)
            InfoRow(label: "Version", value: info.version)
            InfoRow(label: "ASN", value: info.asn)
            InfoRow(label: "Organization", value: info.org)
            InfoRow(label: "Timezone", value: info.timezone)
            InfoRow(label: "Country", value: info.countryName ?? info.countryCode)
            InfoRow(label: "Region", value: info.region)
            InfoRow(label: "City", value: info.city)
            InfoRow(label: "Postal", value: info.postal)
            InfoRow(label: "Coordinates", value: info.coordinatesText, mono: true)

            if let mapURL = Self.mapURL(latitude: info.latitude, longitude: info.longitude) {
                Button {
                    NSWorkspace.shared.open(mapURL)
                } label: {
                    Label("View on map", systemImage: "square.and.arrow.up")
                        .font(.caption)
                }
                .buttonStyle(.plain)
                .foregroundColor(.accentColor)
                .padding(.top, Spacing.xs)
            }

            DisclosureGroup("Raw JSON") {
                Text(JSONText.string(for: info))
                    .font(.system(.caption, design: .monospaced))
                    .foregroundColor(.secondary)
                    .textSelection(.enabled)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .font(.caption)
            .padding(.top, Spacing.xs)
        }
    }

    private var vpnBadgeAccessibilityLabel: String {
        vpnDetected
            ? "Provider \(info.provider). VPN or shared hosting detected."
            : "Provider \(info.provider)."
    }

    private static func mapURL(latitude: String?, longitude: String?) -> URL? {
        guard let latitude, let longitude, !latitude.isEmpty, !longitude.isEmpty else { return nil }
        return URL(string: "https://www.openstreetmap.org/?mlat=\(latitude)&mlon=\(longitude)&zoom=12")
    }
}
