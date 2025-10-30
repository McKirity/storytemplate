module.exports = async (params) => {
    const { app, quickAddApi } = params;
    const vault = app.vault;

    const storyRoot = "Story";
    const templateFolderPath = "z_templates/chapter";

    // Get the Story folder
    const storyFolder = vault.getAbstractFileByPath(storyRoot);
    if (!storyFolder || !storyFolder.children) {
        new Notice(`Could not find folder: ${storyRoot}`);
        return;
    }

    // Get direct subfolders of Story
    const subfolders = storyFolder.children
        .filter(f => f.children !== undefined)
        .map(f => f.path);

    if (subfolders.length === 0) {
        new Notice(`No subfolders inside ${storyRoot}`);
        return;
    }

    // Let user select one
    const targetFolder = await quickAddApi.suggester(subfolders, subfolders);
    if (!targetFolder) {
        new Notice("No Story selected.");
        return;
    }

    const taleName = targetFolder.split("/").pop();

    // Prompt for chapter number
    const chapterNumber = await quickAddApi.inputPrompt("Enter Chapter number:");
    if (!chapterNumber || isNaN(chapterNumber)) {
        new Notice("Invalid entry");
        return;
    }

    const chapterFolderName = `Chapter ${chapterNumber}`;
    const chapterFolderPath = `${targetFolder}/${chapterFolderName}`;

    // Ensure chapter folder exists
    let chapterFolder = vault.getAbstractFileByPath(chapterFolderPath);
    if (!chapterFolder) {
        await vault.createFolder(chapterFolderPath);
        chapterFolder = vault.getAbstractFileByPath(chapterFolderPath);
        new Notice(`Created Chapter folder: ${chapterFolderPath}`);
    }

    // Ensure z_bases/story/TaleName exists
    const baseFolderPath = `z_bases/story/${taleName}`;
    let baseFolder = vault.getAbstractFileByPath(baseFolderPath);
    if (!baseFolder) {
        await vault.createFolder(baseFolderPath);
        baseFolder = vault.getAbstractFileByPath(baseFolderPath);
        new Notice(`Created Base file: ${baseFolderPath}`);
    }

    // Load template folder
    const templateFolder = vault.getAbstractFileByPath(templateFolderPath);
    if (!templateFolder || !templateFolder.children) {
        new Notice(`Templates not found: ${templateFolderPath}`);
        return;
    }

    // Track skipped files
    const skippedFiles = [];

    // Copy files
    for (const file of templateFolder.children) {
        if (!file.children && file.extension) {
            const originalExtension = file.extension;
            let newBaseName = file.basename;

            // Default destination is chapter folder
            let destinationFolder = chapterFolderPath;

            // Rename "chapter" -> "Chapter X"
            if (newBaseName === "chapter") {
                newBaseName = chapterFolderName;
            }

            // Handle "toc_x_y" -> "toc_TaleName_ChapterNumber"
            else if (newBaseName.startsWith("toc_")) {
                newBaseName = `toc_${taleName}_${chapterNumber}`;

                // Move .base files into z_bases/story/TaleName
                if (originalExtension === "base") {
                    destinationFolder = baseFolderPath;
                }
            }

            const newFileName = `${newBaseName}.${originalExtension}`;
            const newFilePath = `${destinationFolder}/${newFileName}`;

            // Read template content
            let content = await vault.read(file);

            // Update toc reference inside chapter file
            if (file.basename === "chapter") {
                const tocRef = `toc_${taleName}_${chapterNumber}.base`;
                content = content.replace(/toc_x_y\.base/g, tocRef);
            }

            // Skip if already exists
            const existingFile = vault.getAbstractFileByPath(newFilePath);
            if (existingFile) {
                skippedFiles.push(newFilePath);
                continue;
            }

            await vault.create(newFilePath, content);
        }
    }

    // Success notice
    new Notice(`Chapter ${chapterNumber} created and all files generated.`);

    // Error notice for skipped files
    if (skippedFiles.length > 0) {
        new Notice(
            "The following files were not created because they already exist:\n" + 
            skippedFiles.join("\n")
        );
    }
};
