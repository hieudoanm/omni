# CLI Vendoring — External Code Copied In

## Principle

**Vendored, not linked.** External code is copied into `src/libs/` rather than imported via `replace` directive or module proxy.

## Gemini Client

```
src/libs/api/gemini.google.com/
├── gemini.go
├── gemini_test.go
└── go.mod  (optional, for internal imports)
```

**Source:** Originally `github.com/hieudoanm/api` (abandoned).

**Import path in code:**
```go
import "github.com/hieudoanm/omni/packages/cli/src/libs/api/gemini.google.com"
```

**Why not replace:**
- `replace` breaks in CI/module proxy
- Not hermetic — depends on external repo availability
- Vendoring gives full control, no network at build time

## pdfcpu Pinning

```go
// go.mod
require github.com/pdfcpu/pdfcpu v0.15.0
```

**Why v0.15.0:** v0.16.x breaks `pdf` command (API changes in `LoadConfiguration`, `ReadContextFile`, `ExtractPagesFile`, `Merge`, `DecryptFile`, `EncryptFile`, `ImportImagesFile`, `AddAnnotationsFile`).

**Verification:**
```bash
# Test pdf command still works
go build ./src/cmd/pdf/...
go test ./src/cmd/pdf/...
```

## Adding a Vendored Dep

1. Copy source to `src/libs/<domain>/<name>/`
2. Update imports in consuming code
3. Run `go mod tidy`
4. Verify `go build ./...` and `go test ./...`
5. Document in this file

## What NOT to Vendor

- Standard library (obviously)
- Well-maintained deps with stable APIs (Cobra, Bubble Tea, etc.)
- Anything available via `go get` with semantic versioning

## Go Module Graph

```bash
# Verify no replace directives
go mod graph | grep replace
# Should return empty

# Verify pdfcpu version
go list -m github.com/pdfcpu/pdfcpu
# github.com/pdfcpu/pdfcpu v0.15.0
```