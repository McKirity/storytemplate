module.exports = async (tp) => {
  const path = tp.file.path(true); // e.g., Story/Tale1/Chapter 1/_note.md
  const parts = path.split("/");

  if (parts.length < 3) return '""'; // Safety fallback

  const storyName = parts[1]; // "Tale1"

  return `"[[${storyName}]]"`; // Just the story name, as a wikilink
};
