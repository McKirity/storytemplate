# Overall 
```dataviewjs
await dv.view("z_scripts/dataview/wordWiki", {
  folder: "Wiki"
});
```
# Topics
```dataviewjs
dv.view("z_scripts/dataview/barWikiTopic", {
    type: "pie", 
    title: "Wiki Distribution",
    colors: ['#E63946', '#2A9D8F', '#264653', '#F4A261', '#E76F51', '#8B5CF6']
})
```
## Characters
```dataviewjs
await dv.view("z_scripts/dataview/wordTopic", {
  folder: "Wiki/Characters"
});
```
## Settings
```dataviewjs
await dv.view("z_scripts/dataview/wordTopic", {
  folder: "Wiki/Settings"
});
```
## Groups
```dataviewjs
await dv.view("z_scripts/dataview/wordTopic", {
  folder: "Wiki/Groups"
});
```
## History
```dataviewjs
await dv.view("z_scripts/dataview/wordTopic", {
  folder: "Wiki/History"
});
```
## Concepts
```dataviewjs
await dv.view("z_scripts/dataview/wordTopic", {
  folder: "Wiki/Concepts"
});
```
## Objects
```dataviewjs
await dv.view("z_scripts/dataview/wordTopic", {
  folder: "Wiki/Objects"
});
```
