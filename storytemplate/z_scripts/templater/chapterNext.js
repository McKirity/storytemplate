module.exports = async (tp) => {
  const currentPath = tp.file.path(true);

  if (typeof currentPath !== "string") {
    return "";
  }

  const parts = currentPath.split("/");

  if (parts.length < 3) {
    return "";
  }

  const filename = tp.file.title;
  const chapterFolder = parts[parts.length - 2];
  const talePath = parts.slice(0, parts.length - 2).join("/");

  const match = chapterFolder.match(/Chapter (\d+)/i);
  if (!match) {
    return "";
  }

  const currentChapterNum = parseInt(match[1]);
  const nextChapterNum = currentChapterNum + 1;

  // Optional: You might want to check if next chapter exists, but for now just generate link
  const nextChapterFolder = `Chapter ${nextChapterNum}`;
  const nextFilePath = `${talePath}/${nextChapterFolder}/${filename}`;

  return `"[[${nextFilePath}|Link]]"`;
};
