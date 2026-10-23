# Omni — States

## Global states

| State            | Treatment                                              |
| ---------------- | ------------------------------------------------------ |
| busy             | Capture in progress; status line shows progress       |
| error            | Alert with `Snapshot:`-prefixed message and retry      |
| success          | Inline confirmation or toast, then auto-download      |
| hidden           | Contextual tabs start `.hidden`; shown on domain match |

## Capture flow

- Two message actions arrive from the popup: `captureView` and `captureFullPage`; both respond with `{ dataUrl }` or `{ error }` and the background **must return `true`** from the listener to keep the channel open for async capture.
- Popup flow stays idempotent: single `lastDataUrl` + filename, busy guard; autodownload default is PNG named from the tab's hostname/path.
- Errors are prefixed `Snapshot:` so they read consistently in the popup status line; never dump raw data URLs to logs.

## Client states

| Client condition                  | User-visible treatment                              |
| --------------------------------- | --------------------------------------------------- |
| Request in flight                 | Busy state on the capture button                     |
| Network failure                   | `Snapshot:`-prefixed error with retry                |
| Request aborted by the user       | Silent — no alert                                    |
| Retry in progress                 | Button shows spinner and is disabled                |
| Retry exhausted                   | Alert with the catalogue guidance for the code      |

## Job states

Not applicable — Omni has no background jobs. The nearest analogue is the capture flow above.