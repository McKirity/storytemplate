module.exports = async (tp) => {
  // Get vault-relative path (e.g., Story/Tale1/Chapter 1/_note.md)
  const path = tp.file.path(true);
  const parts = path.split("/");

  // Remove the filename (_note.md)
  parts.pop();

  // Get the folder name (e.g., Chapter 1)
  const folderName = parts[parts.length - 1];

  // Build the path to the chapter file: Story/Tale1/Chapter 1/Chapter 1.md
  const chapterFilePath = [...parts, `${folderName}.md`].join("/");

  // Return the wikilink with alias and wrapped in quotes
  return `"[[${chapterFilePath}|${folderName}]]"`;
};
