// Use input.folder and input.tags if provided, else default
const folder = input?.folder ?? "Story";
const tags = input?.tags ?? ["scene"];

// Find the most recently modified file matching folder and tags
const files = dv.pages(`"${folder}"`)
  .where(p => p.tags && tags.every(tag => p.tags.includes(tag)))
  .sort(p => -p.file.mtime.ts);

if (files.length > 0) {
  const mostRecent = files[0];
  const linkPath = mostRecent.file.path;
  const displayName = mostRecent.file.name;
  const folderPath = mostRecent.file.folder;
  const status = mostRecent.Status ?? "";

  const lastMod = dv.luxon.DateTime
    .fromMillis(mostRecent.file.mtime.ts)
    .toFormat("MMM d, yyyy • h:mm a");

  dv.el("div", `<span style="font-size:1.5em;">📝</span> <span style="font-size:1.5em; font-weight:bold;">[[${linkPath}|${displayName}]]</span>`);
  dv.el("div", `<span style="font-size:1.5em;">📂</span> <span style="font-size:1em; font-weight:bold;">${folderPath}</span>`);
  dv.el("div", `<span style="font-size:1.5em;">🕐</span> <span style="font-size:1em; font-weight:bold;">${lastMod}</span>`);
  dv.el("div", `<span style="font-size:1.5em;">❗</span> <span style="font-size:1em; font-weight:bold;">${status}</span>`);
} else {
  dv.paragraph(`No files found in folder "${folder}" with tags: ${tags.join(", ")}`);
}
