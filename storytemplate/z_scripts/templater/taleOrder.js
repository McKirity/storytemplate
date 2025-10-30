module.exports = (tp) => {
  // Get all markdown files in the vault
  const files = tp.app.vault.getMarkdownFiles();
  
  let maxOrder = 0;
  let foundAlphaFiles = false;

  for (const file of files) {
    // Only check files that are somewhere within the Story folder
    if (!file.path.startsWith("Story/")) {
      continue;
    }

    // Get cached metadata frontmatter for the file
    const frontmatter = tp.app.metadataCache.getFileCache(file)?.frontmatter;
    if (!frontmatter) continue;

    // Check if the file has the 'alpha' tag
    let tags = frontmatter.tags;
    if (!tags) continue;

    // Normalize tags to array of strings
    if (typeof tags === "string") tags = [tags];
    if (!tags.includes("alpha")) continue;

    foundAlphaFiles = true;

    // Read the Order property (assumed to be a number)
    const orderNum = frontmatter.Order;
    if (typeof orderNum === "number" && orderNum > maxOrder) {
      maxOrder = orderNum;
    }
  }

  // Return 1 if no alpha files found or no valid Order values found
  // Otherwise return the next order number incremented by 1
  const result = foundAlphaFiles && maxOrder > 0 ? maxOrder + 1 : 1;
  return ` ${result}`;
};