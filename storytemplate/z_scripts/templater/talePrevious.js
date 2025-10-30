module.exports = async (tp) => {
  const files = app.vault.getMarkdownFiles();

  // Filter for alpha-tagged Tale folder notes inside 'Story'
  const alphaTales = files.filter(file => {
    // Only include files under Story/
    if (!file.path.startsWith("Story/")) return false;

    const cache = app.metadataCache.getFileCache(file);
    const frontmatter = cache?.frontmatter;
    if (!frontmatter) return false;

    const tags = frontmatter.tags;
    const isAlpha = Array.isArray(tags)
      ? tags.includes("alpha")
      : tags === "alpha";

    if (!isAlpha) return false;

    // Must be a Tale folder note: filename = folder name
    const folderName = file.parent?.name || file.path.split("/").slice(-2, -1)[0];
    return file.basename === folderName;
  });

  // Sort by creation date descending (newest first)
  alphaTales.sort((a, b) => b.stat.ctime - a.stat.ctime);

  // Return blank if less than two alpha files exist
  if (alphaTales.length < 2) return "";

  // Get second most recent file
  const secondRecentFile = alphaTales[1];
  if (!secondRecentFile) return "";

  const fullPath = secondRecentFile.path.replace(/\.md$/, '');
  const displayName = secondRecentFile.basename;

  // Return quoted link
  return `"[[${fullPath}|${displayName}]]"`;
};
