const folder = input?.folder ?? "Wiki/Characters";

// Get pages in folder tagged 'article' and sort by creation date descending
const pages = dv.pages(`"${folder}"`)
                .where(p => p.tags && p.tags.includes("article"))
                .sort(p => p.file.ctime, "desc");

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

// Map to file links
let columns = filteredPages.map(col => col.map(p => p.file.link));

// Determine max column length
const maxLength = Math.max(...columns.map(col => col.length));

// Pad columns with empty strings
columns = columns.map(col => {
    const copy = [...col];
    while (copy.length < maxLength) copy.push("");
    return copy;
});

// Transpose into rows
let tableRows = [];
for (let i = 0; i < maxLength; i++) {
    tableRows.push(columns.map(col => col[i]));
}

// Create headers: plain for Started, counts for the rest
const headers = statuses.map((status, idx) => {
    if (status === "Started") return status;
    return `${status} (${filteredPages[idx].length})`;
});

// Render the table
dv.table(headers, tableRows);
