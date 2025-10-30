module.exports = async () => {
  const files = app.vault.getMarkdownFiles();

  // Step 1: Find the most recently created file in the vault
  const sortedAll = files.slice().sort((a, b) => b.stat.ctime - a.stat.ctime);
  const mostRecent = sortedAll[0];

  const mostRecentPath = mostRecent.path.replace(/\.md$/, "");
  const mostRecentName = mostRecent.basename;

  // Step 2: Get folder of the most recent file
  const folderPath = mostRecent.parent.path;

  // Step 3: Filter files in that folder that are tagged with 'scene'
  const folderSceneFiles = files.filter((file) => {
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

  // Step 4: Sort by creation time (descending)
  const sortedScenes = folderSceneFiles
    .slice()
    .sort((a, b) => b.stat.ctime - a.stat.ctime);

  // Step 5: Make sure we have at least 2 scene files
  if (sortedScenes.length < 2) {
    new Notice("Not enough 'scene'-tagged files in this folder.");
    return;
  }

  const secondMostRecent = sortedScenes[1];

  // Step 6: Read and update the YAML frontmatter
  const content = await app.vault.read(secondMostRecent);

  const yamlRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(yamlRegex);

  if (!match) {
    new Notice(`No YAML frontmatter found in: ${secondMostRecent.basename}`);
    return;
  }

  const yamlContent = match[1];
  const restOfFile = content.slice(match[0].length).trimStart();

  const nextLink = `[[${mostRecentPath}|${mostRecentName}]]`;
  const nextLine = `Next: "${nextLink}"`;

  let updatedYaml;
  if (/^Next:/m.test(yamlContent)) {
    updatedYaml = yamlContent.replace(/^Next:.*$/m, nextLine);
  } else {
    updatedYaml = yamlContent + `\n${nextLine}`;
  }

  const newContent = `---\n${updatedYaml}\n---\n\n${restOfFile}`;

  await app.vault.modify(secondMostRecent, newContent);

  new Notice(`'Next' set in: ${secondMostRecent.basename}`);
};
