# CLI Features (`packages/cli`)

33 modules providing utilities across various domains, plus an MCP server exposing all functionality as tools.

> **Port note** — this documents the feature surface shared by both implementations.
> `packages/cli` is the shipped Rust implementation (clap + Cargo); `packages/cli.go`
> is the Go reference it was ported from.

## Calculator & Finance
| Module | Feature | Description |
| ------ | ------- | ----------- |
| `calc.age` | Age Calculator | Calculate age from birthdate |
| `calc.base` | Base Converter | Convert between number bases |
| `calc.bmi` | BMI Calculator | Body mass index calculation |
| `calc.compound` | Compound Interest | Calculate compound interest |
| `calc.currency` | Currency Converter | Currency conversion |
| `calc.date` | Date Calculator | Date arithmetic and calculations |
| `calc.loan` | Loan Calculator | Loan payment calculations |
| `calc.percent` | Percentage Calculator | Percentage calculations |
| `calc.tip` | Tip Calculator | Tip and split calculations |
| `calc.unit` | Unit Converter | Convert between units |

## Casino/Games
| Module | Feature | Description |
| ------ | ------- | ----------- |
| `casino.baccarat` | Baccarat | Play baccarat with interactive TUI |
| `casino.blackjack` | Blackjack | Play blackjack, card counting tools, cheatsheet |
| `casino.coin` | Coin Flip | Flip a coin |
| `casino.dice` | Dice Roller | Roll dice |
| `casino.poker` | Poker | Hand evaluator, odds calculator, play mode |
| `casino.roulette` | Roulette | Play roulette |
| `casino.slots` | Slots | Slot machine game |

## Crypto & Encoding
| Module | Feature | Description |
| ------ | ------- | ----------- |
| `crypto.hash` | Hash Generator | Generate various hash digests |
| `crypto.uuid` | UUID Generator | Generate UUIDs |

## Development Tools
| Module | Feature | Description |
| ------ | ------- | ----------- |
| `dev.gh` | GitHub Tools | Get repo languages, OpenGraph data |
| `dev.json` | JSON Tools | Format and query JSON with jq-like operations |
| `dev.regex` | Regex Tester | Test regular expressions |
| `dev.uuid` | UUID Tools | UUID utilities |

## Document Tools
| Module | Feature | Description |
| ------ | ------- | ----------- |
| `pdf.add-numbers` | Page Numbers | Add formatted page numbers to a PDF |
| `pdf.annotate` | Annotations | Add FreeText annotations at a position |
| `pdf.combine` | Merge/Split | Merge PDFs or extract/split page ranges |
| `pdf.convert` | PDF <-> Images | Create PDF from images; export pages via hayro rasteriser |
| `pdf.create` | PDF Creation | Create a PDF from text content |
| `pdf.crop` | Cropping | Set crop boxes on selected pages |
| `pdf.delete` | Page Deletion | Remove pages by range spec |
| `pdf.edit` | Editing | Compress, redact (pages/regions), rotate, watermark |
| `pdf.extract` | Extraction | Extract embedded content as images or text |
| `pdf.inspect` | Inspection | File info and metadata view/set |
| `pdf.maintain` | Maintenance | OCR via tesseract; repair via re-save |
| `pdf.rearrange` | Rearranging | Reorder pages (`3,1,2` or `reverse`) |
| `pdf.security` | Security | Encrypt (AES-256) and decrypt PDFs |

## File Operations
| Module | Feature | Description |
| ------ | ------- | ----------- |
| `file.better` | Enhanced File Tools | du, ls, tree with better output |
| `file.encode` | File Encoding | Base64, URL encoding/decoding |
| `file.hash` | File Hashing | Hash files |
| `file.mime` | MIME Detection | Detect file MIME types |
| `file.rename` | Batch Rename | Rename files in batch |
| `file.split` | File Splitting | Split files into chunks |

## Network Tools
| Module | Feature | Description |
| ------ | ------- | ----------- |
| `net.curl` | HTTP Client | Make HTTP requests |
| `net.dns` | DNS Lookup | Query DNS records |
| `net.headers` | HTTP Headers | Inspect HTTP headers |
| `net.ip` | IP Tools | Get IP information |
| `net.port` | Port Scanner | Check port status |
| `net.whois` | WHOIS Lookup | Domain WHOIS information |

## OS/System Tools
| Module | Feature | Description |
| ------ | ------- | ----------- |
| `os.cpu` | CPU Info | CPU information and usage |
| `os.disk` | Disk Info | Disk usage information |
| `os.load` | Load Average | System load average |
| `os.mem` | Memory Info | Memory usage |
| `os.proc` | Process Info | Process information |
| `os.sys` | System Info | System details |
| `os.uptime` | Uptime | System uptime |

## Text Processing
| Module | Feature | Description |
| ------ | ------- | ----------- |
| `text.diff` | Diff Tool | Compare files/text |
| `text.grep` | Grep | Search text patterns |
| `text.sort` | Sort | Sort lines |
| `text.wc` | Word Count | Count words/lines/chars |

## Web Tools
| Module | Feature | Description |
| ------ | ------- | ----------- |
| `web.fetch` | Web Fetch | Fetch web content |
| `web.html` | HTML Tools | HTML processing utilities |
| `web.youtube` | YouTube Tools | Get thumbnails, transcripts |

## Writing/AI Tools
| Module | Feature | Description |
| ------ | ------- | ----------- |
| `write.grammar` | Grammar Check | Check and correct grammar |
| `write.rewrite` | Text Rewriting | Rewrite text |
| `write.summarize` | Summarization | Summarize text |
| `write.translate` | Translation | Translate text |

## MCP Server
| Feature | Description |
| ------- | ----------- |
| `omni mcp serve` | Start MCP stdio server (JSON-RPC 2.0) |
| Tool Discovery | Auto-discovers all CLI commands as MCP tools (436 tools) |
| Schema Generation | Converts cobra flags to JSON Schema |
| In-Process Execution | Runs commands directly, captures output |
| History Tracking | All MCP calls logged to history |

**Tech Stack:** Go 1.23, Cobra, Bubble Tea, Lipgloss, go-rod, pdfcpu v0.15.0 (pinned), vendored Gemini API client
