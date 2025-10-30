module.exports = async (params) => {
    const { quickAddApi: { inputPrompt }, app } = params;
    
    try {
        // Get the tale name from user input
        const taleName = await inputPrompt("Enter Tale name:");
        
        if (!taleName || taleName.trim() === "") {
            new Notice("Tale name cannot be empty!");
            return;
        }
        
        const sanitizedTaleName = taleName.trim();
        new Notice(`Creating tale: ${sanitizedTaleName}`);
        
        // Check if z_templates folder exists
        const zTemplatesFolder = app.vault.getAbstractFileByPath("z_templates");
        if (!zTemplatesFolder) {
            new Notice("❌ z_templates folder not found at root level!");
            return;
        }
        
        // Check if tale template folder exists
        const taleTemplateFolder = app.vault.getAbstractFileByPath("z_templates/tale");
        if (!taleTemplateFolder) {
            new Notice("❌ z_templates/tale folder not found!");
            return;
        }
        
        if (!taleTemplateFolder.children || taleTemplateFolder.children.length === 0) {
            new Notice("❌ z_templates/tale folder is empty!");
            return;
        }
        
        // Define target paths
        const storyTalePath = `Story/${sanitizedTaleName}`;
        const basesTalePath = `z_bases/story/${sanitizedTaleName}`;
        
        // Create parent folders
        await createFolderIfNotExists(app, "Story");
        await createFolderIfNotExists(app, "z_bases");
        await createFolderIfNotExists(app, "z_bases/story");
        
        // Create target folders
        await createFolderIfNotExists(app, storyTalePath);
        await createFolderIfNotExists(app, basesTalePath);
        
        // Process each file from template
        let copiedCount = 0;
        let baseFilesCount = 0;
        
        for (const templateFile of taleTemplateFolder.children) {
            if (!templateFile.children) { // It's a file, not a subfolder
                try {
                    const sourceContent = await app.vault.read(templateFile);
                    
                    // Check if it's a .base file
                    if (templateFile.name.endsWith('.base')) {
                        // Handle .base files - move to z_bases with renamed filename
                        let targetFileName = templateFile.name.replace(/^x_/, `${sanitizedTaleName}_`);
                        const basesFilePath = `${basesTalePath}/${targetFileName}`;
                        await app.vault.create(basesFilePath, sourceContent);
                        baseFilesCount++;
                        new Notice(`📄 Created base file: ${targetFileName}`);
                        
                    } else if (templateFile.name === "tale.md") {
                        // Handle tale.md - goes to Story folder with tale name, just change title
                        const targetFileName = `${sanitizedTaleName}.md`;
                        let targetContent = sourceContent.replace(/{{TALE_NAME}}/g, sanitizedTaleName);
                        
                        const storyFilePath = `${storyTalePath}/${targetFileName}`;
                        await app.vault.create(storyFilePath, targetContent);
                        copiedCount++;
                        new Notice(`📄 Created: ${targetFileName}`);
                        
                    } else {
                        // Handle other non-.base files - copy to Story folder only
                        const storyFilePath = `${storyTalePath}/${templateFile.name}`;
                        await app.vault.create(storyFilePath, sourceContent);
                        copiedCount++;
                        new Notice(`📄 Created: ${templateFile.name}`);
                    }
                    
                } catch (fileError) {
                    new Notice(`❌ Error processing ${templateFile.name}: ${fileError.message}`);
                }
            } else {
                new Notice(`⚠️ Skipping subfolder: ${templateFile.name} (subfolders not supported yet)`);
            }
        }
        
        if (copiedCount > 0 || baseFilesCount > 0) {
            new Notice(`🎉 Success! Created tale "${sanitizedTaleName}" with ${copiedCount} story files and ${baseFilesCount} base files`);
        } else {
            new Notice("❌ No files were processed!");
        }
        
    } catch (error) {
        new Notice(`❌ Unexpected error: ${error.message}`);
    }
};

// Helper function to create folder if it doesn't exist
async function createFolderIfNotExists(app, folderPath) {
    const folder = app.vault.getAbstractFileByPath(folderPath);
    if (!folder) {
        await app.vault.createFolder(folderPath);
        new Notice(`📁 Created: ${folderPath}`);
    }
}