// wordWiki.js
// Place this file at: z_scripts/dataview/wordWiki.js

const folderPath = "Wiki";

// Get all Markdown files in the wiki folder
const allFiles = app.vault.getMarkdownFiles().filter(f => f.path.startsWith(folderPath + "/"));

let totalWordCount = 0;
let totalProseWordCount = 0;
let totalArticleCount = 0;

// Track word counts by Topic folders and individual articles
const topicWordCounts = {};
let maxArticleWordCount = 0;
let maxArticleFile = null;

for (const file of allFiles) {
    const content = await app.vault.read(file);
    
    // Count all words including YAML
    const allWords = content.split(/\s+/).filter(w => w.length > 0).length;
    totalWordCount += allWords;
    
    // Extract Topic from file path
    // Expected format: Wiki/Topic/article.md
    const pathParts = file.path.split('/');
    if (pathParts.length >= 3) { // Wiki/Topic/file.md
        const topic = pathParts[1]; // Topic name
        
        // Add to topic word count
        topicWordCounts[topic] = (topicWordCounts[topic] || 0) + allWords;
    }
    
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
const totalTopicCount = Object.keys(topicWordCounts).length;
const avgByTopic = totalTopicCount > 0 ? Math.round(totalWordCount / totalTopicCount) : 0;
const avgByArticle = totalArticleCount > 0 ? Math.round(totalWordCount / totalArticleCount) : 0;

// Find maximums
const articleWithMostWords = maxArticleFile ? `[[${maxArticleFile.basename}]] (${maxArticleWordCount} words)` : "No articles found";

// Find topic with most words - look for the topic file in the folder with most total words
let maxTopicWordCount = 0;
let maxTopicFolder = null;
for (const [topic, wordCount] of Object.entries(topicWordCounts)) {
    if (wordCount > maxTopicWordCount) {
        maxTopicWordCount = wordCount;
        maxTopicFolder = topic;
    }
}

// Now find the actual topic file (tagged with 'alpha') in that folder
let topicWithMostWords = "No topics found";
if (maxTopicFolder) {
    // Look for the file tagged with 'alpha' in the winning topic folder
    const topicFile = allFiles.find(file => {
        const pathParts = file.path.split('/');
        // Check if this file is in the right topic folder
        const isInTopicFolder = pathParts.length >= 3 && pathParts[1] === maxTopicFolder;
        
        if (isInTopicFolder) {
            const cache = app.metadataCache.getFileCache(file);
            const yamlTags = cache?.frontmatter?.tags || [];
            return yamlTags.includes("alpha");
        }
        return false;
    });
    
    if (topicFile) {
        topicWithMostWords = `[[${topicFile.basename}]] (${maxTopicWordCount} words)`;
    } else {
        // Debug: show what we're looking for
        topicWithMostWords = `No topic file found in folder: ${maxTopicFolder}`;
    }
} else {
    topicWithMostWords = "No topic folders found";
}

// Output with minimal spacing
dv.paragraph(`**Total Words:** ${totalWordCount}<br>**Total Prose:** ${totalProseWordCount}<br>**Total Articles:** ${totalArticleCount}`);

dv.paragraph(`**Average Words per Topic:** ${avgByTopic}<br>**Average Words per Article:** ${avgByArticle}`);

dv.paragraph(`**Topic with Most Words:** ${topicWithMostWords}<br>**Article with Most Words:** ${articleWithMostWords}`);