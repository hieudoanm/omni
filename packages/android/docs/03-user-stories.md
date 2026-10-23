# 03 — User Stories

User goals and acceptance scenarios for Omni.

## Persona: End User

### Goal: Block a distracting app

**As a** easily distracted user,
**I want to** block specific apps so I cannot open them,
**so that** I can stay focused on work.

**Acceptance criteria:**

1. Focus Blocker shows a list of installed apps with checkboxes.
2. Enabling blocking with one toggle activates the blocker.
3. When a blocked app comes to the foreground, a full-screen overlay appears.
4. The overlay shows "Stay Focused" with the blocked app name and a "Go Home" button.
5. System apps are ignored by default.

### Goal: Read an NFC tag

**As a** user with NFC tags,
**I want to** read the data stored on a tag,
**so that** I can access information or trigger actions.

**Acceptance criteria:**

1. NFC Toolkit can read NDEF, tech, and tag tags.
2. Tag data is displayed after tapping the tag to the device.
3. Tag history is persisted and viewable later.

### Goal: Emulate an NFC card

**As a** user with an NFC-enabled access card,
**I want to** emulate the card with my phone,
**so that** I can tap my phone instead of the card.

**Acceptance criteria:**

1. HCE mode can be enabled in NFC Toolkit settings.
2. The phone responds to reader APDUs when tapped.
3. Card emulation profiles can be selected (planned).

## Persona: Power User

### Goal: Schedule blocking by time

**As a** user with focus hours,
**I want to** block Instagram from 9 PM to 7 AM automatically,
**so that** I don't use it late at night.

**Acceptance criteria (planned):**

1. Schedule entity supports package, start/end time, days of week.
2. Schedule editor UI allows time picking and day selection.
3. WorkManager enforces schedules.

### Goal: Run focus sessions

**As a** user doing deep work,
**I want to** start a Pomodoro-style focus session that blocks everything,
**so that** I can concentrate without distractions.

**Acceptance criteria (planned):**

1. Focus sessions with a timer.
2. All apps blocked during a focus session.
3. Daily usage limits per app (e.g. 60 min/day Instagram).

### Goal: Protect settings with a PIN

**As a** user sharing a device,
**I want to** PIN-protect settings and temporary unlock,
**so that** others cannot disable the blocker.

**Acceptance criteria (planned):**

1. PIN protection for settings.
2. Temporary unlock with PIN.

## Supporting files

See `03-user-stories/` for journey maps and acceptance-scenario tables.
