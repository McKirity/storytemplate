module.exports = async (tp) => {
  const path = tp.file.path(true); // e.g., Story/Tale1/Chapter 2/Chapter 2.md
  const parts = path.split("/");

  if (parts.length < 4) return "";

  const story = parts[1]; // "Tale1"
  const chapterFolder = parts[2]; // "Chapter 2"

  // Extract current chapter number
  const match = chapterFolder.match(/Chapter\s+(\d+)/i);
  if (!match) return "";

  const currentChapter = parseInt(match[1], 10);
  const nextChapter = currentChapter + 1;

  const nextFolder = `Chapter ${nextChapter}`;
  const nextFile = `Chapter ${nextChapter}`;

  // Build the wikilink
  const link = `"[[Story/${story}/${nextFolder}/${nextFile}|${nextFile}]]"`;
  return link;
};
