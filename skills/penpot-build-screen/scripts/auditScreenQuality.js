/**
 * auditScreenQuality.js
 * Purpose: quick quality pass — token binding coverage, off-grid spacing, naming.
 * Usage:   paste into execute_code (Phase N+1). Read-only. For full a11y use penpot-audit-accessibility.
 * Input:   SCREEN_ID, GRID.
 * Output:  { rawFills:[...], offGridGaps:[...], unnamed:[...], pass }.
 */
const SCREEN_ID = storage.bs && storage.bs.screenBoardId;
const GRID = 4;
const root = SCREEN_ID ? penpotUtils.findShapeById(SCREEN_ID) : penpot.currentPage.root;

const rawFills = []; const offGridGaps = []; const unnamed = [];
penpotUtils.analyzeDescendants(root, (r, s) => {
  const hasFill = (s.fills || []).length > 0;
  if (hasFill && !(s.tokens && s.tokens.fill)) rawFills.push(s.name || s.id);
  if (s.flex) {
    [["rowGap", s.flex.rowGap], ["columnGap", s.flex.columnGap]].forEach(([k, v]) => {
      if (typeof v === "number" && v % GRID !== 0) offGridGaps.push({ shape: s.name || s.id, [k]: v });
    });
  }
  if (!s.name || /^(Board|Rectangle|Group|Ellipse|Text)\s*\d*$/.test(s.name)) unnamed.push(s.id);
  return null;
}, 10);

return { rawFills, offGridGaps, unnamed, pass: rawFills.length === 0 && offGridGaps.length === 0 && unnamed.length === 0 };
