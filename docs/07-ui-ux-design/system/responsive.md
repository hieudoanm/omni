# Omni — Responsive Design

| Viewport | Width    | Behaviour                                                  |
| -------- | -------- | ---------------------------------------------------------- |
| popup    | 320–360  | Fixed-width toolbar popup; tab bar scrolls horizontally    |

Rules:

- The popup is fixed size; it is not responsive to the viewport beyond the browser's own constraints.
- The tab bar scrolls horizontally when the popup width is too narrow for all 11 tabs.
- Contextual tabs start hidden and are revealed only when the active tab's hostname matches.