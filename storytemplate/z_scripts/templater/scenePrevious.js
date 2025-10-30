module.exports = async (tp) => {
  const folderPath = tp.file.folder(true);
  const files = app.vault.getMarkdownFiles();

  // Filter files by folder and tag 'scene'
  const sceneFiles = files.filter(file => {
    if (!file.path.startsWith(folderPath + "/")) return false;

    const cache = app.metadataCache.getFileCache(file);
    const frontmatter = cache?.frontmatter;
    if (!frontmatter) return false;

    const tags = frontmatter.tags;
    const isSceneTag = Array.isArray(tags)
      ? tags.includes("scene")
      : tags === "scene";

    return isSceneTag;
  });

  // Sort by creation date descending (newest first)
  sceneFiles.sort((a, b) => b.stat.ctime - a.stat.ctime);

  // Return second most recent file as a quoted wikilink with path and alias
  if (sceneFiles.length < 2) {
    return '""';
  }

  const secondRecentFile = sceneFiles[1];
  const fullPath = secondRecentFile.path.replace(/\.md$/, ''); // Remove .md extension
  const displayName = secondRecentFile.basename;

  return `"[[${fullPath}|${displayName}]]"`;
};
