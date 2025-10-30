module.exports = async (tp) => {
  // Get the current note's folder path (make sure to call it as a function)
  const folder = tp.file.folder(true);

  // Get all markdown files in the vault
  const files = tp.app.vault.getMarkdownFiles();

  let maxOrder = 0;

  for (const file of files) {
    // Only check files in the same folder
    if (file.parent.path !== folder) continue;

    // Get cached metadata frontmatter for the file
    const frontmatter = tp.app.metadataCache.getFileCache(file)?.frontmatter;
    if (!frontmatter) continue;

    // Check if the file has the 'scene' tag
    // Tags in Obsidian frontmatter are usually an array, but sometimes a string
    let tags = frontmatter.tags;
    if (!tags) continue;

    // Normalize tags to array of strings
    if (typeof tags === "string") tags = [tags];
    if (!tags.includes("scene")) continue;

    // Read the Order property (assumed to be a number)
    const orderNum = frontmatter.Order;
    if (typeof orderNum === "number" && orderNum > maxOrder) {
      maxOrder = orderNum;
    }
  }

  // Return the next order number incremented by 1
  return maxOrder + 1;
};
