# TREE

```text
├── src/
│   ├── [cli.rs](./src/cli.rs)                  # clap root command + dispatch
│   ├── [main.rs](./src/main.rs)                # entrypoint + history tracking
│   ├── [history.rs](./src/history.rs)          # ~/.omni/history.jsonl store
│   ├── [history_cmd.rs](./src/history_cmd.rs)  # history list/search/clear/stats
│   ├── [requests.rs](./src/requests.rs)        # HTTP client (ureq, 15s timeout)
│   ├── [version.rs](./src/version.rs)          # version command
│   ├── [completion.rs](./src/completion.rs)    # shell completion (clap_complete)
│   ├── [english.rs](./src/english.rs)          # english define
│   ├── [port.rs](./src/port.rs)                # port check/find/scan
│   ├── [semver.rs](./src/semver.rs)            # semver validate/compare/sort/bump/range
│   ├── [doi.rs](./src/doi.rs)                  # doi fetch/cite/ref/validate (Crossref)
│   ├── [write.rs](./src/write.rs)              # write summarize/grammar/rewrite/translate
│   ├── [openapi.rs](./src/openapi.rs)          # openapi validate + openapi2postman
│   ├── [mcp.rs](./src/mcp.rs)                  # MCP JSON-RPC stdio server + tool exec
│   ├── [timefmt.rs](./src/timefmt.rs)          # Go time-layout -> chrono format mapper
│   ├── calc/                                   # financial & utility calculators
│   │   ├── [mod.rs](./src/calc/mod.rs)         # unit conversion tables + helpers
│   │   ├── [internal.rs](./src/calc/internal.rs)
│   │   └── age/base/bmi/compound/currency/date/discount/eval/factorial/gcd/lcm/loan/mortgage/percent/prime/random/stats/tax/tip/unit.rs
│   ├── time/                                   # time & scheduling tools
│   │   ├── [mod.rs](./src/time/mod.rs)         # RFC1123/RFC3339 helpers
│   │   ├── [internal.rs](./src/time/internal.rs)  # datetime parsing
│   │   └── age/clock/cron/epoch/pomodoro/stopwatch/timer/until/world.rs
│   ├── better/                                 # better unix command replacements
│   │   ├── [mod.rs](./src/better/mod.rs)       # shared table printer + human_size
│   │   └── du/env/find/ls/ps/psaux/which.rs
│   ├── system/                                # system monitoring & clipboard
│   │   ├── [mod.rs](./src/system/mod.rs)       # disk_label + go_duration helpers
│   │   └── battery/clipboard/disk/env/info/monitor/path.rs
│   ├── data/                                  # data file format tools
│   │   ├── [mod.rs](./src/data/mod.rs)
│   │   ├── [internal.rs](./src/data/internal.rs)  # csv/yaml/json helpers
│   │   ├── [xlsx.rs](./src/data/xlsx.rs)       # calamine xlsx parser
│   │   └── archive/csv_cmd/ebook/excel/json_cmd/split/yml.rs
│   ├── search/                                # universal search
│   │   ├── [mod.rs](./src/search/mod.rs)
│   │   └── code/files/text/web.rs              # + path-aware glob in files.rs
│   ├── file/                                   # file operations
│   │   ├── [mod.rs](./src/file/mod.rs)
│   │   ├── [internal.rs](./src/file/internal.rs)  # mime/mode/hash helpers
│   │   └── checksum/chmod/count/duplicates/edit/filetype/grep/head/read/size/stats/tail/write.rs
│   ├── net/                                    # network diagnostics & servers
│   │   ├── [mod.rs](./src/net/mod.rs)
│   │   └── cert/dns/http_cmd/ip/ping/serve/status/whois/wifi.rs
│   ├── video/                                  # ffmpeg wrappers
│   │   ├── [mod.rs](./src/video/mod.rs)        # run_ffmpeg + default_output
│   │   └── compress/convert/extractaudio/mute/resize/subtitles/togif/tomp3/trim.rs
│   ├── colors/                                 # colour conversion + Figma palettes
│   │   ├── [mod.rs](./src/colors/mod.rs)       # shared read_line + printers
│   │   ├── [internal.rs](./src/colors/internal.rs)  # rgb/hsl/hcl/oklch/cmyk/hex maths
│   │   ├── figma/                              # figma list/name/hex/palettes
│   │   │   ├── [mod.rs](./src/colors/figma/mod.rs)
│   │   │   ├── [internal.rs](./src/colors/figma/internal.rs)  # 797 colours + 144 palettes
│   │   │   └── list/name/hex/palettes.rs
│   │   └── hex/hcl/oklch/palette/random/rgb.rs
│   ├── gh/                                     # GitHub API tools
│   │   ├── [mod.rs](./src/gh/mod.rs)
│   │   ├── [shared.rs](./src/gh/shared.rs)     # fetch + GITHUB_TOKEN + language colours
│   │   └── coc/ignore/languages/license/og.rs  # + SVG generators
│   ├── docsify/                                # codebase documentation tools
│   │   ├── [mod.rs](./src/docsify/mod.rs)
│   │   ├── internal/                           # walker/extractor/graph/writer ports
│   │   │   ├── [mod.rs](./src/docsify/internal/mod.rs)
│   │   │   ├── [walker.rs](./src/docsify/internal/walker.rs)
│   │   │   ├── [extractor.rs](./src/docsify/internal/extractor.rs)  # go/ts/py/rs regex extraction
│   │   ├── [mod.rs](./src/crypto/mod.rs)       # hash/jwt/keygen/passwd/uuid/totp/encrypt/decrypt/qrcode/barcode
│   │   ├── [internal.rs](./src/crypto/internal.rs)  # hash + CSPRNG helpers
│   │   ├── [mod.rs](./src/casino/mod.rs)       # blackjack/poker/baccarat/slots/coin/dice/roulette
│   │   ├── [internal.rs](./src/casino/internal.rs)  # Card/Suit/deck/display
│   │   ├── [mod.rs](./src/image/mod.rs)           # background..text subcommand tree
│   │   ├── [internal.rs](./src/image/internal.rs) # open/save/color/text helpers
│   │   ├── [font7x13.rs](./src/image/font7x13.rs) # embedded basicfont bitmap data
│   ├── web/                                     # shopify/simplify/snapshot/weather/youtube
│   │   ├── [mod.rs](./src/web/mod.rs)
│   │   ├── [internal.rs](./src/web/internal.rs) # fetch/html/table helpers + readability
│   │   ├── shopify.rs                           # Shopify detection
│   │   ├── snapshot.rs                          # headless Chrome screenshots (presets)
│   │   ├── weather.rs                           # wttr.in current/forecast
│   │   ├── simplify/                            # md/csv/images subcommands
│   │   └── youtube/                             # fetch transcript + thumbnails (Innertube)
│   ├── games/                                   # anagram/reaction/recall/typerace/wordle
│   │   ├── [mod.rs](./src/games/mod.rs)
│   │   ├── [internal.rs](./src/games/internal.rs)  # 10,268-word embedded list
│   │   └── anagram/reaction/recall/typerace/wordle.rs
│   ├── openrouter/                              # models/status/serve/hook/code REPL
│   │   ├── [mod.rs](./src/openrouter/mod.rs)
│   │   ├── [code.rs](./src/openrouter/code.rs)      # agentic REPL: tools + approval + slash cmds
│   │   ├── [lib.rs](./src/openrouter/lib.rs)    # model types + free-model filter
│   │   ├── [config.rs](./src/openrouter/config.rs)  # config + OPEN_ROUTER_API_KEY
│   │   ├── models.rs                            # free model list/search/group
│   │   ├── status.rs                            # probe -> OK/ratelimited/restricted/error
│   │   ├── serve.rs                             # GET / + POST /chat server
│   │   └── hook.rs                              # Telegram webhook + ngrok
│   │   │   ├── [graph.rs](./src/docsify/internal/graph.rs)          # GraphML graph builder
│   │   │   ├── [writer.rs](./src/docsify/internal/writer.rs)        # GraphML writer (quick-xml)
│   │   │   └── [exclude.rs](./src/docsify/internal/exclude.rs)
│   │   ├── [cobra.rs](./src/docsify/cobra.rs)   # tree-sitter-go Cobra doc generator
│   │   ├── [obsidian.rs](./src/docsify/obsidian.rs)  # wiki-link graph dot/json/edges
│   │   ├── [scan.rs](./src/docsify/scan.rs)     # codebase -> GraphML
│   │   └── [tree.rs](./src/docsify/tree.rs)     # gitignore-aware TREE.md
│   ├── chess/                                   # elo/chess960/fen/pgn/play/setup + lichess/com APIs
│   │   ├── [mod.rs](./src/chess/mod.rs)
│   │   ├── [pgn_parse.rs](./src/chess/pgn_parse.rs)  # PGN tokenizer (tags/comments/variations/NAGs)
│   │   ├── [internal.rs](./src/chess/internal.rs)    # lichess client + helpers
│   │   ├── lichess/                            # user/puzzle/game/player/tv/streamer/crosstable/tournament/team/study/tablebase/opening
│   │   └── com/                                # club/country/leaderboards/match/player/puzzle/streamer/titled/tournament
│   ├── telegram/                                # all 60 Bot API leaves (16 groups)
│   │   ├── [mod.rs](./src/telegram/mod.rs)
│   │   └── [internal.rs](./src/telegram/internal.rs)  # token resolution + POST wrapper
│   ├── gemini/                                  # `code` line-based REPL (Go: Bubble Tea TUI)
│   │   ├── [mod.rs](./src/gemini/mod.rs)
│   │   └── client.rs                            # generateContent client + model list
│   ├── pdf/                                     # lopdf manipulation + hayro raster + tesseract OCR
│   │   ├── [mod.rs](./src/pdf/mod.rs)
│   │   ├── [internal.rs](./src/pdf/internal.rs)    # load/save/page-spec/box/content-stream/object-import helpers
│   │   ├── addnumbers.rs  annotate.rs  create.rs  crop.rs  delete.rs  rearrange.rs
│   │   ├── combine/      # merge.rs + split.rs
│   │   ├── convert/      # fromimages.rs + toimages.rs (hayro render)
│   │   ├── edit/         # compress/redact/rotate/watermark
│   │   ├── extract/      # images.rs + text.rs
│   │   ├── inspect/      # info.rs + metadata.rs
│   │   ├── maintain/     # ocr.rs (tesseract) + repair.rs
│   │   └── security/     # encrypt.rs + decrypt.rs (lopdf EncryptionState)
│   └── convert/                                # text conversion utilities
│       ├── [mod.rs](./src/convert/mod.rs)      # convert subcommand tree
│       ├── [internal.rs](./src/convert/internal.rs)  # shared helpers + tests
│       ├── [base64.rs](./src/convert/base64.rs)      # base64 encode/decode
│       ├── [braille.rs](./src/convert/braille.rs)
│       ├── [camelcase.rs](./src/convert/camelcase.rs)
│       ├── [capitalise.rs](./src/convert/capitalise.rs)
│       ├── [count.rs](./src/convert/count.rs)
│       ├── [deburr.rs](./src/convert/deburr.rs)
│       ├── [kebabcase.rs](./src/convert/kebabcase.rs)
│       ├── [lorem.rs](./src/convert/lorem.rs)
│       ├── [lowercase.rs](./src/convert/lowercase.rs)
│       ├── [morse.rs](./src/convert/morse.rs)
│       ├── [pascalcase.rs](./src/convert/pascalcase.rs)
│       ├── [slug.rs](./src/convert/slug.rs)
│       ├── [snakecase.rs](./src/convert/snakecase.rs)
│       ├── [uppercase.rs](./src/convert/uppercase.rs)
│       └── [url.rs](./src/convert/url.rs)
├── [build.rs](./build.rs)                      # OMNI_VERSION injection
├── [Cargo.toml](./Cargo.toml)
├── [Makefile](./Makefile)                      # format/lint/test/build/build-all/install/clean
├── [package.json](./package.json)              # @omni/cli
├── [README.md](./README.md)
└── [AGENTS.md](./AGENTS.md)
```
