# Omni — Deployment / Packaging

## 1. Build Commands

- pnpm build --filter=@omni/browser (runs clean+lint+format+webpack+make build)
- make build produces dist/v2, dist/v3 and download/v2, download/v3 with zip/xpi/crx.

## 2. Artifacts

- zip: plain archive of dist/
- xpi: web-ext build for Firefox (MV2)
- crx: Chrome --pack-extension (skips if Chrome absent)

## 3. Release

Tag browser-<version>, attach download/v2/* and download/v3/*, keep browser-latest rolling. See PACKAGING.md and DOWNLOADS.md.

## 4. Store Targets

Chrome Web Store (MV3), Edge Add-ons (MV3), Mozilla AMO (MV2). Gecko id: omni-extension@hieudoanm.github.io.

## 5. Checksums

Generated/recorded in download/README.md per build.
