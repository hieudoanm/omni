import OmniCore
import SwiftUI

struct HomebrewMissingView: View {
    let onRetry: () -> Void

    var body: some View {
        VStack(spacing: Spacing.inset) {
            Image(systemName: "exclamationmark.triangle")
                .font(Typography.emptyStateIconLarge)
                .foregroundStyle(.orange)
            Text("Homebrew not found")
                .font(.title.bold())
            Text("Omni requires Homebrew to manage packages.")
                .foregroundStyle(.secondary)
            HStack(spacing: Spacing.md) {
                Button("Retry", action: onRetry)
                Link("Learn More", destination: URL(string: "https://brew.sh")!)
            }
            .padding(.top, Spacing.sm)
        }
        .padding(Spacing.huge)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
