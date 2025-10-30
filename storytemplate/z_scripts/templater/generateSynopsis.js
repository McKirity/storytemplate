module.exports = async (tp) => {
  const files = tp.app.vault.getMarkdownFiles();

  // Filter for scene-tagged files
  const sceneFiles = files.filter(file => {
    const cache = tp.app.metadataCache.getFileCache(file);
    const tags = cache?.frontmatter?.tags;
    return tags?.includes('scene');
  });

  if (!sceneFiles.length) return '"No scene files found."';

  // Sort all scene files by creation time descending
  sceneFiles.sort((a, b) => b.stat.ctime - a.stat.ctime);

  const mostRecent = sceneFiles[0];

  // Get folder path of the most recent file
  const folderPath = tp.app.vault.getAbstractFileByPath(mostRecent.path).parent.path;

  // Filter only files in the same folder
  const folderSceneFiles = sceneFiles.filter(f => {
    const fFolder = tp.app.vault.getAbstractFileByPath(f.path).parent.path;
    return fFolder === folderPath;
  });

  // Sort folder-scene files by creation time ascending
  folderSceneFiles.sort((a, b) => a.stat.ctime - b.stat.ctime);

  // Compute Order relative to folder
  const order = folderSceneFiles.findIndex(f => f.path === mostRecent.path) + 1;

  // Construct _outline path without extension
  const outlinePath = `${folderPath}/_outline`;

  // Remove extension from file name
  const fileName = mostRecent.name.replace(/\.md$/, "");

  // Construct header target
  const headerTarget = `${order}. ${mostRecent.path.replace(/\.md$/, "")} ${fileName}`;

  // Return clickable Obsidian link enclosed in double quotes
  return `"[[${outlinePath}#${headerTarget}|Link]]"`;
};
