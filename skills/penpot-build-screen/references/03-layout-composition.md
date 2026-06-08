# 03 — Layout & composition

## Structure
- Root: a **column** flex Board (the screen). Sections stack with a consistent `rowGap` (a spacing token).
- Each section: its own flex Board (`row` or `column`) with its own padding/gap on the scale.
- Use `horizontalSizing`/`verticalSizing` = `fill`/`auto`/`fix` to express responsive intent.

## Hierarchy
- One clear primary action per screen (use the Primary button variant).
- Group related content; separate groups with spacing, not borders, where possible.
- Type hierarchy from semantic tokens: `text.heading.h1` → `text.body` → `text.label`.

## Rhythm
- All gaps/padding from the spacing scale (4px grid). Keep inset rhythm consistent across sections.
- Align to a grid; use `penpot.alignHorizontal/alignVertical/distribute*` for precise alignment.

## Responsive intent
State how each section should behave when the viewport changes (which children `fill`, which stay
`fix`). Even if you only build one breakpoint, record the intent for handoff.
