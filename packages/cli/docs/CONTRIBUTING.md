# Contributing

## Setup

```bash
# repo root — the Go module lives under packages/cli
cd packages/cli
go build ./...
```

## Commands

| Command          | Purpose                         |
| ---------------- | ------------------------------- |
| `go build ./...` | Compile all packages            |
| `go test ./...`  | Unit tests (all packages)       |
| `go vet ./...`   | Static analysis                 |
| `gofmt -w .`     | Format all Go files             |
| `go mod tidy`    | Tidy dependencies               |
| `make build`     | Build `bin/omni` (native)       |
| `make build-all` | Cross-compile 4 platforms (zig) |
| `make test`      | `go test ./...`                 |
| `make lint`      | `go vet ./...`                  |
| `make format`    | `go fmt ./...`                  |
| `make coverage`  | HTML coverage report            |
| `make install`   | Install to `~/bin/omni`         |

Note: the repo's `bash.sh`/`cobra.go` section of the root `AGENTS.md`
describes linting with `golangci-lint`; this module uses `go vet` (via
`make lint`). There is no `golangci-lint` dependency here.

## Coding Conventions

Follow the repo-wide [Go conventions](AGENTS.md) — in short:

- `error` as the last return value; handle errors explicitly, never `_ = err`
- Prefer `var` zero-initialization (`var s string`) over `s := ""`
- `context.Context` as the first parameter for any I/O work
- No global state — dependencies passed explicitly (client, logger, TUI models)
- Return early, avoid deep nesting; small, focused files
- `cobra` specifics: use `RunE` (never `Run`), keep command bodies thin,
  bind flags with `StringVarP`/`IntVarP`, lowercase error messages, output
  via `fmt.Println`

Package layout:

```
main.go                  # entrypoint (package main) → src/cmd.Execute()
src/cmd/                 # root.go + 33 modules
  <module>/              # one package per command
    cmd.go               # cobra command definition
    service.go           # pure logic (no cobra) — in same package
    tui.go               # BubbleTea TUI model/view/update
    *_test.go            # colocated tests
src/libs/                # shared libraries (requests, browser, chat, colors,
                         #   history, mcp, number, theme)
tests/                   # integration_test.go — black-box binary tests
```

### Naming

- One command per package directory; the file is always `cmd.go`
- Business logic lives in `service.go` in the same directory; TUI state machines
  in `tui.go`
- Tests are colocated `*_test.go` files in the same package
- A module root is a `NewCommand()` returning `*cobra.Command`; subcommands are
  built via `newXxxCmd()` helpers inside the module package

### Flags & output

- `--json` (`-j`) is a persistent flag on the module root (28 modules; not on
  `completion`, `games`, `mcp`, `net`, `video`, `write`). In `RunE` read it
  with `cmd.Flags().GetBool("json")`.
- `fmt.Println` for output; JSON branches gate on the `--json` flag.

### HTTP

- Use `requests.Get/Post/Put/Patch/Delete` from `src/libs/requests/` for all
  HTTP work (retries, timeouts, headers).

## Testing Conventions

- Colocate `*_test.go` with the code they test; use table-driven tests
  (`[]struct{...}` + `t.Run`) and behaviour-spec test names
- `tests/integration_test.go` is a black-box suite whose `TestMain` builds a
  test binary (`bin/omni-test`) and exercises real commands: calc, crypto,
  convert, semver, time, system, data, colors, file, search, completion,
  version, help and invalid-command handling
- `make build-all` cross-compiles the shell loop into `bin/` (CI runs
  `format` + `lint` + `test` first); never commit a binary in `bin/`
- Keep tests isolated: history writes go to a temp `HOME`; never rely on the
  user's real `~/.omni/history.jsonl`

## Docs

Update `docs/ARCHITECTURE.md` when modules, flags or the MCP internals change.
Update `README.md` when user-facing commands change. Keep
`docs/ROADMAP.md` checkboxes in sync with what actually ships.
