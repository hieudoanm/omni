import OmniCore
import SwiftUI

struct AppsListView: View {
    let apps: [RunningAppInfo]
    let onSelect: (RunningAppInfo) -> Void

    var body: some View {
        ScrollView {
            LazyVStack(alignment: .leading, spacing: 0) {
                ForEach(apps) { app in
                    AppRow(
                        app: app,
                        onSelect: { onSelect(app) }
                    )
                    if app.id != apps.last?.id {
                        Divider()
                    }
                }
            }
        }
        .frame(maxHeight: .infinity)
    }
}
