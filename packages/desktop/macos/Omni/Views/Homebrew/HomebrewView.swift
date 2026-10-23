import OmniCore
import SwiftUI

/// The Applications Manager content, hosted in the dashboard window's detail
/// column. Navigation lives in the window sidebar, so this view only renders the
/// selected destination.
struct HomebrewView: View {
    @ObservedObject var viewModel: HomebrewViewModel

    let section: HomebrewViewModel.Section

    var body: some View {
        Group {
            if viewModel.homebrewMissing {
                HomebrewMissingView(onRetry: { Task { await viewModel.checkHomebrew() } })
            } else {
                detail
            }
        }
        .task {
            await viewModel.startIfNeeded()
        }
        .alert("Homebrew", isPresented: alertPresented) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(viewModel.errorMessage ?? "")
        }
    }

    @ViewBuilder
    private var detail: some View {
        switch section {
        case .apps:
            BrewAppsView(viewModel: viewModel)
        case .discover:
            DiscoverView(viewModel: viewModel)
        case .installed:
            InstalledView(viewModel: viewModel)
        case .updates:
            UpdatesView(viewModel: viewModel)
        case .services:
            ServicesView(viewModel: viewModel)
        }
    }

    private var alertPresented: Binding<Bool> {
        Binding(
            get: { viewModel.errorMessage != nil },
            set: {
                if !$0 {
                    viewModel.errorMessage = nil
                }
            }
        )
    }
}
