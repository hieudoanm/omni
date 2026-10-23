# Non-Functional Requirements

| ID      | Requirement                                                                    | Target               | Notes                                                                            |
| ------- | ------------------------------------------------------------------------------ | -------------------- | -------------------------------------------------------------------------------- |
| NFR-001 | Offline-first: all core features work without network                          | 100%                 | Redirect, block, ads, capture                                                    |
| NFR-002 | Cross-browser parity MV2/MV3                                                   | Parity or documented | Keep features working or note version-specific                                   |
| NFR-003 | Idempotent content scripts                                                     | Required             | No stacked listeners on re-injection                                             |
| NFR-004 | Full-page capture restores scroll position                                     | Near-100%            | Try to restore; log failures                                                     |
| NFR-005 | Performance: capture chunks settle with SETTLE_EXTRA_MS, frame-scheduled scans | Smooth               | Avoid jank; batch DOM mutations                                                  |
| NFR-006 | Security: minimal permissions, no telemetry, noopener/noreferrer for new tabs  | Required             | Clipboard limited by protected pages                                             |
| NFR-007 | Type safety                                                                    | strict TypeScript    | No any, explicit types on exports                                                |
| NFR-008 | Build reproducibility                                                          | Deterministic        | Clean lint/format before build, webpack dual output                              |
| NFR-009 | Firefox compatibility                                                          | MV2                  | web-ext lint clean                                                               |
| NFR-010 | Error logging with consistent prefixes                                         | Required             | Snapshot:, Block:, BlockAds:, GitHub:, Insta:, Shopify:, Chess:, Claude:, Sound: |
