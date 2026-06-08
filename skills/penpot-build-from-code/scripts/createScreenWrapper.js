/**
 * createScreenWrapper.js  —  Phase 1 (Screen wrapper)
 *
 * PURPOSE
 *   Idempotently create the screen Board that the code will be rebuilt into: sized to the target
 *   viewport, given a vertical flex layout, with padding/gap bound to spacing TOKENS (not literals).
 *
 * USAGE
 *   Paste into a single execute_code call AFTER inspectDesignSystem.js (storage.run.ds must exist).
 *
 * INPUTS  (placeholders)
 *   RUN_ID_HERE          — run slug.
 *   REPLACE-ME-screenName — e.g. "screen-settings" (kebab, "screen-" prefix).
 *   REPLACE-ME-width / REPLACE-ME-height — viewport px (e.g. 1440 / 1024).
 *   REPLACE-ME-padToken  — spacing token name for board padding, e.g. "spacing.inset.lg".
 *   REPLACE-ME-gapToken  — spacing token name for section gap, e.g. "spacing.6".
 *   REPLACE-ME-bgToken   — surface bg token for the screen, e.g. "color.bg.default" (so dark mode flips).
 *
 * OUTPUT
 *   return { boardId, created, name, w, h }.
 *
 * NOTE
 *   Token application is async (~100 ms) — verify padding/gap binding in a LATER execute_code call.
 *   Verify signatures with penpot_api_info("Board", "addFlexLayout") if unsure.
 */

const RUN_ID    = "RUN_ID_HERE";
const NAME      = "REPLACE-ME-screenName";
const W         = "REPLACE-ME-width";   // replace with a number, e.g. 1440
const H         = "REPLACE-ME-height";  // replace with a number, e.g. 1024
const PAD_TOKEN = "REPLACE-ME-padToken";
const GAP_TOKEN = "REPLACE-ME-gapToken";
const BG_TOKEN  = "REPLACE-ME-bgToken";   // surface bg token for the screen root

const width  = Number(W);
const height = Number(H);

// --- idempotency: reuse an existing board with this name -----------------
let board = penpotUtils.findShape(s => s.type === "board" && s.name === NAME, penpot.currentPage.root);
let created = false;

if (!board) {
  board = penpot.createBoard();
  board.name = NAME;                                  // semantic, kebab-case
  penpot.currentPage.root.appendChild(board);         // not on canvas until appended
  board.resize(width, height);                        // width/height are read-only — use resize()
  penpotUtils.setParentXY(board, 0, 0);               // parentX/parentY are read-only
  board.addFlexLayout();                               // vertical screen stack
  board.flex.dir = "column";
  created = true;
}

// --- FILL POLICY: the screen root is THE one surface for this screen ------
// Every board is born with an opaque white fill (gotchas #11). The screen carries the single bg, bound
// to a token so it flips in dark mode; sections nested inside stay transparent (see buildSection.js).
const bg = penpotUtils.findTokenByName(BG_TOKEN);
board.fills = [];                                     // drop Penpot's default #FFFFFF first
if (bg) board.applyToken(bg, ["fill"]);               // bound surface -> follows light/dark switch

// --- bind padding & gap to spacing TOKENS (never literals) ---------------
const pad = penpotUtils.findTokenByName(PAD_TOKEN);
const gap = penpotUtils.findTokenByName(GAP_TOKEN);

// applyToken binds tokens to the relevant slots; verify property strings via
// penpot_api_info("Shape", "applyToken") if a name is unfamiliar.
if (pad) board.applyToken(pad, ["paddingLeft", "paddingTop", "paddingRight", "paddingBottom"]); // all-side inset (no single "padding" prop)
if (gap) board.applyToken(gap, ["rowGap"]);           // gap between stacked sections

// --- ledger --------------------------------------------------------------
storage.run = storage.run || {};
storage.run.boardId = board.id;
const raw = penpot.currentFile.getSharedPluginData("penpot-ai", `${RUN_ID}.ledger`);
const ledger = raw ? JSON.parse(raw) : { runId: RUN_ID, phase: 1, created: [], sectionsBuilt: [], proposedTokens: [], exceptions: [] };
ledger.boardId = board.id;
ledger.phase = 1;
if (created) ledger.created.push({ kind: "board", role: "screen", name: NAME, id: board.id });
penpot.currentFile.setSharedPluginData("penpot-ai", `${RUN_ID}.ledger`, JSON.stringify(ledger));
penpot.currentFile.setSharedPluginData("penpot-ai", `${RUN_ID}.phase`, "1");

return { boardId: board.id, created, name: NAME, w: width, h: height, padToken: !!pad, gapToken: !!gap, bgToken: !!bg };
