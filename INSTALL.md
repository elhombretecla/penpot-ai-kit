# Install the Penpot AI Kit — agent playbook

> **You are an AI agent installing this kit for the user.** This file is instructions for *you*, not
> prose for a human. Execute it top to bottom. Be conversational, confirm before writing, never echo
> the user's secret key, and stop the moment something is ambiguous. It's ~4 short phases and 2 questions.

If the user said something like *"Install this Penpot AI Kit"*, begin here.

## Model: a disposable seed → everything else in user/global locations

This cloned folder is a **read-only seed**. Installing:
1. **Copies the kit once** to a stable user location (`~/.penpot-ai-kit`, the "seed home"). The clone is
   then disposable — `shared/`/`policies/` relative links stay intact because the whole tree moves together.
2. **Connects the Penpot MCP** by writing a server entry to the client's **user/global** config — so the
   secret MCP Key never lands near a git repo.
3. **Wires the behavior** per client: for **Claude Code** it installs the penpot-* skills *natively and
   self-contained* into `~/.claude/skills/` (B3 — `shared/`+`policies/` vendored into each, so they're
   auto-discovered) plus a slim `~/.claude/CLAUDE.md` pointer; for **OpenCode** it adds an `instructions`
   pointer in `opencode.json`; for **Codex** a block in global `~/.codex/AGENTS.md`; for **Cursor/Windsurf**
   a per-project rules file; for **Desktop/generic** an attachable instructions file. All point at the seed.

The cloned repo is **never modified**, and nothing is written into it (a read-only guard enforces this).

### 🪙 Token discipline (important)
Copying files does **not** cost tokens — moving bytes is the OS's job. Tokens are spent only when *you*
read file contents into context. So: **do NOT read the kit's content** (skills, `shared/`, `AGENTS.md`)
during install — those are read later, at use time. Here you only **run the helper scripts and relay
their short JSON**. The scripts move the bytes; you stay cheap. This file is the only kit doc you read.

The helpers live in `scripts/install/`; all accept `--dry-run` and print JSON. Prefer the one-shot
`install.mjs` for the happy path (fewer turns = fewer tokens); use the individual scripts only to debug.

---

## Phase 0 — Preflight (read-only, no tokens spent on kit content)

1. Confirm you're at the kit root (an `AGENTS.md` is here). Check Node ≥ 18 (`node -v`); if missing, point
   the user to `docs/setup-remote.md` and stop.
2. Probe the host (read-only):
   ```bash
   node scripts/install/detect-client.mjs
   ```
3. Summarize in one short paragraph: OS, which of **Claude Code / Claude Desktop / Cursor / Windsurf /
   OpenCode / Codex** were detected, the seed destination, and the user/global config path each would
   use. Anything else → `generic`. Note: **Codex's CLI and desktop App share `~/.codex`**, so one `codex`
   choice covers both.

---

## Phase 1 — Two questions (+ a project dir for Cursor/Windsurf)

1. **Which client?** Offer the detected one as default; let them correct it or pick `generic`. If the
   user is talking to you *through* one of these, that's the target — say so and confirm.
2. **Remote or local Penpot?** Remote (default) = hosted `penpot.app`, needs an **MCP Key**. Local =
   self-hosted (`docs/setup-local.md`), no key.

If **remote**, get the key safely:
> "Open Penpot → **Account → Integrations → MCP Key**, copy it, and paste it here. It's a secret — I'll
> write it only into your client's user config (never the repo), and never print it back."

**Key hygiene (non-negotiable):** pass the key via the `PENPOT_MCP_KEY` env var (or piped stdin), **never**
as a CLI argument, and never repeat it. The scripts redact it everywhere.

If the client is **Cursor or Windsurf**, their rules are per-project — ask for the **project directory**
the user will work in (must be outside this kit). For Claude Code / Desktop / generic, the behavior is
global and no project dir is needed.

---

## Phase 2 — Install (one command, token-frugal)

Dry-run first, show the user the redacted summary, then run for real on approval:

```bash
# remote (key via env; target-dir only needed for cursor/windsurf):
PENPOT_MCP_KEY='<pasted-key>' node scripts/install/install.mjs --client <id> --mode remote [--target-dir <user-project>] --dry-run
PENPOT_MCP_KEY='<pasted-key>' node scripts/install/install.mjs --client <id> --mode remote [--target-dir <user-project>]

# local (no key):
node scripts/install/install.mjs --client <id> --mode local [--target-dir <user-project>]
```

`install.mjs` chains **seed copy → MCP config → behavior → uninstall manifest** and prints one summary.
Read its `summary` and relay it. Notes:
- The MCP write **merges** (preserves other servers); if a `penpot` server already exists it reports
  `skipped-exists` → re-run with `--force` to update.
- It writes the manifest to `~/.penpot-ai-kit/install-manifest.json` (uninstall = remove those files +
  the `penpot` MCP server entry + the seed dir).
- If it reports a guard error about writing inside the kit, you passed a `--target-dir` inside the repo —
  ask the user for their real project dir and retry.

> Running the steps individually (only if needed): `install-seed.mjs` → `write-mcp-config.mjs` →
> `install-behavior.mjs --kit-path ~/.penpot-ai-kit`. Same flags.

---

## Phase 3 — Verify (prove it; then stop)

The install is real only once the live bridge answers:
1. Restart / reload the client so it picks up the MCP server + rules (relay the `userAction`).
2. Open the Penpot **file**, launch the **MCP plugin**, and **leave that browser window open**.
3. Have the agent run the kit's canonical first move — `high_level_overview` (no args), then a read-only
   `execute_code`:
   ```js
   return penpotUtils.shapeStructure(penpot.currentPage.root, 1);
   ```
4. **Returns a structure → installed.** Stop. **Do not run a demo** (it wastes tokens).
   **"No plugin instance connected"** → plugin window closed / bad key / browser blocked the local call →
   send them to `docs/troubleshooting.md` (Firefox easiest; Chrome allow the popup; Brave Shields off).

Finish with a 4-line recap: client, MCP mode, seed location, and one example prompt to try next.

## Safety rules (throughout)
- **Confirm before writing.** Dry-run → show → apply (mirrors the kit's own Suggest → Apply-with-review).
- **Never echo the MCP Key**; never put it in argv. It only ever lives in the client's user config.
- **The clone is read-only.** The guard refuses any write inside it; never bypass it.
- **Merge, don't overwrite. Idempotent.** Re-running is safe (behavior blocks are marker-bounded; the MCP
  write skips unless `--force`; re-seeding just refreshes the copy after a `git pull`).
- **Stay cheap:** run scripts and relay JSON; don't read skills/`shared/`/`AGENTS.md` during install.
- Unknown client → `--client generic`, then walk them through attaching `~/.penpot-ai-kit/AGENTS.md`
  (or the emitted `dist/penpot-kit.instructions.md`) as project instructions.
