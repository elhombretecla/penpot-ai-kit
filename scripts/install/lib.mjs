/**
 * lib.mjs — shared helpers for the Penpot AI Kit installer (B2 "disposable seed" model).
 *
 * Model: the cloned repo is a READ-ONLY seed. `install-seed.mjs` copies it ONCE to a stable user
 * location (kitHome, default ~/.penpot-ai-kit). Everything else (MCP secret, behavior pointers) is
 * written to the client's USER/GLOBAL locations — never into the clone, never into a project unless
 * the client only supports project-scoped rules. assertOutsideKit() enforces that the original clone
 * is never written to.
 */
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { cpSync, existsSync, readdirSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";

export const HOME = homedir();
export const PLATFORM = process.platform; // "darwin" | "win32" | "linux"
export const APPDATA = process.env.APPDATA || join(HOME, "AppData", "Roaming");

// Repo root of the ORIGINAL clone — where these scripts physically live (robust, cwd-independent).
export const KIT_SOURCE = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

// Stable user-home destination for the installed seed (overridable).
export const kitHome = () => process.env.PENPOT_KIT_HOME || join(HOME, ".penpot-ai-kit");

export function isInside(child, parent) {
  const rel = relative(resolve(parent), resolve(child));
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

/** Throw if `target` would land inside the read-only clone. The whole point of B2. */
export function assertOutsideKit(target) {
  if (isInside(target, KIT_SOURCE)) {
    throw new Error(
      `refusing to write inside the kit source (read-only seed): ${target}\n` +
      `Kit source: ${KIT_SOURCE}\nWrite to a user/global location or a separate project dir instead.`
    );
  }
}

/** Config file FORMAT per client. JSON `mcpServers` is the common one; OpenCode and Codex differ. */
export function clientDialect(client) {
  switch (client) {
    case "opencode": return "opencode-json"; // top-level "mcp" key, {type,command|url,enabled}
    case "codex": return "codex-toml";        // [mcp_servers.NAME] TOML table
    default: return "mcpServers-json";        // claude-*, cursor, windsurf, generic
  }
}

/** Where the SECRET-bearing MCP config goes per client: USER/GLOBAL, never near a repo. */
export function mcpConfigPath(client) {
  switch (client) {
    case "claude-code": return join(HOME, ".claude.json");
    case "cursor": return join(HOME, ".cursor", "mcp.json");
    case "windsurf": return join(HOME, ".codeium", "windsurf", "mcp_config.json");
    case "opencode": return join(HOME, ".config", "opencode", "opencode.json");
    case "codex": return join(HOME, ".codex", "config.toml"); // shared by Codex CLI, desktop App, IDE, Web
    case "claude-desktop":
      return PLATFORM === "darwin" ? join(HOME, "Library", "Application Support", "Claude", "claude_desktop_config.json")
        : PLATFORM === "win32" ? join(APPDATA, "Claude", "claude_desktop_config.json")
        : join(HOME, ".config", "Claude", "claude_desktop_config.json");
    case "generic": return join(kitHome(), "mcp.generic.json");
    default: return null;
  }
}

/**
 * Where the (non-secret) behavior pointer goes per client. Global where the client has a global
 * mechanism; project-scoped (into `projectDir`, NOT the kit) where rules are only per-project.
 */
export function behaviorTarget(client, projectDir) {
  switch (client) {
    case "claude-code": // B3: native self-contained skills + a slim global memory pointer + commands
      return { kind: "claude-native", file: join(HOME, ".claude", "CLAUDE.md"),
               skillsDir: join(HOME, ".claude", "skills"), commandsDir: join(HOME, ".claude", "commands") };
    case "cursor":
      return { kind: "rules-mdc-project", file: join(projectDir, ".cursor", "rules", "penpot-kit.mdc") };
    case "windsurf":
      return { kind: "rules-file-project", file: join(projectDir, ".windsurfrules") };
    case "opencode": // add an `instructions` pointer in global opencode.json (combines, dodges the AGENTS shadow bug)
      return { kind: "opencode-instructions", file: join(HOME, ".config", "opencode", "opencode.json") };
    case "codex": // global personal instructions, read by CLI + desktop App + IDE + Web
      return { kind: "agents-global", file: join(HOME, ".codex", "AGENTS.md") };
    case "claude-desktop":
    case "generic":
      return { kind: "attach", file: join(kitHome(), "dist", "penpot-kit.instructions.md") };
    default: return null;
  }
}

/**
 * B3 — build SELF-CONTAINED skill bundles for native discovery (Claude Code).
 * Each skill references shared/ and policies/ by repo-relative paths, so we vendor a copy of those two
 * folders INTO each skill dir; the existing `shared/...`/`policies/...` references then resolve within
 * the skill. Returns the skill names + the dest dir (for the manifest). Synchronous (cpSync).
 */
export function buildSelfContainedSkills(seedPath, destSkillsDir, { dryRun = false } = {}) {
  assertOutsideKit(destSkillsDir);
  const srcSkills = join(seedPath, "skills");
  const sharedSrc = join(seedPath, "shared");
  const policiesSrc = join(seedPath, "policies");
  const built = [];
  if (!existsSync(srcSkills)) return { skills: built, dest: destSkillsDir };
  for (const name of readdirSync(srcSkills)) {
    const skillDir = join(srcSkills, name);
    if (!statSync(skillDir).isDirectory()) continue;
    const dest = join(destSkillsDir, name);
    if (!dryRun) {
      cpSync(skillDir, dest, { recursive: true, force: true });            // SKILL.md + references/ + scripts/
      if (existsSync(sharedSrc)) cpSync(sharedSrc, join(dest, "shared"), { recursive: true, force: true });
      if (existsSync(policiesSrc)) cpSync(policiesSrc, join(dest, "policies"), { recursive: true, force: true });
    }
    built.push(name);
  }
  return { skills: built, dest: destSkillsDir };
}

export const arg = (argv, name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? (argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : true) : def;
};
export const flag = (argv, name) => argv.includes(`--${name}`);
