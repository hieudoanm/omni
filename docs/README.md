# Omni — Documentation

All project documentation lives here, organized by topic. Platform-specific
documents sit alongside the monorepo-level ones as `<platform>.md` files or
`<platform>/` directories.

## Topic map

| Topic | Monorepo | macOS (`packages/desktop/macos`) | Android (`packages/mobile/android`) | Browser (`packages/extensions/browser`) |
| ----- | -------- | ------------------------------- | --------------------------------- | -------------------------------------- |
| [00 — Overview](00-overview/) | — | [macos.md](00-overview/macos.md) | [android.md](00-overview/android.md) | [browser.md](00-overview/browser.md) |
| [01 — Requirements](01-requirements/) | — | [macos.md](01-requirements/macos.md) | [android.md](01-requirements/android.md) | [browser.md](01-requirements/browser.md) + [browser/](01-requirements/browser/) |
| [02 — Features](02-features.md) | Feature-to-package mapping | [macos.md](02-features/macos.md) | [android.md](02-features/android.md) | [browser.md](02-features/browser.md) + [browser/](02-features/browser/) |
| [03 — User Stories](03-user-stories/) | — | [macos.md](03-user-stories/macos.md) | [android.md](03-user-stories/android.md) | [browser.md](03-user-stories/browser.md) + [browser/](03-user-stories/browser/) |
| [04 — Architecture](04-architecture/) | — | [macos.md](04-architecture/macos.md) | [android.md](04-architecture/android.md) | [browser.md](04-architecture/browser.md) + [browser/](04-architecture/browser/) |
| [05 — Data Model](05-data-model/) | — | [macos.md](05-data-model/macos.md) | [android.md](05-data-model/android.md) | [browser.md](05-data-model/browser.md) |
| [06 — API Specification](06-api-specification/) | — | [macos.md](06-api-specification/macos.md) | [android.md](06-api-specification/android.md) | [browser.md](06-api-specification/browser.md) |
| [07 — UI/UX Design](07-ui-ux-design/README.md) | Browser popup design system | [macos.md](07-ui-ux-design/macos.md) | [android.md](07-ui-ux-design/android.md) | [browser.md](07-ui-ux-design/browser.md) + [prototypes/](07-ui-ux-design/prototypes/) |
| [08 — Tech Stack](08-tech-stack.md) | Cross-platform decisions | [macos/](08-tech-stack/macos/README.md) | [android/](08-tech-stack/android/README.md) | [browser/](08-tech-stack/browser/README.md) |
| [09 — Testing Strategy](09-testing-strategy.md) | Cross-platform test layers | [macos.md](09-testing-strategy/macos.md) | [android.md](09-testing-strategy/android.md) | [browser.md](09-testing-strategy/browser.md) |
| [10 — Implementation Plan](10-implementation-plan/) | — | [macos.md](10-implementation-plan/macos.md) | [android.md](10-implementation-plan/android.md) | [browser.md](10-implementation-plan/browser.md) |
| [11 — Deployment](11-deployment/) | — | [macos.md](11-deployment/macos.md) | [android.md](11-deployment/android.md) | [browser.md](11-deployment/browser.md) |
| [12 — Operations](12-operations/) | — | [macos.md](12-operations/macos.md) | [android.md](12-operations/android.md) | [browser.md](12-operations/browser.md) |

The macOS desktop app, Android app, and Browser extension have per-topic spec
documents under `docs/<topic>/<platform>.md`. Other packages keep their docs
in-tree (`packages/cli.go/docs/`).

Package-level conventions and commands are indexed in the root
[`AGENTS.md`](../AGENTS.md).
