import OmniCore
import SwiftUI

private enum KillRequest {
    case kill(PortInfo)
    case forceKill(PortInfo)

    var port: PortInfo {
        switch self {
        case let .kill(port), let .forceKill(port):
            return port
        }
    }

    var isForce: Bool {
        if case .forceKill = self {
            return true
        }
        return false
    }
}

/// Listening ports section within the Network tab.
struct PortsSectionView: View {
    @ObservedObject var viewModel: PortsViewModel

    @State private var pendingKill: KillRequest?
    @State private var killError: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            searchField

            Divider()

            PortListView(
                ports: viewModel.filteredPorts,
                isFiltering: viewModel.isFiltering,
                isLoading: viewModel.isLoading,
                errorMessage: viewModel.errorMessage,
                onKill: { pendingKill = .kill($0) },
                onForceKill: { pendingKill = .forceKill($0) }
            )
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .task {
            viewModel.start()
        }
        .confirmationDialog(
            killDialogTitle,
            isPresented: killDialogPresented,
            titleVisibility: .visible
        ) {
            Button(killActionTitle, role: .destructive) {
                confirmPendingKill()
            }
            Button("Cancel", role: .cancel) {
                pendingKill = nil
            }
        } message: {
            Text(killDialogMessage)
        }
        .alert("Kill Failed", isPresented: killAlertPresented) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(killError ?? "")
        }
    }

    private var searchField: some View {
        HStack(spacing: Spacing.xs) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.secondary)
                .accessibilityHidden(true)
            TextField("Search port, process, PID", text: $viewModel.searchQuery)
                .textFieldStyle(.plain)
                .font(.system(.body, design: .monospaced))
            if !viewModel.searchQuery.isEmpty {
                Button {
                    viewModel.searchQuery = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.secondary)
                        .accessibilityLabel("Clear search")
                }
                .buttonStyle(.borderless)
                .help("Clear search")
            }
        }
        .padding(.vertical, Spacing.sm)
    }

    private var killDialogPresented: Binding<Bool> {
        Binding(
            get: { pendingKill != nil },
            set: {
                if !$0 {
                    pendingKill = nil
                }
            }
        )
    }

    private var killAlertPresented: Binding<Bool> {
        Binding(
            get: { killError != nil },
            set: {
                if !$0 {
                    killError = nil
                }
            }
        )
    }

    private var killDialogTitle: String {
        guard let request = pendingKill else { return "" }
        let port = request.port
        let prefix = request.isForce ? "Force Kill" : "Kill"
        return "\(prefix) \(port.processName) (PID \(port.pid))?"
    }

    private var killActionTitle: String {
        pendingKill?.isForce == true ? "Force Kill" : "Kill"
    }

    private var killDialogMessage: String {
        pendingKill?.isForce == true
            ? "Sends SIGKILL and ends the process immediately. Unsaved work may be lost."
            : "Sends SIGTERM to request a graceful shutdown."
    }

    private func confirmPendingKill() {
        guard let request = pendingKill else { return }
        do {
            try viewModel.terminate(request.port, force: request.isForce)
        } catch {
            killError = Self.killErrorMessage(for: error, request: request)
        }
        pendingKill = nil
    }

    private static func killErrorMessage(for error: Error, request: KillRequest) -> String {
        let port = request.port
        let action = request.isForce ? "force kill" : "kill"
        if let terminationError = error as? ProcessTerminationError {
            switch terminationError {
            case .invalidPID:
                return "Invalid process ID (PID \(port.pid))."
            case .refusedToKillAppProcess:
                return "Cannot kill Omni itself."
            case .killFailed:
                return request.isForce
                    ? "Unable to \(action) \(port.processName) (PID \(port.pid))."
                    : "Unable to \(action) \(port.processName) (PID \(port.pid)). Try Force Kill."
            }
        }
        return "Unable to \(action) \(port.processName) (PID \(port.pid))."
    }
}
