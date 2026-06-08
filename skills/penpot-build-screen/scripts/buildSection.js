/**
 * buildSection.js
 * Purpose: build ONE section as a tokenized flex Board, reusing components where possible.
 * Usage:   paste into execute_code (Phase 2..N). One section per call.
 * Input:   SECTION_NAME, PARENT_ID (screen board), token names, component names to instance.
 * Output:  { sectionId, children }.
 * Note:    flex positions children; bind tokens (async); name layers semantically.
 */
const SECTION_NAME = "nav";        // REPLACE-ME (semantic)
const PARENT_ID = storage.bs && storage.bs.screenBoardId; // or "SCREEN_BOARD_ID"
const REUSE_COMPONENTS = ["Button"]; // REPLACE-ME
const SURFACE_TOKEN = null;          // REPLACE-ME: bg token ONLY if this section is a card/panel surface (e.g. "color.bg.surface"); else null

const parent = PARENT_ID ? penpotUtils.findShapeById(PARENT_ID) : penpot.currentPage.root;
const section = penpot.createBoard();
section.name = SECTION_NAME;
const flex = section.addFlexLayout();
flex.dir = "row"; flex.alignItems = "center"; flex.justifyContent = "space-between";
flex.columnGap = 16; flex.topPadding = flex.bottomPadding = 16; flex.leftPadding = flex.rightPadding = 24;
flex.horizontalSizing = "fill"; flex.verticalSizing = "auto";
parent.appendChild(section);

// FILL POLICY (gotchas #11): a section is structural by default — clear Penpot's default opaque white
// so the screen bg shows through and dark mode works. DON'T paint every section with color.bg.default
// (that stacks opaque light boxes and breaks dark). Only bind a bg token for a genuine card/panel surface.
section.fills = [];
const surfTok = SURFACE_TOKEN && penpotUtils.findTokenByName(SURFACE_TOKEN);
if (surfTok) section.applyToken(surfTok, ["fill"]);

const children = [];
for (const name of REUSE_COMPONENTS) {
  const comp = penpot.library.local.components.find(c => c.name === name);
  if (comp) { const inst = comp.instance(); section.appendChild(inst); children.push({ component: name, id: inst.id }); }
}
return { sectionId: section.id, children };
