import OmniCore
import SwiftUI

/// Saved workspaces section within the Apps tab.
struct WorkspacesSectionView: View {
    @ObservedObject var viewModel: WorkspacesViewModel

    @State private var showingSaveDialog = false
    @State private var newWorkspaceName = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            actionRow

            Divider()

            if !viewModel.hasAccessibilityPermission {
                permissionBanner
                Divider()
            }

            if viewModel.isRestoring {
                restoringBanner
                Divider()
            } else if let message = viewModel.restoreMessage {
                messageBanner(message)
                Divider()
            }

            if viewModel.workspaces.isEmpty {
                emptyState
            } else {
                workspaceList
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .onAppear {
            viewModel.refresh()
            viewModel.checkAccessibilityPermission()
        }
        .alert("Save Workspace", isPresented: $showingSaveDialog) {
            TextField("Workspace name", text: $newWorkspaceName)
            Button("Save") {
                viewModel.saveCurrentWorkspace(name: newWorkspaceName)
                newWorkspaceName = ""
            }
            Button("Cancel", role: .cancel) {
                newWorkspaceName = ""
            }
        } message: {
            Text("Captures running apps and their window positions on all displays.")
        }
    }

    private var actionRow: some View {
        HStack {
            Text("\(viewModel.workspaces.count) saved")
                .font(.caption)
                .monospacedDigit()
                .foregroundColor(.secondary)
            Spacer()
            Button {
                showingSaveDialog = true
            } label: {
                Image(systemName: "square.and.arrow.down")
                    .frame(width: 24, height: 24)
                    .contentShape(Rectangle())
                    .accessibilityLabel("Save Current Workspace")
            }
            .buttonStyle(.borderless)
            .help("Save Current Workspace")
        }
        .padding(.vertical, Spacing.sm)
    }

    private var permissionBanner: some View {
        HStack(spacing: Spacing.sm) {
            Image(systemName: "hand.raised.fill")
                .foregroundColor(.orange)
                .accessibilityHidden(true)
            Text("Accessibility permission is needed to arrange windows.")
                .font(.caption)
                .foregroundColor(.secondary)
            Spacer()
            Button("Grant") {
                viewModel.requestAccessibilityPermission()
            }
            .controlSize(.small)
        }
        .padding(.vertical, Spacing.sm)
    }

    private var restoringBanner: some View {
        HStack(spacing: Spacing.sm) {
            ProgressView()
                .controlSize(.small)
            Text("Restoring workspace…")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, Spacing.sm)
    }

    private func messageBanner(_ message: String) -> some View {
        HStack(spacing: Spacing.sm) {
            Image(systemName: "info.circle")
                .foregroundColor(.secondary)
                .accessibilityHidden(true)
            Text(message)
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, Spacing.sm)
    }

    private var workspaceList: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 0) {
                ForEach(viewModel.workspaces) { workspace in
                    WorkspaceRow(
                        workspace: workspace,
                        onRestore: { viewModel.restore(workspace) }
                    )
                    .contextMenu {
                        Button("Restore") {
                            viewModel.restore(workspace)
                        }
                        Divider()
                        Button("Delete", role: .destructive) {
                            viewModel.remove(workspace)
                        }
                    }
                    if workspace.id != viewModel.workspaces.last?.id {
                        Divider()
                    }
                }
            }
        }
        .frame(maxHeight: .infinity)
    }

    private var emptyState: some View {
        VStack(spacing: Spacing.sm) {
            Image(systemName: "square.grid.2x2")
                .font(Typography.emptyStateIcon)
                .foregroundColor(.secondary)
                .accessibilityHidden(true)
            Text("No saved workspaces")
                .font(.headline)
            Text("Save your current apps and window positions, then restore them with one click.")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, Spacing.huge)
        .accessibilityElement(children: .combine)
    }
}
