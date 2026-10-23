# TREE

```text
├── docs/
│   ├── 01-requirements/
│   │   ├── [functional-requirements.md](./docs/01-requirements/functional-requirements.md)
│   │   └── [non-functional-requirements.md](./docs/01-requirements/non-functional-requirements.md)
│   ├── 02-features/
│   │   ├── [FEATURE-01-New-Tab-Redirect.md](./docs/02-features/FEATURE-01-New-Tab-Redirect.md)
│   │   ├── [FEATURE-02-Distraction-Block-Wall.md](./docs/02-features/FEATURE-02-Distraction-Block-Wall.md)
│   │   ├── [FEATURE-03-Ad-Blocking.md](./docs/02-features/FEATURE-03-Ad-Blocking.md)
│   │   ├── [FEATURE-04-Capture.md](./docs/02-features/FEATURE-04-Capture.md)
│   │   ├── [FEATURE-05-GitHub-External-Links.md](./docs/02-features/FEATURE-05-GitHub-External-Links.md)
│   │   ├── [FEATURE-06-Instagram-Gesture.md](./docs/02-features/FEATURE-06-Instagram-Gesture.md)
│   │   ├── [FEATURE-07-Shopify-Detection.md](./docs/02-features/FEATURE-07-Shopify-Detection.md)
│   │   ├── [FEATURE-08-Chess-Focus.md](./docs/02-features/FEATURE-08-Chess-Focus.md)
│   │   ├── [FEATURE-09-Claude-Usage.md](./docs/02-features/FEATURE-09-Claude-Usage.md)
│   │   ├── [FEATURE-10-Sound-Tab-Audio.md](./docs/02-features/FEATURE-10-Sound-Tab-Audio.md)
│   │   └── [FEATURE-11-Back-to-Top.md](./docs/02-features/FEATURE-11-Back-to-Top.md)
│   ├── 03-user-stories/
│   │   ├── [US-001.md](./docs/03-user-stories/US-001.md)
│   │   ├── [US-002.md](./docs/03-user-stories/US-002.md)
│   │   ├── [US-003.md](./docs/03-user-stories/US-003.md)
│   │   ├── [US-004.md](./docs/03-user-stories/US-004.md)
│   │   ├── [US-005.md](./docs/03-user-stories/US-005.md)
│   │   ├── [US-006.md](./docs/03-user-stories/US-006.md)
│   │   ├── [US-007.md](./docs/03-user-stories/US-007.md)
│   │   ├── [US-008.md](./docs/03-user-stories/US-008.md)
│   │   ├── [US-009.md](./docs/03-user-stories/US-009.md)
│   │   ├── [US-010.md](./docs/03-user-stories/US-010.md)
│   │   ├── [US-011.md](./docs/03-user-stories/US-011.md)
│   │   └── [US-012.md](./docs/03-user-stories/US-012.md)
│   ├── 04-architecture/
│   │   └── mmd/
│   │       ├── [01-high-level-architecture.mmd](./docs/04-architecture/mmd/01-high-level-architecture.mmd)
│   │       ├── [02-capture-flow.mmd](./docs/04-architecture/mmd/02-capture-flow.mmd)
│   │       └── [03-shopify-detection-flow.mmd](./docs/04-architecture/mmd/03-shopify-detection-flow.mmd)
│   ├── 05-data-model/
│   ├── 06-api-specification/
│   ├── 07-ui-ux-design/
│   │   ├── brand/
│   │   │   ├── images/
│   │   │   │   ├── [omni-logo.png](./docs/07-ui-ux-design/brand/images/omni-logo.png)
│   │   │   │   ├── [omni-wordmark-alt.png](./docs/07-ui-ux-design/brand/images/omni-wordmark-alt.png)
│   │   │   │   └── [omni-wordmark.png](./docs/07-ui-ux-design/brand/images/omni-wordmark.png)
│   │   │   ├── svg/
│   │   │   │   ├── [omni-logo.svg](./docs/07-ui-ux-design/brand/svg/omni-logo.svg)
│   │   │   │   ├── [omni-wordmark-alt.svg](./docs/07-ui-ux-design/brand/svg/omni-wordmark-alt.svg)
│   │   │   │   └── [omni-wordmark.svg](./docs/07-ui-ux-design/brand/svg/omni-wordmark.svg)
│   │   │   ├── [brand.sh](./docs/07-ui-ux-design/brand/brand.sh)
│   │   │   └── [README.md](./docs/07-ui-ux-design/brand/README.md)
│   │   ├── prototypes/
│   │   │   ├── html/
│   │   │   │   ├── [00-components.html](./docs/07-ui-ux-design/prototypes/html/00-components.html)
│   │   │   │   ├── [01-popup-overview.html](./docs/07-ui-ux-design/prototypes/html/01-popup-overview.html)
│   │   │   │   ├── [02-popup-contextual.html](./docs/07-ui-ux-design/prototypes/html/02-popup-contextual.html)
│   │   │   │   ├── [03-capture-flow.html](./docs/07-ui-ux-design/prototypes/html/03-capture-flow.html)
│   │   │   │   └── [04-sound-tab.html](./docs/07-ui-ux-design/prototypes/html/04-sound-tab.html)
│   │   │   ├── images/
│   │   │   │   ├── dark/
│   │   │   │   │   ├── [00-components.png](./docs/07-ui-ux-design/prototypes/images/dark/00-components.png)
│   │   │   │   │   ├── [01-popup-overview.png](./docs/07-ui-ux-design/prototypes/images/dark/01-popup-overview.png)
│   │   │   │   │   ├── [02-popup-contextual.png](./docs/07-ui-ux-design/prototypes/images/dark/02-popup-contextual.png)
│   │   │   │   │   ├── [03-capture-flow.png](./docs/07-ui-ux-design/prototypes/images/dark/03-capture-flow.png)
│   │   │   │   │   └── [04-sound-tab.png](./docs/07-ui-ux-design/prototypes/images/dark/04-sound-tab.png)
│   │   │   │   └── light/
│   │   │   │       ├── [00-components.png](./docs/07-ui-ux-design/prototypes/images/light/00-components.png)
│   │   │   │       ├── [01-popup-overview.png](./docs/07-ui-ux-design/prototypes/images/light/01-popup-overview.png)
│   │   │   │       ├── [02-popup-contextual.png](./docs/07-ui-ux-design/prototypes/images/light/02-popup-contextual.png)
│   │   │   │       ├── [03-capture-flow.png](./docs/07-ui-ux-design/prototypes/images/light/03-capture-flow.png)
│   │   │   │       └── [04-sound-tab.png](./docs/07-ui-ux-design/prototypes/images/light/04-sound-tab.png)
│   │   │   ├── [.gitignore](./docs/07-ui-ux-design/prototypes/.gitignore)
│   │   │   ├── [pyproject.toml](./docs/07-ui-ux-design/prototypes/pyproject.toml)
│   │   │   ├── [README.md](./docs/07-ui-ux-design/prototypes/README.md)
│   │   │   ├── [screenshot.py](./docs/07-ui-ux-design/prototypes/screenshot.py)
│   │   │   ├── [screenshot.sh](./docs/07-ui-ux-design/prototypes/screenshot.sh)
│   │   │   └── [uv.lock](./docs/07-ui-ux-design/prototypes/uv.lock)
│   │   └── system/
│   │       ├── [accessibility.md](./docs/07-ui-ux-design/system/accessibility.md)
│   │       ├── [animation.md](./docs/07-ui-ux-design/system/animation.md)
│   │       ├── [components.md](./docs/07-ui-ux-design/system/components.md)
│   │       ├── [design-tokens.md](./docs/07-ui-ux-design/system/design-tokens.md)
│   │       ├── [iconography.md](./docs/07-ui-ux-design/system/iconography.md)
│   │       ├── [layout.md](./docs/07-ui-ux-design/system/layout.md)
│   │       ├── [responsive.md](./docs/07-ui-ux-design/system/responsive.md)
│   │       ├── [screens.md](./docs/07-ui-ux-design/system/screens.md)
│   │       └── [states.md](./docs/07-ui-ux-design/system/states.md)
│   ├── 08-tech-stack/
│   │   ├── backend/
│   │   │   ├── [background.md](./docs/08-tech-stack/backend/background.md)
│   │   │   ├── [content.md](./docs/08-tech-stack/backend/content.md)
│   │   │   └── [popup.md](./docs/08-tech-stack/backend/popup.md)
│   │   ├── frontend/
│   │   │   ├── [typescript.md](./docs/08-tech-stack/frontend/typescript.md)
│   │   │   ├── [webextension.md](./docs/08-tech-stack/frontend/webextension.md)
│   │   │   └── [webpack.md](./docs/08-tech-stack/frontend/webpack.md)
│   │   ├── infrastructure/
│   │   │   ├── [build.md](./docs/08-tech-stack/infrastructure/build.md)
│   │   │   └── [quality.md](./docs/08-tech-stack/infrastructure/quality.md)
│   │   └── tools/
│   │       ├── [pnpm.md](./docs/08-tech-stack/tools/pnpm.md)
│   │       └── [web-ext.md](./docs/08-tech-stack/tools/web-ext.md)
│   ├── 09-testing-strategy/
│   ├── 10-implementation-plan/
│   ├── 11-deployment/
│   ├── 12-operations/
│   ├── [00-overview.md](./docs/00-overview.md)
│   ├── [01-requirements.md](./docs/01-requirements.md)
│   ├── [02-features.md](./docs/02-features.md)
│   ├── [03-user-stories.md](./docs/03-user-stories.md)
│   ├── [04-architecture.md](./docs/04-architecture.md)
│   ├── [05-data-model.md](./docs/05-data-model.md)
│   ├── [06-api-specification.md](./docs/06-api-specification.md)
│   ├── [07-ui-ux-design.md](./docs/07-ui-ux-design.md)
│   ├── [08-tech-stack.md](./docs/08-tech-stack.md)
│   ├── [09-testing-strategy.md](./docs/09-testing-strategy.md)
│   ├── [10-implementation-plan.md](./docs/10-implementation-plan.md)
│   ├── [11-deployment.md](./docs/11-deployment.md)
│   ├── [12-operations.md](./docs/12-operations.md)
│   └── [README.md](./docs/README.md)
├── public/
│   ├── icons/
│   │   ├── [128x128.png](./public/icons/128x128.png)
│   │   ├── [16x16.png](./public/icons/16x16.png)
│   │   ├── [32x32.png](./public/icons/32x32.png)
│   │   ├── [48x48.png](./public/icons/48x48.png)
│   │   ├── [64x64.png](./public/icons/64x64.png)
│   │   ├── [96x96.png](./public/icons/96x96.png)
│   │   └── [icon.svg](./public/icons/icon.svg)
│   ├── manifest/
│   │   ├── v2/
│   │   │   └── [manifest.json](./public/manifest/v2/manifest.json)
│   │   └── v3/
│   │       ├── [manifest.json](./public/manifest/v3/manifest.json)
│   │       └── [rules.json](./public/manifest/v3/rules.json)
│   ├── [index.html](./public/index.html)
│   ├── [popup.css](./public/popup.css)
│   └── [popup.html](./public/popup.html)
├── src/
│   ├── lib/
│   │   ├── [ads.ts](./src/lib/ads.ts)
│   │   ├── [audio.ts](./src/lib/audio.ts)
│   │   ├── [backtotop.ts](./src/lib/backtotop.ts)
│   │   ├── [block.ts](./src/lib/block.ts)
│   │   ├── [chess.ts](./src/lib/chess.ts)
│   │   ├── [claude.ts](./src/lib/claude.ts)
│   │   ├── [github.ts](./src/lib/github.ts)
│   │   ├── [insta.ts](./src/lib/insta.ts)
│   │   ├── [newtab.ts](./src/lib/newtab.ts)
│   │   ├── [shopify.ts](./src/lib/shopify.ts)
│   │   ├── [snapshot.ts](./src/lib/snapshot.ts)
│   │   └── [sounds.ts](./src/lib/sounds.ts)
│   ├── utils/
│   │   ├── [frame.ts](./src/utils/frame.ts)
│   │   └── [log.ts](./src/utils/log.ts)
│   ├── [background.ts](./src/background.ts)
│   ├── [content.ts](./src/content.ts)
│   └── [popup.ts](./src/popup.ts)
├── [.gitignore](./.gitignore)
├── [.npmrc](./.npmrc)
├── [.prettierignore](./.prettierignore)
├── [.prettierrc.json](./.prettierrc.json)
├── [AGENTS.md](./AGENTS.md)
├── [eslint.config.mts](./eslint.config.mts)
├── [LICENSE](./LICENSE)
├── [Makefile](./Makefile)
├── [package.json](./package.json)
├── [README.md](./README.md)
├── [TREE.md](./TREE.md)
├── [tsconfig.json](./tsconfig.json)
└── [webpack.config.ts](./webpack.config.ts)
```

35 directories, 133 files
