import SwiftData
import SwiftUI

/// NFC Toolkit home — port of Android's `nfc/ui/home/HomeScreen`.
/// Adds a write composer (text/URI records) since Core NFC supports NDEF
/// writing; Android's `NdefWriter` had no UI counterpart.
struct NfcHomeView: View {
    @Environment(\.hud) private var hud
    @Environment(\.modelContext) private var modelContext
    @Environment(SettingsStore.self) private var settings
    @Environment(\.openURL) private var openURL

    @State private var viewModel = NfcHomeViewModel()
    @State private var writeText = ""
    @State private var writeURI = ""

    var body: some View {
        VStack(spacing: 0) {
            if !viewModel.nfcAvailable {
                NfcBanner(text: "NFC not available on this device", color: Color(red: 0.72, green: 0.11, blue: 0.11))
            }

            content
                .frame(maxWidth: .infinity, maxHeight: .infinity)

            if viewModel.state == .waiting {
                writeComposer
                    .padding(.horizontal, 16)
                    .padding(.bottom, 16)
            }
        }
        .background(hud.background.ignoresSafeArea())
        .navigationTitle("NFC Toolkit")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                NavigationLink {
                    HistoryView()
                } label: {
                    Image(systemName: "clock.arrow.circlepath")
                }
            }
            ToolbarItem(placement: .topBarTrailing) {
                NavigationLink {
                    SettingsView()
                } label: {
                    Image(systemName: "gearshape")
                }
            }
        }
        .onAppear {
            viewModel.onTagScanned = { info in
                persist(info)
                if settings.autoOpenUrl, let url = Self.firstURI(in: info), let link = URL(string: url) {
                    openURL(link)
                }
            }
        }
    }

    // MARK: - Content states (Android: WaitingForTag / Reading / Success / Error)

    @ViewBuilder
    private var content: some View {
        switch viewModel.state {
        case .waiting:
            waitingContent
        case .scanning:
            scanningContent
        case let .success(info):
            tagResultContent(info)
        case let .error(message):
            errorContent(message)
        }
    }

    private var waitingContent: some View {
        VStack(spacing: 16) {
            Spacer()
            Image(systemName: "antenna.radiowaves.left.and.right")
                .font(.system(size: 72))
                .foregroundStyle(hud.primary)
                .phaseAnimator([0.3, 1.0]) { view, phase in
                    view.opacity(phase)
                } animation: { _ in
                    .easeInOut(duration: 1.0).repeatForever(autoreverses: true)
                }
            Text("Scan Tag")
                .hudTitle(28)
            Text("Tap Scan, then hold an NFC tag near the top of your iPhone")
                .hudBody(14)
                .foregroundStyle(hud.muted)
                .multilineTextAlignment(.center)
            if let notice = viewModel.notice {
                Text(notice)
                    .hudLabel(14)
                    .foregroundStyle(hud.secondary)
            }
            Button {
                viewModel.scan()
            } label: {
                Text("Scan")
                    .hudLabel(16)
                    .foregroundStyle(hud.background)
                    .padding(.horizontal, 32)
                    .padding(.vertical, 12)
                    .background(hud.primary, in: Capsule())
            }
            .padding(.top, 8)
            Spacer()
        }
        .padding(16)
    }

    private var scanningContent: some View {
        VStack(spacing: 16) {
            Spacer()
            ProgressView()
                .tint(hud.primary)
                .scaleEffect(1.5)
            Text("Scanning…")
                .hudTitle(24)
            Text("Keep the tag near the top of your iPhone")
                .hudBody(14)
                .foregroundStyle(hud.muted)
            Spacer()
        }
    }

    private func tagResultContent(_ info: TagInfo) -> some View {
        ScrollView {
            VStack(spacing: 16) {
                HudCard {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Tag Details")
                            .hudTitle(22)
                        InfoRow(label: "UID", value: info.uid)
                        InfoRow(label: "Technologies", value: info.techList.joined(separator: ", "))
                        InfoRow(label: "Writable", value: info.isWritable ? "Yes" : "No")
                        InfoRow(label: "NDEF Formatable", value: info.isNdefFormattable ? "Yes" : "No")
                        if info.maxSize > 0 {
                            InfoRow(label: "Max NDEF Size", value: "\(info.maxSize) bytes")
                            InfoRow(label: "Used Size", value: "\(info.usedSize) bytes")
                        }
                    }
                }

                if !info.ndefRecords.isEmpty {
                    Text("NDEF Records")
                        .hudLabel(16)
                        .frame(maxWidth: .infinity, alignment: .leading)
                    ForEach(info.ndefRecords.indices, id: \.self) { index in
                        recordCard(index: index, record: info.ndefRecords[index])
                    }
                }

                Text("Tap Scan to read another tag")
                    .hudCaption(12)
                    .foregroundStyle(hud.muted)
                    .frame(maxWidth: .infinity)

                Button {
                    viewModel.reset()
                } label: {
                    Text("Scan Again")
                        .hudLabel(16)
                        .foregroundStyle(hud.primary)
                        .padding(.horizontal, 32)
                        .padding(.vertical, 12)
                        .background(hud.surfaceVariant, in: Capsule())
                        .overlay(Capsule().stroke(hud.border, lineWidth: 1))
                }
            }
            .padding(16)
        }
    }

    private func recordCard(index: Int, record: NdefRecord) -> some View {
        HudCard(padding: 12) {
            VStack(alignment: .leading, spacing: 4) {
                switch record {
                case let .text(text, languageCode):
                    InfoRow(label: "Record \(index)", value: "Text")
                    InfoRow(label: "Language", value: languageCode)
                    InfoRow(label: "Content", value: text)
                case let .uri(uri):
                    InfoRow(label: "Record \(index)", value: "URI")
                    InfoRow(label: "URL", value: uri)
                case let .mime(mimeType, payload):
                    InfoRow(label: "Record \(index)", value: "MIME")
                    InfoRow(label: "Type", value: mimeType)
                    InfoRow(label: "Payload", value: "\(payload.count) bytes")
                case let .aar(packageName):
                    InfoRow(label: "Record \(index)", value: "App Launch")
                    InfoRow(label: "Package", value: packageName)
                case let .unknown(tnf, _, _):
                    InfoRow(label: "Record \(index)", value: "Unknown (TNF: \(tnf))")
                }
            }
        }
    }

    private func errorContent(_ message: String) -> some View {
        VStack(spacing: 16) {
            Spacer()
            Text("Error")
                .hudTitle(24)
                .foregroundStyle(Color.red)
            Text(message)
                .hudBody(14)
                .foregroundStyle(hud.text)
                .multilineTextAlignment(.center)
            Button {
                viewModel.reset()
            } label: {
                Text("Try Again")
                    .hudLabel(16)
                    .foregroundStyle(hud.primary)
            }
            Spacer()
        }
        .padding(16)
    }

    // MARK: - Write composer

    private var writeComposer: some View {
        HudCard {
            VStack(alignment: .leading, spacing: 12) {
                Text("Write to Tag")
                    .hudLabel(16)
                TextField("Text record", text: $writeText)
                    .textFieldStyle(.plain)
                    .hudBody(14)
                    .padding(10)
                    .background(hud.surfaceVariant, in: RoundedRectangle(cornerRadius: 8))
                TextField("https://example.com", text: $writeURI)
                    .textFieldStyle(.plain)
                    .hudBody(14)
                    .keyboardType(.URL)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .padding(10)
                    .background(hud.surfaceVariant, in: RoundedRectangle(cornerRadius: 8))
                Button {
                    writeToTag()
                } label: {
                    Text("Write")
                        .hudLabel(14)
                        .foregroundStyle(composerRecords.isEmpty ? hud.muted : hud.background)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                        .background(composerRecords.isEmpty ? hud.surfaceVariant : hud.primary, in: Capsule())
                }
                .disabled(composerRecords.isEmpty)
            }
        }
    }

    private var composerRecords: [NdefRecord] {
        var records: [NdefRecord] = []
        let text = writeText.trimmingCharacters(in: .whitespacesAndNewlines)
        if !text.isEmpty {
            records.append(.text(text, languageCode: "en"))
        }
        let uri = writeURI.trimmingCharacters(in: .whitespacesAndNewlines)
        if !uri.isEmpty {
            records.append(.uri(uri))
        }
        return records
    }

    private func writeToTag() {
        viewModel.write(composerRecords)
        writeText = ""
        writeURI = ""
    }

    // MARK: - Helpers

    private func persist(_ info: TagInfo) {
        let item = TagHistoryItem(
            uid: info.uid,
            techSummary: info.techList.joined(separator: ", "),
            ndefRecords: info.ndefRecords.historyJSON,
            isWritable: info.isWritable,
            maxSize: info.maxSize,
            usedSize: info.usedSize
        )
        modelContext.insert(item)
        try? modelContext.save()
    }

    private static func firstURI(in info: TagInfo) -> String? {
        for record in info.ndefRecords {
            if case let .uri(uri) = record, !uri.isEmpty {
                return uri
            }
        }
        return nil
    }
}

private struct NfcBanner: View {
    @Environment(\.hud) private var hud

    let text: String
    let color: Color

    var body: some View {
        HStack(spacing: 8) {
            Image(systemName: "antenna.radiowaves.left.and.right")
            Text(text)
                .hudBody(14)
        }
        .foregroundStyle(.white)
        .frame(maxWidth: .infinity)
        .padding(12)
        .background(color)
    }
}
