# 10 — Implementation Plan

Phased delivery plan for Omni.

## Phase 1 — Super App Merge (Shipped)

- [x] Merge `block` and `nfc` into one Gradle project: single `:app` module bundling the hub + `block` + `nfc` source packages
- [x] Single `OmniApp` `@HiltAndroidApp` (removed old application classes)
- [x] Hub home screen — card list launching each feature activity
- [x] Remove launcher icons/filters from features; move to the hub
- [x] Namespaced feature string labels (`block_app_name`, `nfc_app_name`)
- [x] Keep full `block` unit suite + add hub + `nfc` smoke tests
- [x] Omni branding: workflows, store entry, landing page, docs

## Phase 2 — Blocker Polish

> Harden the blocking flow and improve UX.

- [ ] AccessibilityService resilience — handle service restart, crash recovery
- [ ] Proper handling of rapid app switching (debounce foreground events)
- [ ] Launch-on-boot via BroadcastReceiver
- [ ] Onboarding flow — guide user through enabling AccessibilityService
- [ ] Temporary disable (timer-based or until screen off)
- [ ] Blocked attempt counter and statistics display

## Phase 3 — Schedules

> Time-based blocking rules.

- [ ] Schedule entity (Room) — package, start/end time, days of week
- [ ] Schedule editor UI (time picker, day selector)
- [ ] WorkManager integration for schedule enforcement
- [ ] Per-app schedules (block Instagram 9 PM–7 AM, etc.)

## Phase 4 — NFC Toolkit

> Round out tag workflows and history.

- [ ] Rich tag payload editing (write NDEF records)
- [ ] Tag comparison / cloning guard
- [ ] Export tag history (CSV / JSON)
- [ ] Card emulation profiles (selectable AIDs)

## Phase 5 — Focus Mode

> Turn blocking into a focus tool.

- [ ] Focus sessions (Pomodoro-style timer)
- [ ] Block everything during focus session
- [ ] Daily usage limits per app (e.g. 60 min/day Instagram)
- [ ] Category-based blocking (social, games, streaming, shopping)

## Phase 6 — Advanced

> Power-user features and platform polish.

- [ ] PIN protection for settings and temporary unlock
- [ ] Widget — quick toggle blocker on/off
- [ ] Material You dynamic color polish
- [ ] Accessibility pass — TalkBack labels on all interactive elements
- [ ] E2E testing with Espresso / Compose Testing

## Supporting files

See `10-implementation-plan/` for the phase timeline and milestone dates.
