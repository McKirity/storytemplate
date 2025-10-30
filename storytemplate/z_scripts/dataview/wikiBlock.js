const folder = input?.folder ?? "Wiki/Characters";

// Get pages in folder tagged 'article'
const pages = dv.pages(`"${folder}"`)
                .where(p => p.tags && p.tags.includes("article"));

// Define statuses
const statuses = ["Started", "Current", "Completed", "Hiatus"];

// Filter pages per status
let filteredPages = statuses.map(status => {
    if (status === "Started") {
        return pages.filter(p => !p.Current && !p.Complete && !p.Hiatus);
    } else if (status === "Current") {
        return pages.filter(p => p.Current);
    } else if (status === "Completed") {
        return pages.filter(p => p.Complete);
    } else if (status === "Hiatus") {
        return pages.filter(p => p.Hiatus);
    }
});

// Total number of notes
const totalNotes = pages.length;

// Colors for each status
const colors = {
    Started: "#AAAAAA",    // gray
    Current: "#4CAF50",    // green
    Completed: "#2196F3",  // blue
    Hiatus: "#FF9800"      // orange
};

// Output counts per status with percentage
statuses.forEach((status, idx) => {
    const count = filteredPages[idx].length;
    const percentage = totalNotes > 0 ? ((count / totalNotes) * 100).toFixed(1) : 0;
    const p = dv.paragraph("");
    p.innerHTML = `Articles that are <span style="color: ${colors[status]}; font-weight: bold;">${status}</span>: ${count} (${percentage}%)`;
});

// Create stacked progress bar element
const container = dv.el("div");
container.style.display = "flex";
container.style.width = "100%";
container.style.height = "20px";
container.style.borderRadius = "5px";
container.style.overflow = "hidden";
container.style.marginTop = "5px";
container.style.border = "1px solid #ccc";

// Add segments for each status (always create, even if 0 width)
statuses.forEach((status, idx) => {
    const width = totalNotes > 0 ? (filteredPages[idx].length / totalNotes) * 100 : 0;
    const segment = document.createElement("div");
    segment.style.width = width + "%";
    segment.style.backgroundColor = colors[status];
    segment.title = `${status}: ${filteredPages[idx].length}`;
    container.appendChild(segment);
});

// Append the bar to Dataview
dv.container.appendChild(container);
