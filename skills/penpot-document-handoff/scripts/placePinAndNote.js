/**
 * placePinAndNote.js
 * Purpose: Phase 4 — add ONE numbered annotation: a Pointer/L pin on a region of the design, and a
 *          matching Chip Note in the right-hand notes column. The design is NOT modified.
 * Usage:   paste into execute_code. ONE annotation per call. Run once per pin in the brief's pin list.
 * Input:   PIN below (n, regionId, title, observation, recommendation?). Reads storage.dh.
 * Output:  { n, pinId, noteId, nextY }.
 * Notes:   Pin overlays the region (sibling/elevated, never a child of the design's layout). Note bg is a
 *          SURFACE (bind to color.annotation.surface); inner sections structural (fills=[]). Text auto-height
 *          needs ~100ms to reflow before reading height — we track nextY conservatively. Verify members with
 *          penpot_api_info if unsure. Keeps storage.dh.pins + pinCounter in sync (contiguous numbering).
 */
const PIN = {
  n: (storage.dh && storage.dh.pinCounter || 0) + 1, // auto-increments; override only to fix numbering
  regionId: "REPLACE-ME-region-shape-id",
  title: "REPLACE-ME TITLE",
  observation: "REPLACE-ME observation text.",
  recommendation: null // or "..."
};

const dh = storage.dh || {};
const design = dh.designBoardId && penpotUtils.findShapeById(dh.designBoardId);
const region = penpotUtils.findShapeById(PIN.regionId);
if (!design) return { error: "storage.dh.designBoardId not set." };
if (!region) return { error: `region ${PIN.regionId} not found.` };
const tok = n => (n ? penpotUtils.findTokenByName(n) : null);
const T = dh.tokens || {};
const PIN_L = 40, NOTE_W = 484, NOTE_GAP = 24;

// guard: no duplicate number
dh.pins = dh.pins || [];
if (dh.pins.some(p => p.n === PIN.n)) return { error: `pin #${PIN.n} already exists — fix numbering.` };

// --- 1) the on-canvas Pointer/L pin (overlay; never appended into the design) ---
let pin;
if (dh.kit && dh.kit.pointerLId) {
  const comp = penpot.library.local.components.find(c => c.id === dh.kit.pointerLId)
    || (penpot.library.connected || []).flatMap(l => l.components).find(c => c.id === dh.kit.pointerLId);
  pin = comp && comp.instance();
}
if (!pin) {
  pin = penpot.createBoard(); pin.name = "pin"; pin.resize(PIN_L, PIN_L); pin.borderRadius = 9999; pin.fills = [];
  const acc = tok(T.accent); if (acc) pin.applyToken(acc, ["fill"]);
  const num = penpot.createText(String(PIN.n)); num.align = "center"; num.verticalAlign = "center";
  const on = tok(T.onAccent); if (on) num.applyToken(on, ["fill"]);
  pin.appendChild(num); penpotUtils.setParentXY(num, PIN_L / 2 - 4, PIN_L / 2 - 8);
}
// set the number on the pin (override instance text)
const pinText = penpotUtils.findShape(s => s.type === "text", pin);
if (pinText) pinText.characters = String(PIN.n);
penpot.currentPage.root.appendChild(pin);           // page-level sibling overlay
pin.x = region.x + region.width - PIN_L / 2;          // hug the region's top-right corner
pin.y = region.y - PIN_L / 2;
pin.bringToFront();

// --- 2) the matching Chip Note in the notes column ---
let note;
if (dh.kit && dh.kit.chipNoteId) {
  const comp = penpot.library.local.components.find(c => c.id === dh.kit.chipNoteId)
    || (penpot.library.connected || []).flatMap(l => l.components).find(c => c.id === dh.kit.chipNoteId);
  note = comp && comp.instance();
}
if (!note) {
  // minimal fallback note per references/01 (header + observation + optional recommendation)
  note = penpot.createBoard(); note.name = "note-card";
  const f = penpotUtils.addFlexLayout(note, "column"); f.rowGap = 24;
  f.topPadding = f.bottomPadding = 24; f.leftPadding = f.rightPadding = 12;
  f.horizontalSizing = "fix"; f.verticalSizing = "auto";
  note.fills = []; const surf = tok(T.surface); if (surf) note.applyToken(surf, ["fill"]);
  const accent = tok(T.accent), body = tok(T.body), fam = tok(T.fontFamily),
        sLabel = tok(T.labelSize), sBody = tok(T.bodySize);
  // header: small pin badge + uppercase title
  const header = penpot.createBoard(); header.name = "header";
  const hf = penpotUtils.addFlexLayout(header, "row"); hf.columnGap = 8; hf.alignItems = "center";
  hf.horizontalSizing = "fill"; hf.verticalSizing = "auto"; header.fills = [];
  const badge = penpot.createBoard(); badge.resize(24, 24); badge.borderRadius = 9999; badge.fills = [];
  if (accent) badge.applyToken(accent, ["fill"]);
  const bnum = penpot.createText(String(PIN.n)); bnum.align = "center"; bnum.verticalAlign = "center";
  const on = tok(T.onAccent); if (on) bnum.applyToken(on, ["fill"]); badge.appendChild(bnum);
  penpotUtils.setParentXY(bnum, 8, 4);
  const title = penpot.createText(PIN.title); title.growType = "auto-height"; title.textTransform = "uppercase";
  title.fontWeight = "500"; if (fam) title.applyToken(fam, ["fontFamilies"]);
  if (sLabel) title.applyToken(sLabel, ["fontSize"]); if (accent) title.applyToken(accent, ["fill"]);
  header.appendChild(badge); header.appendChild(title);
  function block(label, text) {
    const b = penpot.createBoard(); b.name = label.toLowerCase();
    const bf = penpotUtils.addFlexLayout(b, "column"); bf.rowGap = 4; bf.horizontalSizing = "fill"; bf.verticalSizing = "auto"; b.fills = [];
    const l = penpot.createText(label); l.growType = "auto-height"; l.textTransform = "uppercase"; l.fontWeight = "500";
    if (fam) l.applyToken(fam, ["fontFamilies"]); if (sLabel) l.applyToken(sLabel, ["fontSize"]); if (accent) l.applyToken(accent, ["fill"]);
    const t = penpot.createText(text); t.growType = "auto-height";
    if (fam) t.applyToken(fam, ["fontFamilies"]); if (sBody) t.applyToken(sBody, ["fontSize"]); if (body) t.applyToken(body, ["fill"]);
    b.appendChild(l); b.appendChild(t); return b;
  }
  note.appendChild(header);
  note.appendChild(block("Observation", PIN.observation));
  if (PIN.recommendation) note.appendChild(block("Recommendation", PIN.recommendation));
  penpot.currentPage.root.appendChild(note);
} else {
  // override instance text by layer role
  const setByName = (re, val) => { const t = penpotUtils.findShape(s => s.type === "text" && re.test(s.name), note); if (t) t.characters = val; };
  const texts = penpotUtils.findShapes(s => s.type === "text", note);
  const badgeNum = texts.find(t => /^\d+$/.test((t.characters || "").trim())); if (badgeNum) badgeNum.characters = String(PIN.n);
  penpot.currentPage.root.appendChild(note);
}

note.resize(NOTE_W, note.height);
note.x = dh.notesColumnX != null ? dh.notesColumnX : design.x + design.width + 80;
note.y = dh.notesNextY != null ? dh.notesNextY : design.y;

// advance the ledger (contiguous numbering + running y). note.height may need ~100ms to settle;
// we add a conservative gap so notes don't overlap even before reflow.
dh.notesColumnX = note.x;
dh.notesNextY = Math.round(note.y + (note.height || 167) + NOTE_GAP);
dh.pins.push({ n: PIN.n, regionId: PIN.regionId, pinId: pin.id, noteId: note.id });
dh.pinCounter = Math.max(dh.pinCounter || 0, PIN.n);
storage.dh = dh;
return { n: PIN.n, pinId: pin.id, noteId: note.id, nextY: dh.notesNextY };
