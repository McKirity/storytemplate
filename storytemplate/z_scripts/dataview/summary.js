const folder = input?.folder ?? "Story/North";

// Add a title above the table
dv.el("div", `<span style="font-weight:bold !important; text-decoration: underline !important;">Summary</span>`, { 
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

// Step 4: Find max scene count for scaling
const maxCount = Math.max(...Object.values(folders).map(arr => arr.length));

// Step 5: Create bars proportional to scene count
function getRelativeBar(folderName) {
  const files = folders[folderName] || [];
  const count = files.length;

  const proportion = count / maxCount;
  const barLength = 150;
  const filledLength = Math.round(barLength * proportion);

  const barLabel = `${count}`;

  const outer = document.createElement("div");
  outer.style.width = `${barLength}px`;
  outer.style.height = "10px";
  outer.style.background = "transparent";
  outer.style.overflow = "hidden";
  outer.style.display = "inline-block";
  outer.style.verticalAlign = "middle";
  outer.style.marginRight = "8px";

  const inner = document.createElement("div");
  inner.style.width = `${filledLength}px`;
  inner.style.height = "100%";
  inner.style.background = "#2196f3";
  inner.style.borderRadius = "4px";

  outer.appendChild(inner);

  const wrapper = document.createElement("span");
  wrapper.appendChild(outer);
  wrapper.appendChild(document.createTextNode(` ${barLabel}`));

  return wrapper;
}

// Step 6: Render the table
dv.table(["Chapter", "Scenes"], 
  chapterPages.map(p => [
    p.file.link, 
    getRelativeBar(p.file.folder)
  ])
);
