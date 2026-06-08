# Glossary — Penpot terms (and Figma equivalents)

| Penpot | Figma equivalent | Notes |
|--------|------------------|-------|
| **Board** | Frame / Artboard | `penpot.createBoard()`. Containers for layout; can hold flex/grid. |
| **Flex layout** | Auto Layout | `board.addFlexLayout()`; `dir`, gaps, padding, sizing `fill`/`auto`/`fix`. |
| **Grid layout** | (no direct 1:1) | `board.addGridLayout()`. |
| **Token set** | Variable collection | `penpot.library.local.tokens.sets`; we use `primitives`/`semantic`/`components`. |
| **Token** | Variable | `set.addToken({type,name,value})`; value may reference `{another.token}`. |
| **Theme** | Variable mode | `tokens.addTheme(group, name)`; switches semantic values (e.g. Light/Dark). |
| **Component** | Component | `library.createComponent(shapes)`; `component.instance()`. |
| **Variant container** | Component set | `createVariantFromComponents` / `combineAsVariants`; switch via `switchVariant`. |
| **Instance** | Instance | `comp.instance()`; `detach()` to break the link. |
| **Library (local/connected)** | Library | `penpot.library.local` / `.connected`. |
| **Shared plugin data** | (plugin data) | `setSharedPluginData(ns, key, value)` — persisted in the file; our run ledger. |
| **`execute_code`** | (plugin API console) | Runs JS in the Plugin API; the only mutation path. |
| **`export_shape`** | Export | Renders a shape to PNG/SVG for visual validation. |

## Token tiers (this kit)
- **primitive** — raw scale value (`color.blue.500`).
- **semantic** — intent alias referencing a primitive (`color.text.default`); shapes bind here.
- **component** — optional per-component alias referencing a semantic token (`button.primary.bg`).

## Modes (this kit)
- **Suggest** — propose only. **Apply-with-review** — change then checkpoint. **Auto-fix** — safe set only.
