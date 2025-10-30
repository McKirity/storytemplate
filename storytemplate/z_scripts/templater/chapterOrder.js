module.exports = async (tp) => {
  // Get the vault-relative path
  const path = tp.file.path(true);
  const parts = path.split("/");

  // Get the folder name (e.g., "Chapter 3")
  parts.pop(); // remove file name
  const folderName = parts[parts.length - 1];

  // Extract the number from the folder name using regex
  const match = folderName.match(/Chapter\s+(\d+)/i);

  // Return the number or fallback to 0 if no match found
  return match ? parseInt(match[1], 10) : 0;
};
