// Use provided folder or fallback
const folder = input?.folder ?? "Story/Harmonious";

// Add a title above the table
// Add a title above the table
dv.el("div", `<span style="font-weight:bold !important; text-decoration: underline !important;">Rough Draft</span>`, { 
  style: "font-size: 2em; margin-bottom: 0.5em;" 
});

// Step 1: Get all chapter files in folder, sorted by Order
const chapterPages = dv.pages(`"${folder}"`)
  .where(p => p.tags && p.tags.includes("chapter"))
  .sort(p => p.Order ?? 9999, 'asc');

// Step 2: Get all scene files in folder
const scenePages = dv.pages(`"${folder}"`)
  .where(p => p.tags && p.tags.includes("scene"));

// Step 3: Group scene files by folder
const folders = {};
for (const page of scenePages) {
  const folderName = page.file.folder;
  if (!folders[folderName]) folders[folderName] = [];
  folders[folderName].push(page);
}

// Step 4: Generate progress bar + text with color
function getProgressDisplay(folderName) {
  const files = folders[folderName] || [];
  const total = files.length;
  if (total === 0) return "No scenes";

  const completed = files.filter(f => f["Rough Draft"] === true).length;
  const progress = completed / total;

  const progressText = `${completed}/${total} (${(progress * 100).toFixed(1)}%)`;

  const outer = document.createElement("div");
  outer.style.width = "150px";
  outer.style.height = "10px";
  outer.style.background = "#ddd";
  outer.style.borderRadius = "4px";
  outer.style.overflow = "hidden";
  outer.style.display = "inline-block";
  outer.style.verticalAlign = "middle";
  outer.style.marginRight = "8px";

  const inner = document.createElement("div");
  inner.style.width = `${Math.round(progress * 100)}%`;
  inner.style.height = "100%";
  inner.style.background = "#4caf50";
  inner.style.borderRadius = "4px";

  outer.appendChild(inner);

  const wrapper = document.createElement("span");
  wrapper.appendChild(outer);
  wrapper.appendChild(document.createTextNode(` ${progressText}`));

  return wrapper;
}

// Step 5: Render the table
dv.table(["Chapter", "Progress"], 
  chapterPages.map(p => [
    p.file.link, 
    getProgressDisplay(p.file.folder)
  ])
);
