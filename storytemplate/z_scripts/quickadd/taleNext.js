module.exports = async () => {
  const files = app.vault.getMarkdownFiles();

  // Step 1: Filter all alpha-tagged Tale folder notes inside 'Story'
  const alphaTales = files.filter(file => {
    // Only include files in Story/
    if (!file.path.startsWith("Story/")) return false;

    const cache = app.metadataCache.getFileCache(file);
    const frontmatter = cache?.frontmatter;
    if (!frontmatter) return false;

    const tags = frontmatter.tags;
    const isAlpha = Array.isArray(tags)
      ? tags.includes("alpha")
      : tags === "alpha";

    if (!isAlpha) return false;

    // Only folder notes: basename = folder name
    const folderName = file.parent?.name || file.path.split("/").slice(-2, -1)[0];
    return file.basename === folderName;
  });

  // Step 2: Sort by creation date descending (newest first)
  const sortedTales = alphaTales.slice().sort((a, b) => b.stat.ctime - a.stat.ctime);

  if (sortedTales.length < 2) {
    new Notice("Not enough alpha-tagged Tale folder notes to set 'Next'.");
    return;
  }

  // Step 3: Only update the second most recent Tale
  const mostRecent = sortedTales[0];      // newest (no Next)
  const secondMostRecent = sortedTales[1]; // only this one gets Next

  const mostRecentPath = mostRecent.path.replace(/\.md$/, "");
  const mostRecentName = mostRecent.basename;

  // Step 4: Read and update YAML frontmatter of the second most recent Tale
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
