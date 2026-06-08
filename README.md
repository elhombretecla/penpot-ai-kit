# Penpot AI Kit

**Let an AI assistant work directly inside your Penpot file, while you stay in control.**

Penpot’s MCP already works well with the right prompts. You can ask an AI assistant like Claude, OpenCode or Cursor to edit a real Penpot file, use your components and design tokens, follow your system rules, check accessibility, and show you changes before they are applied.

This AI Kit builds on that.

Instead of writing a fresh prompt for every task, you give the assistant a clear set of skills and instructions. That helps it handle common workflows more reliably, move faster, and produce better results with less back-and-forth.

This is not a “type a prompt and get a flat image” workflow. The AI creates real Penpot designs you can edit afterward, with actual tokens, components, and layouts.

The kit is meant to be adapted. You can shape it around your team’s workflow, add new skills, refine the agent’s instructions, and share improvements so it works better across different projects and design systems.

> New to this? The fastest path is to let your AI assistant **install the kit for you** —
> see **[Fastest setup](#fastest-setup--let-your-assistant-install-it)** below. Prefer to do it by
> hand? The **[Quick start for designers](#quick-start-for-designers)** walks every step. No coding required.

---

## What you can ask it to do

Just describe what you want in plain language. The kit figures out the right tool for the job.

| You say… | It does… |
|----------|----------|
| “Set up a color, spacing and type system (design tokens) for this file.” | Builds a clean, themeable token system (incl. light/dark). |
| “Create a Button with all its states — hover, pressed, focus, disabled.” | Builds a real component with a complete set of variants, fully tokenized. |
| “Design a dashboard (or landing page) from this brief.” | Builds the screen section by section, using your existing system. |
| “Turn this app screen / code into a Penpot design.” | Recreates it in Penpot, wired to your tokens. |
| “Check this screen for accessibility problems.” | Audits contrast, tap-target sizes, headings (WCAG AA) and reports issues. |
| “Find hardcoded colors that should be tokens.” | Audits the file for off-system values and suggests fixes. |
| “Bring this Figma file into Penpot.” | Migrates layout, components and variables with fidelity. |
| “Rename these messy layers properly.” | Renames layers to clear, semantic names. |
| “I'm not sure where to start.” | It asks a quick question and routes you to the right place. |

You don't need to know the names of any “skills” — just ask.

---

## ⚡ Fastest setup — let your assistant install it

If your AI assistant supports MCP **and** can read this folder (Claude Code, Claude Desktop, Cursor,
Windsurf, OpenCode, OpenAI Codex — CLI or desktop app — or similar), you don't have to wire anything by
hand. Open this folder in your assistant and say:

> **“Install this Penpot AI Kit.”**

The assistant reads [`INSTALL.md`](INSTALL.md) and runs a short, guided install: it detects your client,
asks just two things (**remote or local Penpot?** and your **MCP Key**), then connects the Penpot MCP and
wires the kit's behavior (skills, workflows, and the brief templates in [`prompts/`](prompts/)) — and
verifies the live connection before declaring success. It **confirms before every change**, never prints
your key, and is safe to re-run.

How it stays clean and safe:
- **This clone is a read-only seed.** The installer copies the kit once to `~/.penpot-ai-kit` and never
  modifies (or writes into) this folder — so you can move or delete the clone afterward.
- **Your MCP Key stays out of any repo.** It's written only to your client's user/global config.
- It records an `install-manifest.json` so uninstalling is just removing those files. Exactly what each
  client gets is in [`docs/clients.md`](docs/clients.md).
- No MCP-capable assistant, or want to understand each step? Use the manual quick start below.

---

## Quick start for designers

You'll connect your AI assistant to Penpot once (about 5 minutes), then just chat with it.

**What you need:**
- A **Penpot account** (penpot.app).
- An **AI assistant that supports MCP** — e.g. **Claude Desktop** or **Cursor**. (MCP is just the
  secure bridge that lets the assistant work inside your open Penpot file.)

### Step 1 — Get your Penpot “MCP Key”
In Penpot: **Your Account → Integrations → MCP**, and generate a key. Keep it private (treat it like a
password). Full details: [`docs/setup-remote.md`](docs/setup-remote.md).

### Step 2 — Connect your AI assistant to Penpot
Open the ready-made config in [`templates/`](templates/) for your assistant
(`claude-desktop-config.remote.json` or `cursor-mcp-config.json`), paste in your MCP Key, and add it to
your assistant. The setup guide walks through exactly where each file goes.

### Step 3 — Open your Penpot file and the plugin (keep it open!)
Open the file you want to work in and **leave that browser tab open** the whole time. If you close it, the assistant loses its connection.

### Step 4 — Point the assistant at this kit
Tell your assistant to read this folder’s **`AGENTS.md`** (most assistants let you attach a folder or a
file as context / project instructions). That's what teaches it the good habits — use your system,
never hardcode, ask before changing things.

### Step 5 — Just ask, in plain language
Try one of the examples above, e.g.:

> “Read AGENTS.md first. Then set up a starter design-token system for this file: a brand color, a
> neutral gray scale, a 4px spacing scale, and light/dark themes. Show me before applying.”

The assistant will check your file, propose a plan, and get to work in small steps.

### Step 6 — Review at each checkpoint
The kit is built to **pause and show you a preview** (an exported image) plus a short summary, and ask
for your OK before continuing. “Looks good” only approves the step you just saw — it always tells you
what's next. You're never surprised.

> ✅ **First thing to try:** open a *fresh, empty* Penpot file and ask it to *“set up a starter design
> system and build me one Button component with all its states.”* It's a great 5-minute taste of the kit.

---

## A few good-to-knows
- **It works on your real file.** If you're trying it out, use a **duplicate** of an important file until
  you trust it.
- **It asks before meaningful changes** and only auto-applies tiny, safe things (like renaming an
  unnamed layer). It will never restructure components or delete shared assets without asking.
- **It prefers your existing components and tokens** over inventing new ones, so results stay on-brand
  and editable.
- **If something looks off**, ask it to explain what it did or to undo the last step.

---

## How it works (in one minute)
- **AGENTS.md** — the assistant's “house rules” (use the system, never hardcode, ask first).
- **Skills** (`skills/`) — focused how-to recipes for specific jobs (tokens, components, audits, …).
- **Workflows** (`workflows/`) — multi-step recipes that chain skills (e.g. *design a screen, then keep
  improving it until it passes accessibility*).
- A built-in **router** reads your request and picks the right skill — so you don't have to.

For the full picture, see [`docs/architecture.md`](docs/architecture.md).

---

## For technical users

<details>
<summary>Skill catalog, architecture, repository layout, contributing</summary>

### Who it's for
- **Design system teams** — tokens, libraries, variants, governance, theming.
- **Product / UI designers** — build screens and components from a brief, accessibly.
- **Design engineers** — design↔code bridge, token mapping, drift review.
- **Teams migrating to Penpot** — from Figma, with fidelity.

Built on open standards (Anthropic Agent Skills, Agent Skills Discovery, MCP). It is **content only** —
files and manifests, no build step.

### Skill catalog
| Skill | What it does | Audiences |
|-------|--------------|-----------|
| `penpot-router` | Dispatch a request to one skill/workflow | all |
| `penpot-foundations` | Token + library foundation (tiers, themes, infer) | DS, engineers |
| `penpot-component-factory` | Components with full, tokenized variant matrices | DS, product |
| `penpot-build-screen` | Brief → on-system screen, section by section | product |
| `penpot-build-from-code` | App code → on-system Penpot screen | engineers, product |
| `penpot-audit-accessibility` | WCAG 2.1/2.2 AA audit | all |
| `penpot-audit-tokens` | Token governance audit | DS, engineers |
| `penpot-design-to-code-review` | Drift vs source/Storybook | engineers |
| `penpot-migrate` | Figma → Penpot via an IR | migration |
| `penpot-rename-layers` | Semantic layer naming (shared utility) | all |

### Layered architecture
```
AGENTS.md (instructions)
  → skills/ (capabilities)
    → workflows/ (orchestration)
      → Penpot MCP (4 tools: high_level_overview, penpot_api_info, execute_code, export_shape)
        → policies/ (suggest / review / autofix + safe set)
          → evals/ (golden tests)
shared/ = single source of truth (tool reference, API gotchas, token schema, naming, state, modes)
```

### Repository layout
```
AGENTS.md            instructions layer
INSTALL.md           conversational installer playbook ("Install this Penpot AI Kit")
scripts/install/     installer helpers (install one-shot + detect-client, install-seed, write-mcp-config, install-behavior, lib)
shared/              single source of truth (tool ref, gotchas, token schema, naming, state, modes, SKILL template)
skills/              10 skills, each: SKILL.md + references/ (progressive disclosure) + scripts/ (execute_code templates)
workflows/           6 orchestration recipes (README.md prose + pipeline.json)
prompts/             token-aware brief templates
templates/           MCP client configs (remote/local) + local-model calibration
policies/            modes (suggest/review/autofix), safe set, approval checkpoints
evals/               golden tests + fixtures
docs/                setup, troubleshooting, architecture, glossary, mcp-api-findings (dev feedback)
skills.json          aggregate manifest · .well-known/agent-skills/index.json discovery index · skills.lock version pins
```

### Contributing a skill
1. Copy the anatomy in `shared/SKILL-template.md` (frontmatter + the 16 sections).
2. Ground every API call in `shared/penpot-mcp-tool-reference.md` + `shared/plugin-api-gotchas.md`;
   verify unfamiliar members with `penpot_api_info`. Use the real token types in `shared/tokens-schema.json`.
3. Add an Anti-Rationalization Table and a Token-Aware Brief Contract.
4. Register the skill in `skills.json`, `.well-known/agent-skills/index.json`, and `skills.lock`.
5. Add a golden eval under `evals/golden/`.

</details>

---

## Status
v0.1.1 — validated against the live Penpot MCP (see [`CHANGELOG.md`](CHANGELOG.md) and
[`docs/mcp-api-findings.md`](docs/mcp-api-findings.md)). `skills.lock` integrity hashes are `pending`
(populated by a later tooling pass).
