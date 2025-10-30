// wordTale.js
// Place this file at: z_scripts/dataview/wordTale.js

const folderPath = input.folder || "Story/North"; // Use input parameter or default

// Get all Markdown files in the tale folder
const allFiles = app.vault.getMarkdownFiles().filter(f => f.path.startsWith(folderPath + "/"));

let totalWordCount = 0;
let totalProseWordCount = 0;
let totalSceneCount = 0;

// Track word counts by Chapter folders, chapter files, and individual scenes
const chapterWordCounts = {};
let maxSceneWordCount = 0;
let maxSceneFile = null;

for (const file of allFiles) {
    const content = await app.vault.read(file);
    
    // Count all words including YAML
    const allWords = content.split(/\s+/).filter(w => w.length > 0).length;
    totalWordCount += allWords;
    
    // Extract Chapter from file path
    // Expected format: Story/North/Chapter 1/Chapter 1.md
    const pathParts = file.path.split('/');
    if (pathParts.length >= 4) { // Story/Region/Chapter/file.md
        const chapter = pathParts[2]; // Chapter 1
        
        // Add to chapter word count
        chapterWordCounts[chapter] = (chapterWordCounts[chapter] || 0) + allWords;
    }
    
    // Check tags in YAML frontmatter
    const cache = app.metadataCache.getFileCache(file);
    const yamlTags = cache?.frontmatter?.tags || [];
    
    // Count scenes and prose words
    if (yamlTags.includes("scene")) {
        totalSceneCount++;
        
        // Remove YAML frontmatter for PROSE
        const proseContent = content.replace(/^---[\s\S]*?---\s*/, '');
        const proseWords = proseContent.split(/\s+/).filter(w => w.length > 0).length;
        totalProseWordCount += proseWords;
        
        // Track scene with most words (using prose word count, excluding YAML)
        if (proseWords > maxSceneWordCount) {
            maxSceneWordCount = proseWords;
            maxSceneFile = file;
        }
    }
}

// Calculate averages
const totalChapterCount = Object.keys(chapterWordCounts).length;
const avgByChapter = totalChapterCount > 0 ? Math.round(totalWordCount / totalChapterCount) : 0;
const avgByScene = totalSceneCount > 0 ? Math.round(totalWordCount / totalSceneCount) : 0;

// Find maximums - using the same approach as wordStory.js
const sceneWithMostWords = maxSceneFile ? `[[${maxSceneFile.basename}]] (${maxSceneWordCount} words)` : "No scenes found";

// Find chapter with most words - look for the chapter file in the folder with most total words
let maxChapterWordCount = 0;
let maxChapterFolder = null;
for (const [chapter, wordCount] of Object.entries(chapterWordCounts)) {
    if (wordCount > maxChapterWordCount) {
        maxChapterWordCount = wordCount;
        maxChapterFolder = chapter;
    }
}

// Now find the actual chapter file (tagged with 'chapter') in that folder
let chapterWithMostWords = "No chapters found";
if (maxChapterFolder) {
    // Look for the file tagged with 'chapter' in the winning chapter folder
    const chapterFile = allFiles.find(file => {
        const pathParts = file.path.split('/');
        // Check if this file is in the right chapter folder
        const isInChapterFolder = pathParts.length >= 4 && pathParts[2] === maxChapterFolder;
        
        if (isInChapterFolder) {
            const cache = app.metadataCache.getFileCache(file);
            const yamlTags = cache?.frontmatter?.tags || [];
            return yamlTags.includes("chapter");
        }
        return false;
    });
    
    if (chapterFile) {
        chapterWithMostWords = `[[${chapterFile.basename}]] (${maxChapterWordCount} words)`;
    } else {
        // Debug: show what we're looking for
        chapterWithMostWords = `No chapter file found in folder: ${maxChapterFolder}`;
    }
} else {
    chapterWithMostWords = "No chapter folders found";
}

// Output with minimal spacing
dv.paragraph(`**Total Word Count:** ${totalWordCount}<br>**Total Prose Count:** ${totalProseWordCount}<br>**Total Scenes:** ${totalSceneCount}`);

dv.paragraph(`**Average Words per Chapter:** ${avgByChapter}<br>**Average Words per Scene:** ${avgByScene}`);

dv.paragraph(`**Chapter with Most Words:** ${chapterWithMostWords}<br>**Scene with Most Words:** ${sceneWithMostWords}`);