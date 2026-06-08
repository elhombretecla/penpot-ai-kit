#!/usr/bin/env node
/**
 * install.mjs — one-shot orchestrator for the happy path (token-frugal).
 *
 * Chains: install-seed → write-mcp-config → install-behavior, then writes an uninstall manifest. Each
 * step is a child process returning short JSON; the installing agent runs THIS once and reads ONE
 * summary instead of orchestrating 3 round-trips (fewer turns = fewer context reloads = fewer tokens).
 * The MCP Key is passed to the child via env, never argv, never printed.
 *
 * Usage:
 *   PENPOT_MCP_KEY=... node scripts/install/install.mjs --client cursor --mode remote --target-dir /abs/project
 *   node scripts/install/install.mjs --client windsurf --mode local --dry-run
 * Flags: --client (required) · --mode remote|local · --target-dir <abs> · --force · --dry-run
 * Output: JSON { ok, steps:{seed,mcp,behavior}, manifest, summary }.
 */
import { execFileSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { kitHome, arg, flag } from "./lib.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const client = arg(argv, "client");
const mode = arg(argv, "mode", "remote");
const targetDir = arg(argv, "target-dir", process.cwd());
const force = flag(argv, "force");
const dryRun = flag(argv, "dry-run");

const out = (o) => { process.stdout.write(JSON.stringify(o, null, 2) + "\n"); };
const fail = (m) => { out({ ok: false, error: m }); process.exit(1); };
if (!client) fail("--client is required");

function run(script, args, { passKey = false } = {}) {
  const env = { ...process.env };
  if (!passKey) delete env.PENPOT_MCP_KEY; // only write-mcp-config sees the key
  try {
    const stdout = execFileSync("node", [join(HERE, script), ...args], { env, encoding: "utf8", stdio: ["inherit", "pipe", "pipe"] });
    return JSON.parse(stdout);
  } catch (e) {
    // child exits non-zero (e.g. mcp "skipped-exists") still prints JSON on stdout
    const so = e.stdout?.toString?.() || "";
    try { return JSON.parse(so); } catch { return { ok: false, error: e.message, stderr: e.stderr?.toString?.() }; }
  }
}

const common = dryRun ? ["--dry-run"] : [];

// 1) seed
const seed = run("install-seed.mjs", [...common]);
if (!seed.ok) fail(`seed step failed: ${seed.error}`);
const kit = seed.dest || kitHome();

// 2) MCP config (key via env → only this child)
const mcpArgs = ["--client", client, "--mode", mode, ...common, ...(force ? ["--force"] : [])];
const mcp = run("write-mcp-config.mjs", mcpArgs, { passKey: true });

// 3) behavior (points at the seed)
const behavior = run("install-behavior.mjs", ["--client", client, "--kit-path", kit, "--target-dir", targetDir, ...common]);

// manifest for uninstall
const files = [...(mcp.touched || []), ...(behavior.touched || [])];
const manifest = { kitSeed: kit, client, mode, files, mcpServer: mcp.server || "penpot", mcpConfig: mcp.configPath };
const manifestPath = join(kit, "install-manifest.json");
if (!dryRun) { mkdirSync(dirname(manifestPath), { recursive: true }); writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n", "utf8"); }

out({
  ok: !!(seed.ok && behavior.ok),
  dryRun: !!dryRun,
  steps: { seed, mcp, behavior },
  manifest: dryRun ? manifest : manifestPath,
  summary: {
    client, mode, seed: kit,
    mcp: mcp.ok ? `${mcp.action} → ${mcp.configPath}` : mcp.message || mcp.error,
    behavior: behavior.userAction,
    nextStep: "Open your Penpot file + the MCP plugin (keep it open), restart the client, then call high_level_overview to verify.",
  },
});
