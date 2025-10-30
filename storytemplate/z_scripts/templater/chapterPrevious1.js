module.exports = async (tp) => {
  const path = tp.file.path(true); // e.g., Story/Tale1/Chapter 2/Chapter 2.md
  const parts = path.split("/");

  if (parts.length < 4) return "";

  const story = parts[1]; // "Tale1"
  const chapterFolder = parts[2]; // "Chapter 2"
  const chapterFile = parts[3];   // "Chapter 2.md"

  // Extract chapter number from folder name
  const match = chapterFolder.match(/Chapter\s+(\d+)/i);
  if (!match) return "";

  const currentChapter = parseInt(match[1], 10);
  const prevChapter = currentChapter - 1;

  if (prevChapter <= 0) return '""'; // Output empty quoted string

  const prevFolder = `Chapter ${prevChapter}`;
  const prevFile = `Chapter ${prevChapter}`;

  // Build the wikilink
  const link = `"[[Story/${story}/${prevFolder}/${prevFile}|${prevFile}]]"`;
  return link;
};
