const folder = input?.folder ?? "Story/Harmonious";

// Add a title above the table
dv.el("div", `<span style="font-weight:bold !important; text-decoration: underline !important;">Published</span>`, { 
  style: "font-size: 2em; margin-bottom: 0.5em;" 
});

// Get chapters sorted by Order
const chapterPages = dv.pages(`"${folder}"`)
  .where(p => p.tags && p.tags.includes("chapter"))
  .sort(p => p.Order ?? 9999, "asc");

// Render the table with checkmark
dv.table(
  ["Chapter", "Published"],
  chapterPages.map(p => [
    p.file.link,
    p.Published === true ? "✅" : ""
  ])
);
