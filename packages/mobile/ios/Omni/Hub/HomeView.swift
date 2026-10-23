import SwiftUI

/// Omni hub — port of the Android `omni` launcher screen. Lists the apps
/// bundled in this build; on iOS that is currently NFC Toolkit only
/// (Focus Blocker has no iOS equivalent and is omitted).
struct HubHomeView: View {
    @Environment(\.hud) private var hud

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 24) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Omni")
                        .hudTitle(32)
                    Text("Your tools, in one place.")
                        .hudBody(14)
                        .foregroundStyle(hud.muted)
                }

                NavigationLink {
                    NfcHomeView()
                } label: {
                    AppCard(
                        title: "NFC Toolkit",
                        description: "Read and write NFC tags.",
                        systemImage: "antenna.radiowaves.left.and.right"
                    )
                }
                .buttonStyle(.plain)
            }
            .padding(24)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .background(hud.background.ignoresSafeArea())
            .navigationBarHidden(true)
        }
    }
}

private struct AppCard: View {
    @Environment(\.hud) private var hud

    let title: String
    let description: String
    let systemImage: String

    var body: some View {
        HStack(spacing: 16) {
            Image(systemName: systemImage)
                .font(.system(size: 24))
                .foregroundStyle(hud.primary)
                .frame(width: 32)

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .hudLabel(16)
                    .foregroundStyle(hud.text)
                Text(description)
                    .hudBody(14)
                    .foregroundStyle(hud.muted)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            Text("Open")
                .hudLabel(14)
                .foregroundStyle(hud.primary)
        }
        .padding(16)
        .background(hud.surface, in: RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(hud.border, lineWidth: 1)
        )
    }
}
