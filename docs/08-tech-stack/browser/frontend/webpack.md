# Webpack — Build Configuration (Omni)

## Overview

Webpack 5 bundles TypeScript/JS/CSS/assets. Dual outputs for MV2 and MV3.

## Best Practices

- Single entry set (background, content, popup); per-variant output paths.
- ts-loader for TS; css-loader/style-loader for CSS.
- CopyPlugin injects manifest + static files per variant.
- Stamp `__BUILD_VERSION__` into HTML.
- Source maps for dev; minimize in production as configured.
- Clean dist on build.
