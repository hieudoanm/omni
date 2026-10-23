# Omni — Test Layers

## Unit

### Android (`packages/android`)

**Framework:** Robolectric 4.17 + JUnit 4 + Turbine (Flow testing) + MockK 1.14.

**Scope:** `src/test/` — ViewModels, repositories, use cases, utilities, Compose UI (via `createComposeRule`).

```kotlin
// Example: HomeViewModelTest.kt
@RunWith(RobolectricTestRunner::class)
@OptIn(ExperimentalCoroutinesApi::class)
class HomeViewModelTest {
    private val testDispatcher = UnconfinedTestDispatcher()

    @Before
    fun setup() { Dispatchers.setMain(testDispatcher) }

    @Test
    fun `loads blocked apps on start`() = runTest {
        // Given
        val dao = mockk<AppDao>()
        every { dao.observeBlockedAppCount() } returns flowOf(5)

        // When
        val vm = HomeViewModel(FocusRepository(...))

        // Then
        assertEquals(5, vm.blockedAppCount.first())
    }
}
```

**Key patterns:**
- `Dispatchers.setMain(testDispatcher)` + `UnconfinedTestDispatcher` for coroutine control
- Turbine `test { awaitItem() }` for `Flow`/`StateFlow` assertions
- MockK `mockk<>`, `every { }`, `verify { }`
- Robolectric `@Config(sdk = [34])` for Android context

**Excluded from unit:** App-level integration, NFC hardware, accessibility service.

### macOS (`packages/macos`)

**Framework:** Swift Testing (Swift 6 native) — `@Suite`, `@Test`, `#expect`, `#require`.

**Scope:** `Tests/` — 219 tests, 36 suites covering models, services, providers, calculations.

```swift
// Example: MemoryProviderTests.swift
@Suite("MemoryProvider")
struct MemoryProviderTests {
    @Test("parses vm_stat output")
    func parsesVmStat() {
        let output = """
        Pages free: 12345.
        Pages active: 67890.
        """
        let result = MemoryProvider.parseVmStat(output)
        #expect(result.freePages == 12345)
        #expect(result.activePages == 67890)
    }

    @Test("handles missing keys gracefully")
    func missingKeys() {
        let output = "Invalid output"
        let result = MemoryProvider.parseVmStat(output)
        #expect(result.freePages == 0)
    }
}
```

**Key patterns:**
- Parameterized tests: `@Test(arguments: [1, 2, 3]) func test(_ n: Int) { ... }`
- Traits: `.tags(.integration)`, `.timeLimit(.minutes(1))`
- Snapshot tests in `Tests/SnapshotTests/` using `ImageRenderer` + `assertSnapshot`

### CLI (`packages/cli`)

**Framework:** Go stdlib `testing` — `go test ./...` runs 479 packages.

**Scope:** `src/cmd/**/*_test.go`, `src/libs/**/*_test.go`, `tests/` — service logic, command output, golden files.

```go
// Example: service_test.go
func TestCalculateAge(t *testing.T) {
    tests := []struct {
        name       string
        birthdate  string
        expectAge  int
    }{
        {"adult", "1990-01-01", 34},
        {"child", "2015-06-15", 9},
        {"leap", "2000-02-29", 24},
    }
    for _, tc := range tests {
        t.Run(tc.name, func(t *testing.T) {
            age, err := CalculateAge(tc.birthdate)
            if err != nil { t.Fatal(err) }
            if age != tc.expectAge { t.Errorf("got %d, want %d", age, tc.expectAge) }
        })
    }
}
```

**Key patterns:**
- Table-driven tests for multiple cases
- `testify/require` for assertions (optional; stdlib `assert` also used)
- Golden files in `testdata/` for CLI output comparison
- `tests/` package for cross-module integration tests

### Browser (`packages/browser`)

**Framework:** Vitest 5 + jsdom + React Testing Library.

**Scope:** `src/**/*.test.ts(x)` — utilities, hooks, components (non-page), API client.

```typescript
// Example: formatBytes.test.ts
import { describe, it, expect } from 'vitest'
import { formatBytes } from './formatBytes'

describe('formatBytes', () => {
  it('formats bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 B')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1024 * 1024)).toBe('1 MB')
  })
})
```

**Hard 80% threshold** on statements, branches, functions, lines — enforced by `pnpm run test:coverage` in CI.

**Excluded from unit:** App Router pages (`src/app/**`), content script DOM interactions — Playwright covers these.

## Integration

### Android

Instrumented tests (`src/androidTest/`) on emulator/device:
- NFC tag dispatch with real hardware
- Accessibility service enforcement
- Database migrations (Room)

Run: `./gradlew connectedDebugAndroidTest` (not in CI — requires hardware).

### CLI

`go test ./...` with real filesystem/network:
- File operations (`better/du`, `file/*`)
- Network commands (`net/curl`, `net/dns`, `net/whois`)
- Crypto operations (`crypto/*` with real keys)

Run: `make test` (includes all).

### Browser

Not yet implemented — Playwright E2E planned for:
- Popup open/close
- Options page save/load
- Content script injection

## Snapshot (macOS Only)

`Tests/SnapshotTests/` — `ImageRenderer` renders SwiftUI views, compares to reference PNG.

```swift
@Test("MemoryView matches snapshot")
func memoryViewSnapshot() {
    let view = MemoryView(viewModel: .preview)
    let image = ImageRenderer(content: view).render(scale: 2)
    assertSnapshot(matching: image, named: "MemoryView")
}
```

Run: `swift test` (includes snapshots). Reference images in `Tests/SnapshotTests/__Snapshots__/`.

## E2E

### CLI (`tests/`)

Golden-file tests invoking built binary:

```bash
# tests/cli_test.go
func TestCLI_Age(t *testing.T) {
    out := runCLI("calc", "age", "--birthdate", "1990-01-01")
    expected := readGolden("testdata/age_golden.txt")
    if strings.TrimSpace(out) != strings.TrimSpace(expected) {
        t.Errorf("mismatch\ngot: %s\nwant: %s", out, expected)
    }
}
```

Update goldens: `UPDATE_GOLDENS=1 go test ./tests/...`

### Browser (Planned)

Playwright against built extension:
- Load extension in Chromium
- Navigate to test page
- Interact with popup/content script

## Security

- Android: Oversize intent data, malformed NFC records
- macOS: Entitlement validation, sandbox escape attempts
- CLI: Path traversal in file ops, command injection in shell args
- Browser: XSS in content script, CSP bypass, manifest permissions

## Performance

- Android: Compose render < 16ms (frame budget), database query < 100ms
- macOS: Menu-bar update < 50ms, memory parse < 10ms
- CLI: Cold start < 50ms, cross-compile build-all < 120s
- Browser: Popup load < 200ms, content script inject < 50ms