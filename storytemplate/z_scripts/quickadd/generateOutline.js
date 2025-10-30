module.exports = async () => {
  const files = app.vault.getMarkdownFiles();

  // Step 1: Get most recently created file
  const sorted = files.slice().sort((a, b) => b.stat.ctime - a.stat.ctime);
  const mostRecent = sorted[0];

  // Step 2: Check if it's tagged 'scene'
  const cache = app.metadataCache.getFileCache(mostRecent);
  const frontmatter = cache?.frontmatter;

  if (!frontmatter) {
    new Notice("Most recent file has no frontmatter.");
    return;
  }

  const tags = frontmatter.tags;
  const isSceneTag = Array.isArray(tags)
    ? tags.includes("scene")
    : tags === "scene";

  if (!isSceneTag) {
    new Notice("Most recent file is not tagged with 'scene'.");
    return;
  }

  // Step 3: Get Order and file info
  const order = frontmatter.Order;
  const title = mostRecent.basename;
  const relativePath = mostRecent.path.replace(/\.md$/, '');

  if (typeof order !== "number") {
    new Notice(`No valid 'Order' value found in frontmatter of ${title}.`);
    return;
  }

  // Step 4: Locate _outline.md in same folder
  const folderPath = mostRecent.parent.path;
  const outlinePath = `${folderPath}/_outline.md`;
  let outlineFile = app.vault.getAbstractFileByPath(outlinePath);

  let outlineContent = "";

  if (outlineFile && outlineFile.path.endsWith(".md")) {
    outlineContent = await app.vault.read(outlineFile);
  } else {
    outlineFile = await app.vault.create(outlinePath, "");
    new Notice("Created new _outline.md file.");
  }

  // Step 5: Append heading to bottom of _outline.md
  const outlineFormatted = `# ${order}. [[${relativePath}|${title}]]`;
  const lines = outlineContent.trimEnd().split("\n");

  if (lines.length === 0 || lines[lines.length - 1].trim() === "") {
    lines.push(outlineFormatted);
  } else {
    lines.push("", outlineFormatted);
  }

  const newOutlineContent = lines.join("\n");
  await app.vault.modify(outlineFile, newOutlineContent);

  new Notice(`_outline updated for scene: ${title}`);
};
