# VibeSlotCode — Full-Stack Idea Generator

## Table of Contents

- [VibeSlotCode — Full-Stack Idea Generator](#vibeslotcode--full-stack-idea-generator)
  - [Table of Contents](#table-of-contents)
  - [Data](#data)
  - [Reel Positions](#reel-positions)
    - [Tech Stacks (Reels 1–4)](#tech-stacks-reels-14)
    - [Project Idea (Reel 5)](#project-idea-reel-5)
  - [Tech Stacks (Reels 1–4 Coherent Combos)](#tech-stacks-reels-14-coherent-combos)
    - [Web](#web)
    - [Mobile](#mobile)
    - [Desktop](#desktop)
    - [Game](#game)
    - [CLI](#cli)
    - [Data Science](#data-science)
  - [Spin Logic](#spin-logic)
  - [Adding/Editing Items](#addingediting-items)

---

## Data

- `data/stacks.csv` — 6 categories × 4 tech types × 10 items (240 rows).
  Categories: web, mobile, desktop, game, cli, data-science.
- `data/projects.csv` — 6 categories × 6 project types × 10 items (360 rows).
  Categories match stacks: web, mobile, desktop, game, cli, data-science.
  Index-based pairing in `constants.ts` means reel 5 always comes from the same
  category as reels 1–4.
- `data/stacks.json` — generated from `stacks.csv` via `convert-csv-to-json.ts`.
- `data/projects.json` — generated from `projects.csv` via
  `convert-projects-to-json.ts`.
- `constants.ts` merges both JSON files so `CATEGORIES` has 5 reels (4 tech + 1
  flattened project reel with 60 options).

Run from the Next.js root (`packages/app/hybrid/hieudoanm`):

```bash
npx tsx src/components/routes/apps/bored/VibeSlotCode/data/scripts/convert-csv-to-json.ts
npx tsx src/components/routes/apps/bored/VibeSlotCode/data/scripts/convert-projects-to-json.ts
```

---

## Reel Positions

### Tech Stacks (Reels 1–4)

| Category     | Reel 1    | Reel 2     | Reel 3    | Reel 4       |
| ------------ | --------- | ---------- | --------- | ------------ |
| Web          | framework | styling    | backend   | database     |
| Mobile       | framework | styling    | store     | backend      |
| Desktop      | framework | ui-toolkit | packaging | distribution |
| Game         | engine    | rendering  | physics   | tooling      |
| CLI          | language  | parser     | runtime   | tui          |
| Data Science | language  | framework  | viz       | notebook     |

### Project Idea (Reel 5)

Reel 5 matches the active category — if reels 1–4 land on "web", reel 5 picks
from web projects. Each category has 6 project types × 10 items = 60 options.

| Category     | Project Types (6 per category)                                |
| ------------ | ------------------------------------------------------------- |
| Web          | cms, e-commerce, analytics, collaboration, social, publishing |
| Mobile       | social, game, productivity, lifestyle, utility, education     |
| Desktop      | editor, creative, media, productivity, communication, utility |
| Game         | puzzle, platformer, rpg, shooter, strategy, simulation        |
| CLI          | dev-tool, automation, monitoring, text, network, file         |
| Data Science | analysis, pipeline, viz, ml, database, etl                    |

## Tech Stacks (Reels 1–4 Coherent Combos)

Each index position (0–9) across reels 1–4 forms a coherent stack.

### Web

| Idx | Framework | Styling      | Backend     | Database    |
| --- | --------- | ------------ | ----------- | ----------- |
| 0   | React     | Tailwind CSS | Express.js  | PostgreSQL  |
| 1   | Vue       | DaisyUI      | Django      | SQLite      |
| 2   | Angular   | Material UI  | Spring Boot | MySQL       |
| 3   | Svelte    | Shadcn/ui    | Hono        | Turso       |
| 4   | Solid     | UnoCSS       | FastAPI     | MongoDB     |
| 5   | Lit       | Mantine      | Nest.js     | Prisma      |
| 6   | Qwik      | Radix UI     | Axum        | Redis       |
| 7   | Alpine    | Headless UI  | Rails       | Neon        |
| 8   | Preact    | Chakra UI    | Gin         | PlanetScale |
| 9   | Ember     | Ant Design   | Ktor        | Supabase    |

### Mobile

| Idx | Framework            | Styling           | Store                | Backend     |
| --- | -------------------- | ----------------- | -------------------- | ----------- |
| 0   | React Native         | NativeWind        | App Store            | Firebase    |
| 1   | Flutter              | Tailwind CSS      | Google Play          | Supabase    |
| 2   | Kotlin Multiplatform | Shadcn/ui         | Amazon Appstore      | AWS Amplify |
| 3   | Expo                 | Tamagui           | Huawei AppGallery    | Appwrite    |
| 4   | Ionic                | Styled Components | F-Droid              | Parse       |
| 5   | Capacitor            | UnoCSS            | Samsung Galaxy Store | PocketBase  |
| 6   | SwiftUI              | Emotion           | APKPure              | Nhost       |
| 7   | Jetpack Compose      | Restyle           | Aptoide              | Kinvey      |
| 8   | NativeScript         | Gluestack         | Tizen Store          | Backendless |
| 9   | Xamarin              | StyleX            | GetJar               | Realm       |

### Desktop

| Idx | Framework             | UI Toolkit | Packaging        | Distribution    |
| --- | --------------------- | ---------- | ---------------- | --------------- |
| 0   | Electron              | CEF        | Electron Builder | GitHub Releases |
| 1   | Tauri                 | WebView    | Tauri Bundler    | Mac App Store   |
| 2   | Qt                    | Qt Widgets | WiX              | Microsoft Store |
| 3   | .NET MAUI             | WinUI      | NSIS             | Chocolatey      |
| 4   | Flutter Desktop       | GTK        | Inno Setup       | Steam           |
| 5   | Compose Multiplatform | Sciter     | DMG Canvas       | itch.io         |
| 6   | JavaFX                | FLTK       | Flatpak          | Flathub         |
| 7   | SwiftUI macOS         | Dear ImGui | AppImage         | Snap Store      |
| 8   | Uno Platform          | Nuklear    | Snap             | Scoop           |
| 9   | Avalonia              | wxWidgets  | Homebrew         | winget          |

### Game

| Idx | Engine        | Rendering  | Physics   | Tooling        |
| --- | ------------- | ---------- | --------- | -------------- |
| 0   | Unity         | DirectX    | PhysX     | Blender        |
| 1   | Unreal Engine | Vulkan     | Havok     | Aseprite       |
| 2   | Godot         | OpenGL     | Rapier    | Tiled          |
| 3   | GameMaker     | WebGL      | Box2D     | LDtk           |
| 4   | Phaser        | Metal      | Bullet    | Spine          |
| 5   | PixiJS        | Three.js   | Matter.js | TexturePacker  |
| 6   | Construct     | Babylon.js | Ammo.js   | Audacity       |
| 7   | Cocos Creator | WebGPU     | Chipmunk  | GIMP           |
| 8   | Defold        | PlayCanvas | Cannon.js | Krita          |
| 9   | Bevy          | Wgpu       | Jolt      | Material Maker |

### CLI

| Idx | Language   | Parser               | Runtime | TUI        |
| --- | ---------- | -------------------- | ------- | ---------- |
| 0   | Go         | Cobra                | Go      | Bubble Tea |
| 1   | Rust       | Clap                 | Rust    | Ratatui    |
| 2   | TypeScript | Commander            | Node.js | Ink        |
| 3   | Python     | Click                | Python  | Textual    |
| 4   | Ruby       | optparse             | Ruby    | TTY        |
| 5   | Kotlin     | Clikt                | JVM     | Mordant    |
| 6   | C          | getopt               | C       | ncurses    |
| 7   | Haskell    | optparse-applicative | GHC     | Brick      |
| 8   | Java       | picocli              | JVM     | Lanterna   |
| 9   | Nim        | cligen               | Nim     | illwill    |

### Data Science

| Idx | Language   | Framework    | Viz        | Notebook   |
| --- | ---------- | ------------ | ---------- | ---------- |
| 0   | Python     | PyTorch      | Matplotlib | Jupyter    |
| 1   | R          | TensorFlow   | Seaborn    | RStudio    |
| 2   | Julia      | JAX          | Plotly     | JupyterLab |
| 3   | Scala      | XGBoost      | Bokeh      | Colab      |
| 4   | SQL        | LangChain    | Vega-Lite  | Observable |
| 5   | TypeScript | Hugging Face | D3.js      | Deepnote   |
| 6   | MATLAB     | Scikit-learn | Grafana    | Kaggle     |
| 7   | Go         | Keras        | Tableau    | VS Code    |
| 8   | Rust       | LightGBM     | Altair     | Quarto     |
| 9   | Java       | CatBoost     | Looker     | Hex        |

## Spin Logic

- **Reels 1–4** (tech): `spinAll` picks a random `baseIndex` (0–9); all 4 reels
  land on `options[baseIndex]` for a coherent tech stack.
- **Reel 5** (project): lands on a random item from the active category's 60
  project options (6 project types × 10 items flattened).
- **Single spins** (per-reel): always fully random.
- During the spin animation, all 5 reels cycle random items for the slot-machine
  effect. Reels land staggered (1s apart).

---

## Adding/Editing Items

1. Edit `data/stacks.csv` for tech items or `data/projects.csv` for project
   items. Keep each type exactly 10 items.
2. Regenerate both JSON files by running the two convert scripts from the
   Next.js root.
3. Verify with `pnpm tsc --noEmit`.
