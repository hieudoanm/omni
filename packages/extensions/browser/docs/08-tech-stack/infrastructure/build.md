# Build & Packaging (Omni)

## Overview

Dual build via Webpack; packaging via make + web-ext.

## Best Practices

- Deterministic: clean before build, lint/format in prebuild.
- Version stamping from build timestamp into HTML.
- Artifacts: dist/v2, dist/v3, download/v2, download/v3 (.zip, .xpi, .crx).
- web-ext lint clean on both variants before release.
