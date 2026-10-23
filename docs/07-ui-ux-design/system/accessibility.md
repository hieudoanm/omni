# Omni — Accessibility

- Buttons have accessible labels; focus visible; high-contrast text; `aria-live` for dynamic status where useful.
- The file drop (New Tab target URL input) labels its input; the input is not hover-only.
- Status badges carry text, not colour alone.
- Errors are associated with their control where applicable.
- Contrast meets the dark-theme tokens on `surface` in both states.
- `prefers-reduced-motion: reduce` disables non-essential animation and smooth scrolling (Back to Top).
- Download links announce their filename; unavailable artefacts are not focusable.
- Page-level waits use a labelled spinner (`role="status"`), not a bare `<div>`.