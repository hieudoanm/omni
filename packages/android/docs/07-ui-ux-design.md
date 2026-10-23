# 07 — UI/UX Design

UI tokens, layout, states, and accessibility for Omni.

## Design Principles

- **Kotlin first** — no Java source files.
- **Compose for all UI** — no XML layouts.
- **MVVM** — `Screen` composable owns a `ViewModel` via `hiltViewModel()`.
- **StateFlow + collectAsStateWithLifecycle** for reactive UI.
- **`val` over `var`** — prefer immutability.
- **Explicit types** — prefer explicit return types on public functions.
- **Small files** — aim for < 200 lines per file.
- **Small functions** — aim for < 30 lines per function.
- **No comments** unless the intent is genuinely non-obvious.

## Material Design 3

All UI follows Material Design 3 with Jetpack Compose. Theme names stay distinct: `Theme.FocusBlock`, `Theme.NfcToolkit`, `Theme.Omni` — merged into one `themes.xml`.

## Feature string labels

Feature string labels are namespaced to avoid collisions: `block_app_name`, `nfc_app_name`. The hub label is `app_name` (Omni).

## Resources

- Launcher icon lives in `res/mipmap-anydpi-v26/ic_launcher.xml` (hub).
- Feature theme names merged into one `themes.xml`.

## Dark Mode

NFC Toolkit settings include dark mode via DataStore (`dark_mode` preference).

## Accessibility

- AccessibilityService for Focus Blocker blocking.
- TalkBack labels on all interactive elements (planned).
- Accessibility pass (planned).

## Supporting files

See `07-ui-ux-design/` for Compose theme definitions, screen mockups, and accessibility audit.
