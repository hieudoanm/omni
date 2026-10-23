# Omni — Critical Test Scenarios

## Android (`packages/android`)

### Focus Blocker

1. **App blocking enforced** — Accessibility service blocks selected apps when timer active.
2. **Timer persists** — Survives process death, device reboot (WorkManager).
3. **Settings sync** — DataStore changes reflect immediately in UI (Flow).
4. **Database migration** — Room schema v1→v2 preserves blocked apps.
5. **Compose preview** — All screens render in `@Preview` without crash.

### NFC Toolkit

6. **Tag dispatch priority** — Foreground dispatch catches tag before other apps.
7. **NDEF parsing** — Text, URI, MIME, AAR records parsed correctly.
8. **Tech list fallback** — `ACTION_TAG_DISCOVERED` catches tags with no NDEF.
9. **HCE service** — ISO-DEP APDU exchange works with reader.
10. **History persistence** — Room stores scan history, survives clear data.

### Cross-Cutting

11. **Hilt DI** — All `@HiltViewModel` inject correctly; no `MissingBinding` at runtime.
12. **Lint clean** — Zero Android Lint errors/warnings.
13. **Robolectric coverage** — All ViewModels, repositories, use cases tested.

## macOS (`packages/macos`)

### System Monitoring

1. **Memory parse** — `vm_stat` → correct free/active/inactive/wired/swap.
2. **Storage parse** — `df -h` → correct APFS volumes, purgeable, snapshots.
3. **Network parse** — `lsof -i` → per-process connections, listen ports.
4. **CPU parse** — `sysctl` + `powermetrics` → per-core usage, thermal.
5. **Disk health** — `smartctl -a` → SMART attributes, temperature.

### UI & Design System

6. **Snapshot tests** — All menu-bar views match reference PNGs.
7. **Reduced motion** — Animations disabled when `prefers-reduced-motion`.
8. **Dark/light** — Tokens adapt correctly in both appearances.
9. **Accessibility** — VoiceOver labels, keyboard navigation, contrast.

### App Bundle

10. **Codesign** — `make app` produces valid signed `.app` with entitlements.
11. **Info.plist** — Bundle ID, version, permissions correct.
12. **DMG creation** — `make dmg` produces mountable distributable.

## CLI (`packages/cli`)

### Calc Modules (10)

1. **Age** — Birthdate → correct age (leap years, timezone edge).
2. **Base** — 2–36 conversion, negative, fractional.
3. **BMI** — Metric/imperial, categories.
4. **Compound** — Future value, APY, contribution schedules.
5. **Currency** — Live rates (cached), historical, inverse.
6. **Date** — Diff, add/sub, business days, timezone.
7. **Loan** — Payment, amortization, early payoff.
8. **Percent** — Increase, decrease, percentage of, reverse.
9. **Tip** — Split, round, custom percentages.
10. **Unit** — Length, weight, temp, volume, data, time.

### Casino Modules (8)

11. **Blackjack play** — TUI: hit/stand/double, dealer rules, 3:2 payout.
12. **Blackjack count** — Hi-Lo running/true count, betting strategy.
13. **Blackjack cheatsheet** — Basic strategy table, soft/hard/pair.
14. **Poker odds** — Equity vs range, outs, pot odds.
15. **Poker hand** — Ranking, best 5 of 7, tie-breaking.
16. **Baccarat** — Player/Banker/Tie, commission, streak tracking.
17. **Roulette** — Inside/outside bets, European/American, payouts.
18. **Slots/Dice/Coin** — RNG fairness, payout tables.

### Crypto & Security

19. **Hash** — SHA-256/512, BLAKE2, RIPEMD, file/stdin.
20. **Encrypt/Decrypt** — AES-GCM, ChaCha20-Poly1305, key derivation.
21. **JWT** — Encode/decode, RS256/HS256, claims validation.
22. **Passwd** — bcrypt, argon2, scrypt, verify.
23. **TOTP** — RFC 6238, time-step, secret encoding.

### File & Data

24. **Better du/ls/find/ps/which** — Output matches GNU coreutils.
25. **Encode** — Base64, URL, hex, raw.
26. **Rename** — Patterns, regex, dry-run, undo.
27. **Split** — By size, lines, count, reassemble.
27. **CSV/JSON/Excel** — Parse, transform, export, streaming.

### Network

28. **Curl** — Methods, headers, body, redirects, certs.
29. **DNS** — A/AAAA/MX/TXT/NS/CNAME, DoH/DoT.
30. **Whois** — Domain/IP, recursive, rate-limit handling.
31. **Port scan** — TCP/UDP, banner grab, service detection.

### System & OS

32. **CPU/Disk/Mem/Load** — Cross-platform (Linux/macOS), units.
33. **Proc** — List, filter, tree, memory maps.
34. **Clipboard** — Read/write, image, format detection.

### Web & AI

35. **Fetch** — HTTP/2, streaming, timeout, retry.
36. **YouTube** — Thumbnails, transcript, no API key.
37. **Gemini** — Text generation, code, safety filters.

### MCP Server

38. **Tool listing** — All 33 modules exposed as MCP tools.
39. **Tool invocation** — Stdio transport, JSON-RPC, error codes.
40. **Schema** — Input/output schemas match Cobra commands.

### Cross-Cutting

41. **Cross-compile** — `make build-all` produces 4 working binaries.
42. **Version injection** — `-ldflags` embeds date-sha in `omni version`.
43. **Install script** — Downloads correct binary for OS/arch from `latest`.
44. **PDF (pdfcpu v0.15)** — All subcommands work; v0.16.x rejected.
45. **Golden tests** — CLI output matches `testdata/golden/`.

## Browser (`packages/browser`)

### Extension Core

1. **Manifest V3** — Service worker registers, handles messages.
2. **Content script** — Injected on match patterns, communicates with background.
3. **Popup** — Opens, renders React UI, saves settings.
4. **Options** — Persists settings to `chrome.storage.sync`.

### Messaging

5. **Background ↔ Content** — Request/response, async, error handling.
6. **Popup ↔ Background** — Settings sync, action triggers.

### Build

7. **TypeScript strict** — Zero `any`, all paths typed.
8. **Webpack** — Separate entries, no chunk overlap, source maps.
9. **ESLint** — Zero errors, React hooks rules pass.

## Integration Scenarios

### Cross-Platform Parity

| Feature | Android | macOS | CLI | Browser |
|---------|---------|-------|-----|---------|
| Settings sync | DataStore | UserDefaults | File/flag | chrome.storage |
| Theme | Compose tokens | DesignTokens | ANSI/flags | Tailwind CSS |
| Storage | Room + DataStore | File (JSON) | File | IndexedDB |

### Release Validation

1. **Rolling `latest`** — Every master push updates release artifacts.
2. **Install script** — Works on clean Linux/macOS, installs to `~/bin`.
3. **Docker** — `docker run omni-cli` executes all commands.
4. **Artifacts present** — APK, .app, 4 binaries, dist/ all uploaded.