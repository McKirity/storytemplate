// barStoryTale.js
// Place this file at: z_scripts/dataview/barStoryTale.js

const storyFolder = "Story";

// Get all files from the story folder, excluding _drafts
const allFiles = app.vault.getMarkdownFiles().filter(f => 
    f.path.startsWith(storyFolder + "/") && 
    !f.path.startsWith(storyFolder + "/_drafts")
);

// Track word counts by tale
const taleWordCounts = {};

// Count words for each tale
for (const file of allFiles) {
    const content = await app.vault.read(file);
    const allWords = content.split(/\s+/).filter(w => w.length > 0).length;
    
    // Extract Tale from file path: Story/Tale1/Chapter1/scene.md
    const pathParts = file.path.split('/');
    if (pathParts.length >= 3) {
        const tale = pathParts[1]; // Tale name (second part after Story/)
        taleWordCounts[tale] = (taleWordCounts[tale] || 0) + allWords;
    }
}

// Sort tales by word count (descending)
const sortedTales = Object.entries(taleWordCounts).sort((a, b) => b[1] - a[1]);

// Calculate total words and find max for scaling
const totalWords = Object.values(taleWordCounts).reduce((sum, count) => sum + count, 0);
const maxWords = Math.max(...Object.values(taleWordCounts));

// Generate colors for tales (cycling through a set of colors)
const colors = input?.colors || ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#009688', '#795548', '#607D8B'];

// Get parameters with defaults
const chartType = input?.type || "pie"; // "pie", "bar", or "progress"
const title = input?.title || "Story Distribution";
const radius = input?.radius || 120;
const barHeight = input?.barHeight || 30;

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

    // Calculate required height based on number of tales
    const itemsPerColumn = 10;
    const columnsNeeded = Math.ceil(sortedTales.length / itemsPerColumn);
    const itemsInTallestColumn = Math.min(sortedTales.length, itemsPerColumn);
    const svgWidth = Math.max(550, 320 + columnsNeeded * 220);
    const svgHeight = Math.max(300, 80 + itemsInTallestColumn * 25);

    // Generate SVG pie chart
    let currentAngle = -Math.PI / 2; // Start at top
    let pieSlices = '';
    let legendItems = '';

    sortedTales.forEach(([tale, wordCount], index) => {
        const percentage = totalWords > 0 ? (wordCount / totalWords) * 100 : 0;
        const sliceAngle = (wordCount / totalWords) * 2 * Math.PI;
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
                  data-tale="${tale}"
                  data-words="${wordCount.toLocaleString()}"
                  data-percentage="${percentage.toFixed(1)}">
                <title>${tale}: ${wordCount.toLocaleString()} words (${percentage.toFixed(1)}%)</title>
            </path>`;
            
            // Add percentage label if slice is large enough
            if (percentage > 5) {
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
                      font-size="12" 
                      font-weight="bold"
                      text-shadow="1px 1px 1px rgba(0,0,0,0.5)"
                      pointer-events="none">
                    ${percentage.toFixed(0)}%
                </text>`;
            }
        }
        
        // Create legend item with multi-column support
        const columnIndex = Math.floor(index / itemsPerColumn);
        const itemInColumn = index % itemsPerColumn;
        const legendX = legendStartX + (columnIndex * 220);
        const legendY = 40 + itemInColumn * 25;
        
        legendItems += `
        <rect x="${legendX}" 
              y="${legendY - 8}" 
              width="15" 
              height="15" 
              fill="${color}" 
              stroke="white" 
              stroke-width="1"/>
        <text x="${legendX + 25}" 
              y="${legendY + 3}" 
              font-size="13" 
              font-family="Arial, sans-serif" 
              fill="var(--text-normal)">
            ${tale}: ${wordCount.toLocaleString()} (${percentage.toFixed(1)}%)
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
    const chartHeight = sortedTales.length * (barHeight + 10) + 100;
    const leftMargin = 120;
    const rightMargin = 100;
    const topMargin = 40;

    // Generate bars and labels
    let bars = '';

    sortedTales.forEach(([tale, wordCount], index) => {
        const percentage = totalWords > 0 ? (wordCount / totalWords) * 100 : 0;
        const barWidth = (wordCount / maxWords) * (chartWidth - leftMargin - rightMargin);
        const color = colors[index % colors.length];
        const y = topMargin + index * (barHeight + 10);
        
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
              data-tale="${tale}"
              data-words="${wordCount.toLocaleString()}"
              data-percentage="${percentage.toFixed(1)}">
            <title>${tale}: ${wordCount.toLocaleString()} words (${percentage.toFixed(1)}%)</title>
        </rect>
        
        <!-- Tale label (left side) -->
        <text x="${leftMargin - 10}" 
              y="${y + barHeight/2}" 
              text-anchor="end" 
              dominant-baseline="middle" 
              font-size="13" 
              font-family="Arial, sans-serif" 
              font-weight="bold"
              fill="var(--text-normal)">
            ${tale}
        </text>
        
        <!-- Word count label (right side) -->
        <text x="${leftMargin + barWidth + 10}" 
              y="${y + barHeight/2}" 
              text-anchor="start" 
              dominant-baseline="middle" 
              font-size="12" 
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
                  y1="${topMargin + sortedTales.length * (barHeight + 10)}" 
                  x2="${leftMargin + chartWidth - leftMargin - rightMargin}" 
                  y2="${topMargin + sortedTales.length * (barHeight + 10)}" 
                  stroke="var(--text-muted)" 
                  stroke-width="1" 
                  opacity="0.3"/>
        </svg>
    </div>`;

} else {
    // PROGRESS BAR IMPLEMENTATION
    let progressBarSegments = '';
    
    sortedTales.forEach(([tale, wordCount], index) => {
        const percentage = totalWords > 0 ? Math.round((wordCount / totalWords) * 100) : 0;
        const color = colors[index % colors.length];
        
        // Add segment to progress bar
        progressBarSegments += `
            <div style="background-color: ${color}; width: ${percentage}%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px; text-shadow: 1px 1px 1px rgba(0,0,0,0.5);">
                ${percentage > 8 ? tale : ''}
            </div>`;
    });

    chartHtml = `
    <div style="margin: 10px 0;">
        <div style="display: flex; width: 100%; height: 35px; border: 1px solid #ccc; border-radius: 5px; overflow: hidden;">
            ${progressBarSegments}
        </div>
    </div>`;
}

// Output results
dv.el("div", chartHtml);
dv.paragraph(`**Total:** ${totalWords.toLocaleString()} words`);