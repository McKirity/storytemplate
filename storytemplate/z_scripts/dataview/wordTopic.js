// wordTopic.js
// Place this file at: z_scripts/dataview/wordTopic.js

const folderPath = input.folder || "Wiki/Topic1"; // Use input parameter or default

// Get all Markdown files in the topic folder
const allFiles = app.vault.getMarkdownFiles().filter(f => f.path.startsWith(folderPath + "/"));

let totalWordCount = 0;
let totalProseWordCount = 0;
let totalArticleCount = 0;

// Track individual articles
let maxArticleWordCount = 0;
let maxArticleFile = null;

for (const file of allFiles) {
    const content = await app.vault.read(file);
    
    // Count all words including YAML
    const allWords = content.split(/\s+/).filter(w => w.length > 0).length;
    totalWordCount += allWords;
    
    // Check tags in YAML frontmatter
    const cache = app.metadataCache.getFileCache(file);
    const yamlTags = cache?.frontmatter?.tags || [];
    
    // Count articles and prose words
    if (yamlTags.includes("article")) {
        totalArticleCount++;
        
        // Remove YAML frontmatter for PROSE
        const proseContent = content.replace(/^---[\s\S]*?---\s*/, '');
        const proseWords = proseContent.split(/\s+/).filter(w => w.length > 0).length;
        totalProseWordCount += proseWords;
        
        // Track article with most words (using prose word count, excluding YAML)
        if (proseWords > maxArticleWordCount) {
            maxArticleWordCount = proseWords;
            maxArticleFile = file;
        }
    }
}

// Calculate averages
const avgByArticle = totalArticleCount > 0 ? Math.round(totalWordCount / totalArticleCount) : 0;

// Find maximums
const articleWithMostWords = maxArticleFile ? `[[${maxArticleFile.basename}]] (${maxArticleWordCount} words)` : "No articles found";

// Output with minimal spacing
dv.paragraph(`**Total Words:** ${totalWordCount}<br>**Total Prose:** ${totalProseWordCount}<br>**Total Articles:** ${totalArticleCount}`);

dv.paragraph(`**Average Words per Article:** ${avgByArticle}`);

dv.paragraph(`**Article with Most Words:** ${articleWithMostWords}`);