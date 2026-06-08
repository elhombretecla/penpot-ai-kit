#!/usr/bin/env node
/**
 * detect-client.mjs — READ-ONLY host probe for the Penpot AI Kit installer. Touches nothing.
 *
 * Fingerprints which supported clients are present and reports, per client, the USER/GLOBAL MCP-config
 * path and the behavior mechanism the installer would use (B2 model). The installer (INSTALL.md) reads
 * this, summarizes it, and asks the user to confirm — detection is a hint, never the verdict.
 *
 * Usage:  node scripts/install/detect-client.mjs
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { HOME, PLATFORM, kitHome, KIT_SOURCE, mcpConfigPath, behaviorTarget } from "./lib.mjs";

const exists = (...p) => { try { return existsSync(join(...p)); } catch { return false; } };

const desktopCfg = mcpConfigPath("claude-desktop");
const probes = {
  "claude-code": exists(HOME, ".claude"),
  "claude-desktop": exists(desktopCfg) || exists(desktopCfg, ".."),
  "cursor": exists(HOME, ".cursor"),
  "windsurf": exists(HOME, ".codeium", "windsurf"),
  "opencode": exists(HOME, ".config", "opencode") || exists(HOME, ".local", "share", "opencode"),
  "codex": exists(HOME, ".codex"),
};

const clients = ["claude-code", "claude-desktop", "cursor", "windsurf", "opencode", "codex"].map((id) => ({
  id,
  detected: probes[id],
  mcpConfig: mcpConfigPath(id),           // USER/GLOBAL — secret never near a repo
  behavior: behaviorTarget(id, process.cwd()),
}));

process.stdout.write(JSON.stringify({
  os: PLATFORM,
  node: process.version,
  cwd: process.cwd(),
  kitSource: KIT_SOURCE,
  seedDest: kitHome(),
  clients,
  note: "Detection is a hint — confirm the host client with the user. Unknown client → use --client generic (configure MCP from templates/ + attach AGENTS.md).",
}, null, 2) + "\n");
