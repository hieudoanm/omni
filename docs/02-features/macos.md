# macOS Features (`packages/macos`)

A comprehensive menu-bar system monitor and utilities app with a full dashboard window.

## Menu Bar
| Feature | Description |
| ------- | ----------- |
| Menu Bar Icon | Live system status indicator |
| Menu Bar Panel | Quick-access popover with key metrics |
| Panel Positioning | Smart positioning relative to menu bar |

## Dashboard & Navigation
| Feature | Description |
| ------- | ----------- |
| Multi-Section Dashboard | Sidebar navigation with search across sections and apps |
| Window Management | Dashboard window, Settings window with independent routing |
| Applications Manager | Browse, search, and manage installed applications and Homebrew packages |
| Global Refresh | Command+R to refresh all monitors |

## System Monitoring
| Feature | Description |
| ------- | ----------- |
| Memory Monitor | RAM usage, pressure, wired/active/compressed memory, swap usage |
| CPU Monitor | Per-core usage, thermal pressure, frequency tracking |
| Disk Monitor | Volume usage, APFS snapshots, purgeable space, SMART health (via smartctl) |
| Network Monitor | Per-interface throughput, active connections, lsof integration |
| Battery Monitor | Battery status, health, and power information |
| System Info | Hardware and OS details |

## Utilities
| Feature | Description |
| ------- | ----------- |
| Clipboard Manager | History of copied items with search and filters |
| Clock Suite | World clock, timer, stopwatch, pomodoro timer, watch faces |
| IP Tools | IP address details and DNS lookup |
| Port Scanner | View open ports and associated processes |
| Frontmost Apps | Track and inspect running applications |
| Workspaces | Workspace management utilities |
| Homebrew Integration | Discover, install, update packages; manage services |

## Design & UX
| Feature | Description |
| ------- | ----------- |
| Design System | Design tokens (colors, spacing, typography, elevation, radius, animation) |
| Dark/Light Mode | Full support with semantic system colors |
| Reduced Motion | Respects accessibility preferences |
| Snapshot Tests | UI regression testing with ImageRenderer |
| Native Integration | AppKit integration where SwiftUI falls short |

**Tech Stack:** Swift 6, SwiftUI, Swift Package Manager, Swift Testing (219 tests, 36 suites), OmniCore module
