# Omni — Testing Definition of Done

A change is not done until:

**Per-platform tests pass:**
- Android: `make lint` (Spotless + Android Lint), `make test` (Robolectric), `make build`
- macOS: `make format` (swiftformat), `make lint` (swift build), `make test` (Swift Testing), `make build`
- CLI: `make format` (go fmt), `make lint` (go vet), `make test` (go test ./...), `make build`
- Browser: `pnpm lint`, `tsc --noEmit`, `pnpm test:coverage` (≥80%), `pnpm build`

**New logic has tests:**
- Android: ViewModel/Repository/UseCase → `*Test.kt` in `src/test/`
- macOS: Provider/Service/Model → `@Test` in `Tests/`
- CLI: Service/Command → `*_test.go` alongside source
- Browser: Util/Hook/Component → `*.test.ts(x)` in `__tests__/`

**Fixtures updated** if test data format changed.

**Integration tests** if change touches:
- Android: Room DAO, DataStore, NFC hardware, Accessibility service
- macOS: System commands (`vm_stat`, `df`, `lsof`, `smartctl`), app bundle
- CLI: Filesystem, network, crypto, external processes
- Browser: chrome.* APIs, storage, messaging

**CI green** — all four platform jobs + `release-latest` succeed.

**Docs updated** if behaviour changed:
- `README.md` / `AGENTS.md` for user-facing changes
- `docs/08-tech-stack/` for dependency/stack changes
- `docs/09-testing-strategy/` for test pattern changes
- Package-level docs (`packages/*/docs/`, `packages/*/Docs/`)