# Ship

## Build & Test

```bash
pnpm dev          # Start Next.js dev server
pnpm test         # Run all Jest tests
pnpm tsc --noEmit # TypeScript type check
pnpm lint         # ESLint
```

## File Structure

```text
Ship/
  index.tsx                        # Page entry: state, localStorage, YAML parse, html2canvas export
  types.ts                         # TemplateDef, FieldDef, PostItem
  data/
    templates-schema.ts            # TEMPLATES[] (216 defs) + DEFAULT_CONTENT_MAP
    docs-import.ts                 # Re-exports docs/templates.md + docs/posts.md
  docs/                            # Markdown reference docs (templates, posts, series, sizing)
  components/
    editor/                        # YAML editor panels (single/full doc)
    modal/                         # Preview/Raw/Template-doc tabs
    preview/                       # Preview pane + post navigation
    sidebar/                       # Template + post list sidebar
    toolbar/                       # Font, ratio, username, filename controls
    templates/                     # 216 template components (one per template id)
      _shared/                     # Header, Footer, Background wrappers
      common.ts                    # TemplateProps ({ data })
  posts/
    README.md                      # Post inventory table
    TREE.md                        # Post file tree reference
    next/<topic>/                  # Draft/upcoming posts (part-N-*.yaml or topic yaml)
    archive/YYYY/Qn/MM/            # Published daily posts YYYY-MM-DD-dow.yaml
```

## Templates

- Each template is defined twice, kept in sync:
  - `data/templates-schema.ts` — `TEMPLATES` entry (id, label, description,
    group, category, schema fields, defaultContent)
  - `components/templates/<group>/<category>/<Name>.tsx` — component registered
    in `components/templates/index.ts` `TEMPLATE_MAP` under the same id
- Template components receive only `data: Record<string, unknown>`; read fields
  with defaults so missing keys never crash
- Every template schema ends with a `citation` field
- `docs/templates.md` is the human reference for the same 216 templates

## Post YAML Format

```yaml
# Post 1 (Template Label)
template-id:
  field: 'value'
  items:
    - 'item'
  citation: ''
```

- Full post files join docs with `---` separators, each headed by a
  `# Post N (Label)` comment
- `posts/next/<topic>/` uses `part-N-*.yaml` for multi-part series
- `posts/archive/YYYY/Qn/MM/` uses `YYYY-MM-DD-dow.yaml`
- Adding a template requires: schema entry, component, `TEMPLATE_MAP` key,
  `docs/templates.md` section, and a `posts/README.md` row

## Coding Rules

1. Arrow functions only — no `function` keyword
2. Explicit types on all exports — never `any`
3. Keep template components pure — render from `data` only, no app state
4. TailwindCSS v4 + DaisyUI v5
5. Icons: `react-icons/pi`
6. Keep files under 200 lines, functions under 30 lines
7. Export: `html2canvas-pro` via `@hieudoanm.github.io/utils/canvas` helpers
8. Persist via localStorage (`ship-*` keys), debounced ~300ms
