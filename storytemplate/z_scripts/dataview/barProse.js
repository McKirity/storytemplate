// barProse.js
// Place this file at: z_scripts/dataview/barProse.js

const storyFolder = "Story";
const wikiFolder = "Wiki";

// Get all files from both folders
const storyFiles = app.vault.getMarkdownFiles().filter(f => f.path.startsWith(storyFolder + "/"));
const wikiFiles = app.vault.getMarkdownFiles().filter(f => f.path.startsWith(wikiFolder + "/"));

let storyProseCount = 0;
let wikiProseCount = 0;

// Count Story prose words (from files tagged with 'scene')
for (const file of storyFiles) {
    const content = await app.vault.read(file);
    
    // Check tags in YAML frontmatter
    const cache = app.metadataCache.getFileCache(file);
    const yamlTags = cache?.frontmatter?.tags || [];
    
    if (yamlTags.includes("scene")) {
        // Remove YAML frontmatter for PROSE
        const proseContent = content.replace(/^---[\s\S]*?---\s*/, '');
        const proseWords = proseContent.split(/\s+/).filter(w => w.length > 0).length;
        storyProseCount += proseWords;
    }
}

// Count Wiki prose words (from files tagged with 'article')
for (const file of wikiFiles) {
    const content = await app.vault.read(file);
    
    // Check tags in YAML frontmatter
    const cache = app.metadataCache.getFileCache(file);
    const yamlTags = cache?.frontmatter?.tags || [];
    
    if (yamlTags.includes("article")) {
        // Remove YAML frontmatter for PROSE
        const proseContent = content.replace(/^---[\s\S]*?---\s*/, '');
        const proseWords = proseContent.split(/\s+/).filter(w => w.length > 0).length;
        wikiProseCount += proseWords;
    }
}

// Calculate totals and proportions
const totalProseWords = storyProseCount + wikiProseCount;
const storyPercentage = totalProseWords > 0 ? (storyProseCount / totalProseWords) * 100 : 0;
const wikiPercentage = totalProseWords > 0 ? (wikiProseCount / totalProseWords) * 100 : 0;

// Data array for easier processing
const sections = [
    { name: 'Story', wordCount: storyProseCount, percentage: storyPercentage },
    { name: 'Wiki', wordCount: wikiProseCount, percentage: wikiPercentage }
];

// Generate colors
const colors = input?.colors || ['#4CAF50', '#2196F3'];

// Get parameters with defaults
const chartType = input?.type || "progress"; // "pie", "bar", or "progress"
const title = input?.title || "Total Prose Count";
const radius = input?.radius || 120;
const barHeight = input?.barHeight || 40;

// Function to create SVG path for pie slice
function createPieSlice(startAngle, endAngle, radius, centerX, centerY) {
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
    
    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

let chartHtml = '';

if (chartType === "pie") {
    // PIE CHART IMPLEMENTATION
    const centerX = 150;
    const centerY = 150;
    const legendStartX = 320;
    const svgWidth = 550;
    const svgHeight = 300;

    // Generate SVG pie chart
    let currentAngle = -Math.PI / 2; // Start at top
    let pieSlices = '';
    let legendItems = '';

    sections.forEach((section, index) => {
        const { name, wordCount, percentage } = section;
        const sliceAngle = totalProseWords > 0 ? (wordCount / totalProseWords) * 2 * Math.PI : 0;
        const endAngle = currentAngle + sliceAngle;
        const color = colors[index % colors.length];
        
        // Create pie slice
        if (sliceAngle > 0) {
            const pathData = createPieSlice(currentAngle, endAngle, radius, centerX, centerY);
            
            pieSlices += `
            <path d="${pathData}" 
                  fill="${color}" 
                  stroke="white" 
                  stroke-width="2"
                  class="pie-slice"
                  data-section="${name}"
                  data-words="${wordCount.toLocaleString()}"
                  data-percentage="${percentage.toFixed(1)}">
                <title>${name}: ${wordCount.toLocaleString()} prose words (${percentage.toFixed(1)}%)</title>
            </path>`;
            
            // Add percentage label if slice is large enough
            if (percentage > 10) {
                const labelAngle = currentAngle + sliceAngle / 2;
                const labelRadius = radius * 0.7;
                const labelX = centerX + labelRadius * Math.cos(labelAngle);
                const labelY = centerY + labelRadius * Math.sin(labelAngle);
                
                pieSlices += `
                <text x="${labelX}" 
                      y="${labelY}" 
                      text-anchor="middle" 
                      dominant-baseline="middle" 
                      fill="white" 
                      font-size="14" 
                      font-weight="bold"
                      text-shadow="1px 1px 1px rgba(0,0,0,0.5)"
                      pointer-events="none">
                    ${name}
                </text>
                <text x="${labelX}" 
                      y="${labelY + 18}" 
                      text-anchor="middle" 
                      dominant-baseline="middle" 
                      fill="white" 
                      font-size="12" 
                      font-weight="bold"
                      text-shadow="1px 1px 1px rgba(0,0,0,0.5)"
                      pointer-events="none">
                    ${percentage.toFixed(0)}%
                </text>`;
            }
        }
        
        // Create legend item
        const legendY = 60 + index * 25;
        
        legendItems += `
        <rect x="${legendStartX}" 
              y="${legendY - 8}" 
              width="15" 
              height="15" 
              fill="${color}" 
              stroke="white" 
              stroke-width="1"/>
        <text x="${legendStartX + 25}" 
              y="${legendY + 3}" 
              font-size="14" 
              font-family="Arial, sans-serif" 
              fill="var(--text-normal)">
            ${name}: ${wordCount.toLocaleString()} (${percentage.toFixed(1)}%)
        </text>`;
        
        currentAngle = endAngle;
    });

    chartHtml = `<div style="margin: 20px 0; display: flex; justify-content: center;">
        <svg width="${svgWidth}" height="${svgHeight}" style="background: var(--background-primary); border-radius: 8px;">
            <style>
            .pie-slice {
                transition: transform 0.2s ease, filter 0.2s ease;
                transform-origin: ${centerX}px ${centerY}px;
                cursor: pointer;
            }
            .pie-slice:hover {
                transform: scale(1.05);
                filter: brightness(1.1);
            }
            </style>
            <!-- Pie chart -->
            ${pieSlices}
            
            <!-- Legend -->
            ${legendItems}
            
            <!-- Title -->
            <text x="150" y="20" 
                  text-anchor="middle" 
                  font-size="16" 
                  font-weight="bold" 
                  font-family="Arial, sans-serif" 
                  fill="var(--text-normal)">
                ${title}
            </text>
        </svg>
    </div>`;

} else if (chartType === "bar") {
    // BAR CHART IMPLEMENTATION
    const chartWidth = 500;
    const chartHeight = sections.length * (barHeight + 15) + 100;
    const leftMargin = 80;
    const rightMargin = 120;
    const topMargin = 40;
    const maxWords = Math.max(storyProseCount, wikiProseCount);

    // Generate bars and labels
    let bars = '';

    sections.forEach((section, index) => {
        const { name, wordCount, percentage } = section;
        const barWidth = maxWords > 0 ? (wordCount / maxWords) * (chartWidth - leftMargin - rightMargin) : 0;
        const color = colors[index % colors.length];
        const y = topMargin + index * (barHeight + 15);
        
        // Create bar
        bars += `
        <!-- Bar -->
        <rect x="${leftMargin}" 
              y="${y}" 
              width="${barWidth}" 
              height="${barHeight}" 
              fill="${color}" 
              stroke="white" 
              stroke-width="1"
              rx="3"
              class="bar-item"
              data-section="${name}"
              data-words="${wordCount.toLocaleString()}"
              data-percentage="${percentage.toFixed(1)}">
            <title>${name}: ${wordCount.toLocaleString()} prose words (${percentage.toFixed(1)}%)</title>
        </rect>
        
        <!-- Section label (left side) -->
        <text x="${leftMargin - 10}" 
              y="${y + barHeight/2}" 
              text-anchor="end" 
              dominant-baseline="middle" 
              font-size="14" 
              font-family="Arial, sans-serif" 
              font-weight="bold"
              fill="var(--text-normal)">
            ${name}
        </text>
        
        <!-- Word count label (right side) -->
        <text x="${leftMargin + barWidth + 10}" 
              y="${y + barHeight/2}" 
              text-anchor="start" 
              dominant-baseline="middle" 
              font-size="13" 
              font-family="Arial, sans-serif" 
              fill="var(--text-muted)">
            ${wordCount.toLocaleString()} (${percentage.toFixed(1)}%)
        </text>`;
    });

    chartHtml = `<div style="margin: 20px 0; display: flex; justify-content: center;">
        <svg width="${chartWidth + 40}" height="${chartHeight}" style="background: var(--background-primary); border-radius: 8px; padding: 20px; box-sizing: border-box;">
            <style>
            .bar-item {
                transition: filter 0.2s ease, stroke-width 0.2s ease;
                cursor: pointer;
            }
            .bar-item:hover {
                filter: brightness(1.1);
                stroke-width: 2;
            }
            </style>
            <!-- Title -->
            <text x="${(chartWidth + 40)/2}" y="25" 
                  text-anchor="middle" 
                  font-size="16" 
                  font-weight="bold" 
                  font-family="Arial, sans-serif" 
                  fill="var(--text-normal)">
                ${title}
            </text>
            
            <!-- Bars and labels -->
            ${bars}
            
            <!-- X-axis line (optional) -->
            <line x1="${leftMargin}" 
                  y1="${topMargin + sections.length * (barHeight + 15)}" 
                  x2="${leftMargin + chartWidth - leftMargin - rightMargin}" 
                  y2="${topMargin + sections.length * (barHeight + 15)}" 
                  stroke="var(--text-muted)" 
                  stroke-width="1" 
                  opacity="0.3"/>
        </svg>
    </div>`;

} else {
    // PROGRESS BAR IMPLEMENTATION (Original)
    chartHtml = `<div style="margin: 10px 0;">
        <div style="display: flex; width: 100%; height: 30px; border: 1px solid #ccc; border-radius: 5px; overflow: hidden;">
            <div style="background-color: ${colors[0]}; width: ${storyPercentage}%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
                ${storyPercentage > 15 ? 'Story' : ''}
            </div>
            <div style="background-color: ${colors[1]}; width: ${wikiPercentage}%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
                ${wikiPercentage > 15 ? 'Wiki' : ''}
            </div>
        </div>
    </div>`;
}

// Output results
dv.el("div", chartHtml);
dv.paragraph(`**Total:** ${totalProseWords.toLocaleString()} prose words`);