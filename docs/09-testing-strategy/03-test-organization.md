# Omni — Test Organisation

## Android (`packages/android`)

```
app/src/test/
├── kotlin/io/github/hieudoanm/
│   ├── block/
│   │   ├── data/           # Repository, DAO, DataStore tests
│   │   ├── ui/
│   │   │   ├── home/       # HomeScreenTest, HomeViewModelTest
│   │   │   ├── apps/       # AppListScreenTest, AppListViewModelTest
│   │   │   ├── settings/   # SettingsScreenTest, SettingsViewModelTest
│   │   │   └── theme/      # ThemeTest
│   │   └── accessibility/  # FocusAccessibilityServiceTest
│   ├── nfc/
│   │   ├── data/nfc/       # TagDispatcherTest, NdefParserTest
│   │   ├── ui/             # HomeScreenTest, HistoryScreenTest, SettingsScreenTest
│   │   └── activity/       # MainActivityTest (instrumented)
│   └── omni/
│       └── ui/home/        # Omni HomeScreenTest
```

**Naming:** `*Test.kt` for classes, `*_test.go` for Go (but Kotlin uses `*Test.kt`).

**Shared:** `app/src/test/kotlin/io/github/hieudoanm/testutil/` — `TestCoroutineRule`, `MockKExtensions`.

## macOS (`packages/macos`)

```
Tests/
├── Core/
│   ├── Models/             # MemoryStatsTest, DiskStatsTest, NetworkStatsTest
│   ├── Providers/          # MemoryProviderTest, StorageProviderTest, NetworkProviderTest
│   ├── Services/           # ClipboardStoreTest, SettingsStoreTest
│   └── Calculations/       # ByteFormatterTest, PercentageTest
├── App/
│   ├── Views/              # SnapshotTests (ImageRenderer)
│   └── MenuBar/            # MenuBarDisplayTest, MenuBarMetricsTest
├── SnapshotTests/          # Reference images in __Snapshots__/
├── Fixtures/               # vm_stat.sample, df.sample, etc.
└── Helpers/                # TestExtensions.swift, ImageRenderer.swift
```

**Naming:** `<Type>Tests.swift` for suites, `@Test` functions named descriptively.

## CLI (`packages/cli`)

```
src/
├── cmd/
│   ├── calc/
│   │   ├── age/            # cmd_test.go, service_test.go
│   │   ├── base/           # ...
│   │   └── ...
│   ├── casino/
│   ├── crypto/
│   ├── file/
│   ├── net/
│   ├── system/
│   ├── web/
│   ├── write/
│   └── ... (33 modules)
├── libs/
│   ├── api/gemini.google.com/  # gemini_test.go
│   ├── browser/            # browser_test.go
│   ├── chat/               # chat_test.go
│   └── ...
└── tests/                  # Cross-module integration, golden files
    ├── cli_test.go
    └── testdata/
        ├── golden/         # Expected outputs
        └── ...             # Input fixtures
```

**Naming:**
- `cmd.go` / `service.go` → `cmd_test.go` / `service_test.go`
- Test functions: `Test<FunctionName>` (e.g., `TestCalculateAge`)
- Table-driven subtests: `t.Run("case name", ...)`

## Browser (`packages/browser`)

```
src/
├── apps/
│   ├── background/
│   │   └── __tests__/      # background.test.ts
│   ├── content/
│   │   └── __tests__/      # content.test.ts
│   ├── popup/
│   │   └── __tests__/      # App.test.tsx, usePopup.test.ts
│   └── options/
│       └── __tests__/      # Options.test.tsx
├── libs/
│   ├── api/
│   │   └── __tests__/      # client.test.ts
│   ├── storage/
│   │   └── __tests__/      # storage.test.ts
│   └── ...
├── components/
│   ├── ui/
│   │   └── __tests__/      # Button.test.tsx, Card.test.tsx
│   └── ...
└── test/
    ├── setup.ts            # Vitest global setup (mock chrome, etc.)
    └── utils.tsx           # renderWithProviders, etc.
```

**Naming:**
- Component: `Component.tsx` → `Component.test.tsx` (PascalCase)
- Hook: `useHook.ts` → `useHook.test.ts` (camelCase)
- Utility: `util.ts` → `util.test.ts` (camelCase)
- `__tests__/` folder alongside source (Vitest convention)

## Cross-Package Conventions

| Aspect | Convention |
|--------|------------|
| Test file suffix | `*_test.go` (Go), `*Test.kt` (Kotlin), `*Tests.swift` (Swift), `*.test.ts(x)` (TS) |
| Test function | `TestXxx` (Go), `fun xxx()` (Kotlin), `@Test func xxx()` (Swift), `it('xxx')` (TS) |
| Fixtures | `testdata/` (Go), `resources/` (Android), `Fixtures/` (macOS), `test/fixtures/` (Browser) |
| Golden files | `testdata/golden/` (CLI), `__Snapshots__/` (macOS) |
| Coverage output | `coverage/` (all, gitignored) |