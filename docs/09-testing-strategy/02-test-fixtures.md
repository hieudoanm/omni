# Omni — Test Fixtures

Fixtures are synthetic, deterministic, and commit-safe. No PII, no credentials.

## Android (`packages/android/app/src/test/resources/`)

| File | Purpose |
|------|---------|
| `nfc_tag_ndef.json` | Simulated NDEF record for `Ndef` parsing tests |
| `nfc_tag_tech.json` | Tech list (NfcA, IsoDep, Ndef) for dispatch tests |
| `room_db.json` | Pre-populated Room entities for DAO tests |
| `datastore_prefs.xml` | DataStore preferences for Settings tests |

```kotlin
// Usage in test
val nfcTag = NfcTagFixture.load("nfc_tag_ndef.json")
val record = nfcTag.ndefMessage?.records?.first()
```

## macOS (`packages/macos/Tests/Fixtures/`)

| File | Purpose |
|------|---------|
| `vm_stat.sample` | `vm_stat` output for MemoryProvider |
| `df.sample` | `df -h` output for StorageProvider |
| `lsof.sample` | `lsof -i` output for NetworkProvider |
| `smartctl.sample` | `smartctl -a` output for DiskHealth |
| `sysctl.sample` | `sysctl -a` output for CPUProvider |

```swift
// Usage in test
let vmStat = try String(contentsOf: fixtureURL("vm_stat.sample"))
let memory = MemoryProvider.parseVmStat(vmStat)
```

## CLI (`packages/cli/testdata/`)

| Directory | Purpose |
|-----------|---------|
| `age/` | Birthdate → expected age output |
| `du/` | Directory trees for `better du` |
| `ls/` | File listings for `better ls` |
| `ps/` | Process tables for `better ps` |
| `curl/` | HTTP responses for `net curl` |
| `dns/` | DNS records for `net dns` |
| `whois/` | WHOIS responses for `net whois` |
| `pdf/` | Sample PDFs for `pdf` commands |
| `image/` | Test images for `image` commands |
| `golden/` | Expected CLI output for golden tests |

```go
// Usage in test
func loadGolden(t *testing.T, name string) string {
    data, err := os.ReadFile("testdata/golden/" + name)
    if err != nil { t.Fatal(err) }
    return string(data)
}
```

## Browser (`packages/browser/test/fixtures/`)

| File | Purpose |
|------|---------|
| `sample.html` | Minimal HTML page for content script tests |
| `mock-chrome.json` | `chrome.*` API mock for background/content tests |
| `settings.json` | Extension settings for options page tests |

```typescript
// Usage in test
import mockChrome from '../fixtures/mock-chrome.json'
vi.stubGlobal('chrome', mockChrome)
```

## Generating Fixtures

```bash
# Android: Record real NFC tag → save as JSON
# macOS: Run commands on clean system → save output
# CLI: Run command with known input → save output to testdata/golden/
# Browser: Capture chrome API shape from devtools → save as JSON
```

## Fixture Rules

1. **Deterministic** — same input always produces same fixture
2. **Minimal** — only fields needed for test
3. **Versioned** — if format changes, add v2 fixture; don't modify v1
4. **Documented** — each fixture has a comment explaining its structure