# Features

This document provides a feature-to-package mapping. For detailed features per package, see the breakdown files in [02-features/](02-features/).

## Function-to-Package Mapping

| Function / Feature                                      | Android                   | macOS                             | CLI                            | Browser                        | Notes                                                                             |
| ------------------------------------------------------- | ------------------------- | --------------------------------- | ------------------------------ | ------------------------------ | --------------------------------------------------------------------------------- |
| **App/Super App Hub**                                   | ✅                         | ✅                                 | ❌                              | ❌                              | Android (Focus Blocker + NFC Toolkit), macOS (Dashboard with all utilities)       |
| **Menu Bar / System Tray**                              | ❌                         | ✅                                 | ❌                              | ❌                              | macOS only                                                                        |
| **Focus/Distraction Blocking**                          | ✅                         | ❌                                 | ❌                              | ✅                              | Android (Accessibility Service app blocking), Browser (site blocker + focus wall) |
| **NFC Tag Reading/Emulation**                           | ✅                         | ❌                                 | ❌                              | ❌                              | Android only (NDEF, HCE, tag history)                                             |
| **System Monitoring (CPU/Memory/Disk/Network/Battery)** | ❌                         | ✅                                 | ✅ (os.* modules)               | ❌                              | macOS comprehensive UI; CLI provides basic system info via `os.*`                 |
| **Clipboard Management**                                | ❌                         | ✅                                 | ❌                              | ❌                              | macOS only                                                                        |
| **Clock/Timer/Pomodoro/Stopwatch**                      | ❌                         | ✅                                 | ❌                              | ❌                              | macOS only                                                                        |
| **World Clock**                                         | ❌                         | ✅                                 | ❌                              | ❌                              | macOS only                                                                        |
| **IP/DNS Tools**                                        | ❌                         | ✅ (IP details/DNS lookup)         | ✅ (net.ip, net.dns)            | ❌                              | Both have network/IP tools; different scopes                                      |
| **Port Scanning**                                       | ❌                         | ✅                                 | ✅ (`net.port`)                 | ❌                              | Available in both macOS and CLI                                                   |
| **Homebrew/App Management**                             | ❌                         | ✅                                 | ❌                              | ❌                              | macOS only                                                                        |
| **Process/Service Management**                          | ❌                         | ✅ (Homebrew services, Front apps) | ✅ (`os.proc`)                  | ❌                              | Different implementations                                                         |
| **Calculator/Finance**                                  | ❌                         | ❌                                 | ✅ (calc.*)                     | ❌                              | CLI only (10 modules)                                                             |
| **Games/Casino**                                        | ❌                         | ❌                                 | ✅ (casino.*)                   | ❌                              | CLI only (7 games)                                                                |
| **Crypto/Hash/UUID**                                    | ❌                         | ❌                                 | ✅ (crypto.*)                   | ❌                              | CLI only                                                                          |
| **File Operations**                                     | ❌                         | ❌                                 | ✅ (file.*)                     | ❌                              | CLI only (6 modules)                                                              |
| **Text Processing**                                     | ❌                         | ❌                                 | ✅ (text.*)                     | ❌                              | CLI only (4 modules)                                                              |
| **Web/HTTP Tools**                                      | ❌                         | ❌                                 | ✅ (web.*, net.curl)            | ❌                              | CLI only                                                                          |
| **AI/Writing Tools**                                    | ❌                         | ❌                                 | ✅ (write.*)                    | ❌                              | CLI only (grammar, rewrite, summarize, translate)                                 |
| **GitHub Integration**                                  | ❌                         | ❌                                 | ✅ (`dev.gh`)                   | ✅ (External link routing)      | CLI fetches repo data; Browser routes external links                              |
| **JSON/Regex/Dev Tools**                                | ❌                         | ❌                                 | ✅ (dev.*)                      | ❌                              | CLI only                                                                          |
| **New Tab Redirect**                                    | ❌                         | ❌                                 | ❌                              | ✅                              | Browser only                                                                      |
| **Ad Blocking**                                         | ❌                         | ❌                                 | ❌                              | ✅                              | Browser only (DNR/webRequest)                                                     |
| **Site-Specific Focus (Chess.com)**                     | ❌                         | ❌                                 | ❌                              | ✅                              | Browser only                                                                      |
| **Claude.ai Usage Tracking**                            | ❌                         | ❌                                 | ❌                              | ✅                              | Browser only                                                                      |
| **Instagram Gesture**                                   | ❌                         | ❌                                 | ❌                              | ✅                              | Browser only (Shift+Right-click)                                                  |
| **Shopify Detection**                                   | ❌                         | ❌                                 | ❌                              | ✅                              | Browser only                                                                      |
| **Screenshot/Capture (Full Page)**                      | ❌                         | ❌                                 | ❌                              | ✅                              | Browser only                                                                      |
| **Back to Top**                                         | ❌                         | ❌                                 | ❌                              | ✅                              | Browser only                                                                      |
| **Tab Sound Control**                                   | ❌                         | ❌                                 | ❌                              | ✅                              | Browser only                                                                      |
| **MCP Server**                                          | ❌                         | ❌                                 | ✅ (`omni mcp serve`)           | ❌                              | CLI only (189 tools)                                                              |
| **TUI Interfaces**                                      | ❌                         | ❌                                 | ✅ (Casino games, some modules) | ❌                              | CLI uses Bubble Tea for interactive UIs                                           |
| **Dark/Light Mode**                                     | ✅                         | ✅                                 | ❌                              | ❌                              | Android and macOS native theming                                                  |
| **Accessibility Support**                               | ✅ (Accessibility Service) | ✅ (Reduced Motion)                | ❌                              | ❌                              | Different implementations                                                         |
| **Data Persistence (Local DB)**                         | ✅ (Room)                  | ❌                                 | ❌                              | ✅ (local/sync storage)         | Android Room, Browser storage APIs                                                |
| **Preferences/DataStore**                               | ✅ (DataStore)             | ❌                                 | ❌                              | ✅ (chrome.storage.sync)        | Android and Browser                                                               |
| **Snapshot/UI Tests**                                   | ❌                         | ✅ (219 tests)                     | ❌                              | ❌                              | macOS has extensive snapshot tests                                                |
| **Cross-Browser Support**                               | ❌                         | ❌                                 | ❌                              | ✅ (Chromium MV3 + Firefox MV2) | Browser only                                                                      |

## Package Summary

| Package     | Primary Purpose            | Unique Strengths                                                                             |
| ----------- | -------------------------- | -------------------------------------------------------------------------------------------- |
| **Android** | Mobile super app           | App blocking via Accessibility Service, NFC tag reading & HCE                                |
| **macOS**   | System monitor & utilities | Comprehensive real-time system monitoring, menu bar integration, full utility suite          |
| **CLI**     | Developer toolbox          | 33 modules covering calculations, games, dev tools, file/network operations, plus MCP server |
| **Browser** | Web productivity extension | Content filtering, site-specific enhancements, tab management, page capture                  |

## Detailed Breakdowns

- [Android Features](02-features/android.md)
- [macOS Features](02-features/macos.md)
- [CLI Features](02-features/cli.md)
- [Browser Features](02-features/browser.md)
