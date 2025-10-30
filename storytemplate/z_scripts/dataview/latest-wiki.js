// Defaults if not passed
const folder = input?.folder ?? "Wiki";
const tags = input?.tags ?? ["article"];
const emojiMap = input?.emojiMap ?? {};

// Get files
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

  // Determine emoji based on folderPath using emojiMap
  let folderEmoji = "📂";
  for (const [pathFragment, emoji] of Object.entries(emojiMap)) {
    if (folderPath.includes(pathFragment)) {
      folderEmoji = emoji;
      break;
    }
  }

  // Render
  dv.el("div", `<span style="font-size:1.5em;">📝</span> <span style="font-size:1.5em; font-weight:bold;">[[${linkPath}|${displayName}]]</span>`);
  dv.el("div", `<span style="font-size:1.5em;">${folderEmoji}</span> <span style="font-size:1em; font-weight:bold;">${folderPath}</span>`);
  dv.el("div", `<span style="font-size:1.5em;">🕐</span> <span style="font-size:1em; font-weight:bold;">${lastMod}</span>`);
  dv.el("div", `<span style="font-size:1.5em;">❗</span> <span style="font-size:1em; font-weight:bold;">${status}</span>`);
} else {
  dv.paragraph(`No files found in "${folder}" with tags: ${tags.join(", ")}`);
}
