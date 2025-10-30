// wordStory.js
// Place this file at: z_scripts/dataview/wordStory.js

const folderPath = "Story";

// Get all Markdown files in the folder
const allFiles = app.vault.getMarkdownFiles().filter(f => f.path.startsWith(folderPath + "/"));

let totalWordCount = 0;
let totalProseWordCount = 0;
let totalStoryCount = 0;
let totalChapterCount = 0;
let totalSceneCount = 0;

// Track the scene with most words
let maxSceneWordCount = 0;
let maxSceneFile = null;

// Track word counts by Tale and Chapter folders
const taleWordCounts = {};
const chapterWordCounts = {};

for (const file of allFiles) {
    const content = await app.vault.read(file);
    
    // Count all words including YAML
    const allWords = content.split(/\s+/).filter(w => w.length > 0).length;
    totalWordCount += allWords;
    
    // Extract Tale and Chapter from file path
    // Expected format: Story/Tale1/Chapter 1/scene.md
    const pathParts = file.path.split('/');
    if (pathParts.length >= 4) { // Story/Tale/Chapter/file.md
        const tale = pathParts[1]; // Tale1
        const chapter = pathParts[2]; // Chapter 1
        const taleChapterKey = `${tale}/${chapter}`; // Tale1/Chapter 1
        
        // Add to tale word count
        taleWordCounts[tale] = (taleWordCounts[tale] || 0) + allWords;
        
        // Add to chapter word count
        chapterWordCounts[taleChapterKey] = (chapterWordCounts[taleChapterKey] || 0) + allWords;
    }
    
    // Check tags in YAML frontmatter
    const cache = app.metadataCache.getFileCache(file);
    const yamlTags = cache?.frontmatter?.tags || [];
    
    // Count stories
    if (yamlTags.includes("alpha")) {
        totalStoryCount++;
    }
    
    // Count chapters
    if (yamlTags.includes("chapter")) {
        totalChapterCount++;
    }
    
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
const avgByStory = totalStoryCount > 0 ? Math.round(totalWordCount / totalStoryCount) : 0;
const avgByChapter = totalChapterCount > 0 ? Math.round(totalWordCount / totalChapterCount) : 0;
const avgByScene = totalSceneCount > 0 ? Math.round(totalWordCount / totalSceneCount) : 0;

// Find maximums
const sceneWithMostWords = maxSceneFile ? `[[${maxSceneFile.basename}]] (${maxSceneWordCount} words)` : "No scenes found";

let maxTaleWordCount = 0;
let maxTale = null;
for (const [tale, wordCount] of Object.entries(taleWordCounts)) {
    if (wordCount > maxTaleWordCount) {
        maxTaleWordCount = wordCount;
        maxTale = tale;
    }
}
const taleWithMostWords = maxTale ? `[[${maxTale}]] (${maxTaleWordCount} words)` : "No tales found";

let maxChapterWordCount = 0;
let maxChapter = null;
for (const [chapter, wordCount] of Object.entries(chapterWordCounts)) {
    if (wordCount > maxChapterWordCount) {
        maxChapterWordCount = wordCount;
        maxChapter = chapter;
    }
}
const chapterWithMostWords = maxChapter ? `[[${maxChapter.split('/')[1]}]] (${maxChapterWordCount} words)` : "No chapters found";

// Output with minimal spacing
dv.paragraph(`**Total Word Count:** ${totalWordCount}<br>**Total Prose Count:** ${totalProseWordCount}<br>**Total Story:** ${totalStoryCount}<br>**Total Chapter:** ${totalChapterCount}<br>**Total Scene:** ${totalSceneCount}`);

dv.paragraph(`**Average Words per Story:** ${avgByStory}<br>**Average Words per Chapter:** ${avgByChapter}<br>**Average Words per Scene:** ${avgByScene}`);

dv.paragraph(`**Tale with Most Words:** ${taleWithMostWords}<br>**Chapter with Most Words:** ${chapterWithMostWords}<br>**Scene with Most Words:** ${sceneWithMostWords}`);