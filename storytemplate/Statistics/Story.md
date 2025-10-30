# Overall
```dataviewjs
await dv.view("z_scripts/dataview/wordStory");
```
# Tales
```dataviewjs
dv.view("z_scripts/dataview/barStoryTale", { 
	colors: ['#089F87', '#1E3A8A', '#7F1D1D', '#B59F3B'] 
});
```
## Tales

Be sure to fill out file path for each code block
```dataviewjs
await dv.view("z_scripts/dataview/wordTale", {
  folder: "Story/"
});
```
```dataviewjs 
dv.view("z_scripts/dataview/barChapter", {
    type: "pie",
    tale: "Story/", 
    title: "Heck",
    colors: ['#1E3A8A', '#1E40AF', '#0E7490', '#0891B2', '#06B6D4', 
'#0D9488', '#10B981', '#059669', '#047857', '#065F46'
],
})
```
