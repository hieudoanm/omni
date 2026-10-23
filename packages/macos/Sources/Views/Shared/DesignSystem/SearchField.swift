import SwiftUI

/// The app's search field: a rounded, quiet fill with a clear button.
///
/// One component for every search in the app — the sidebar and the lists that
/// filter themselves — so they look and behave identically. A filter over a
/// list is a field like this; a filter that navigates is a sidebar row.
struct SearchField: View {
    let prompt: String
    @Binding var text: String

    var body: some View {
        HStack(spacing: Spacing.xs) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(.secondary)
                .accessibilityHidden(true)
            TextField(prompt, text: $text)
                .textFieldStyle(.plain)
                .accessibilityLabel(prompt)
            if !text.isEmpty {
                Button {
                    text = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(.secondary)
                        .accessibilityLabel("Clear search")
                }
                .buttonStyle(.borderless)
            }
        }
        .padding(Spacing.sm)
        .background(Palette.quietFill, in: RoundedRectangle(cornerRadius: Radius.medium))
    }
}
