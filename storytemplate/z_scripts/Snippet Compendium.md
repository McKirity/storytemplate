List of all current snippets running in the vault. Each one is sorted into the plugin needed to run them. 
# Dataview
All dataviewjs plugins will require the following format:
```dataviewjs
await dv.view("z_scripts/dataview/JSFILENAME", {
  folder: "FOLDERPATH"
  tags: 
});
```

JSFILENAME = Name of the target js file
FOLDERPATH = folder/path/to the folder containing the files to draw metadata from
## summary
- Meant to be used in [[Home.canvas]] under the Story section
- Generates custom dataview table
	- Format: Chapter | Scenes
	- Displays *proportion bar + file count* of **#scene files** inside every **chapter folder**
- Steps
	- Defaults to folder specified in dataviewjs code block.
	- Finds all notes tagged `chapter` in specified folder, sorted by their `Order` property.
	- Collects all **scenes** (tagged `scene`) and groups them by their **Chapter folders.**
	- Finds the **maximum number of scenes** in any chapter to use as a scaling baseline.
	- For each chapter, draws a **blue proportional bar** alongside the raw count of its scenes.
	- Renders a table: **Chapter | Scenes**, with a “Summary” title above it.
- Relevant property: **Summary**
- File type: **Chapter**
![[summary.png|450]]
## roughdraft
- Similar to [[Snippet Compendium#Dataview#finaldraft|finaldraft]], meant to be used in [[Home.canvas|Home]] under the Story section
- Generates custom dataview table
	- Format: Chapter | Progress
	- Displays *progress bar + percentages* of **#scene files** inside every **chapter folder**
- Steps
	- Defaults to folder specified in dataviewjs code block.
	- Finds all notes tagged `chapter` in specified folder, sorted by their `Order` property.
	- Collects all **scenes** (tagged `scene`) and groups them by their **Chapter folders.**
	- For each chapter, it checks how many of its scenes have the property `Rough Draft: true`.
	- It then displays a **progress bar + percentage** showing how many scenes are in rough draft form.
	- Finally, it outputs a table: **Chapter | Progress** with the title “Rough Draft” above it.
- Relevant property: **Rough Draft**
- File type: **Chapter**
![[roughdraft.png|450]]
## finaldraft
- Similar to [[Snippet Compendium#Dataview#roughdraft|roughdraft]], meant to be used in [[Home.canvas|Home]] under the Story section
- Generates custom dataview table
	- Format: Chapter | Progress
	- Displays *progress bar + percentages* of **#scene files** inside every **chapter folder**
- Steps
	- Defaults to folder specified in dataviewjs code block.
	- Finds all notes tagged `chapter` in specified folder, sorted by their `Order` property.
	- Collects all **scenes** (tagged `scene`) and groups them by their **Chapter folders.**
	- For each chapter, it calculates how many scenes inside its folder are marked with `Final Draft: true`.
	- It then displays a **progress bar + percentage** next to each chapter link, showing how much of that chapter’s scenes are in final draft form.
	- Finally, it renders a table with columns: **Chapter | Progress**.
- Relevant property: **Final Draft**
- File type: **Chapter**
(I don't have shit in it right now lmao)
![[finaldraft.png|450]]
## published
- Meant to be used in [[Home.canvas|Home]] under the Story section
- Generates custom dataview table
	- Format: Chapter | Progress
	- Displays *checkmark* next to **chapter folder**
- Steps
	- Defaults to folder specified in dataviewjs code block.
	- Finds all notes tagged `chapter` in specified folder, sorted by their `Order` property.
	- For each chapter, it checks whether the metadata property `Published` is set to `true`.
	- If so, it shows a ✅ checkmark in the table; otherwise, the cell is left blank.
	- The output is a table: **Chapter | Published**, with the heading “Published” above it.
- Relevant property: **Published**
- File type: **Chapter**
![[published.png|450]]
## latest-scene
- Meant to be used in [[Home.canvas|Home]] under the Quick Access section
- Displays an info card for Last Modified Story (note tagged with **#scene** inside **Story Folder**)
	- 📝 Name and link to file
	- 📂 Location (folder path)
	- 🕐 Last modified date/time
	- ❗ Whatever is in **Status** property (my thoughts, progress of scene)
- Steps
	- Defaults to the `Story` folder and `scene` tag, but you can pass in different `folder` and `tags` via `input`.
	- Finds all matching files, sorts by **last modified time**, and picks the most recent.
	- Displays an “info card"
	- Falls back to a “No files found” message if nothing matches.
![[latestscene.png|500]]
## latest-wiki
- Meant to be used in [[Home.canvas|Home]] under the Quick Access section
- Displays an info card for Last Modified Wiki (note tagged with **#article** inside **Wiki Folder**)
	- 📝 Name and link to file
	- 📂 Location (folder path)
	- 🕐 Last modified date/time
	- ❗ Whatever is in **Status** property (my thoughts, progress of scene)
- Steps
	- Defaults to the `Wiki` folder and `article` tag (but accepts custom `folder`, `tags`, and `emojiMap` via `input`).
	- Finds all matching files, sorts by **last modified time**, and picks the most recent.
	- Displays an “info card"
	- Falls back to a “No files found” message if nothing matches.
![[latestwiki.png|500]]
## wikiBlock
- Meant to be used in [[Home.canvas|Home]] under the Wiki section for each topic
- Format
	- Status distribution tracker of all **Wiki notes** tagged with **#article**
		- Lists # of scenes under each status
	- Builds a stacked progress bar, with each colored segment proportional to status count
- Steps
	- Defaults to folder specified in dataviewjs code block.
	- Collects all notes tagged `article` in specified folder.
	- Defines four statuses: **Started, Current, Completed, Hiatus**, filtering notes into each based on frontmatter properties.
	- Calculates both **raw counts** and **percentages** for each status.
	- Displays these counts in color-coded text lines (gray, green, blue, orange).
	- Builds a **stacked progress bar**, with each colored segment proportional to its status count.
	- Even if a status has 0 items, it still renders a segment (just with no width).
- Relevant properties
	- **Started** (requires none to be checked)
	- **Current**
	- **Completed**
	- **Hiatus**
![[wikiBlock.png|600]]
## wikiAlpha
- Meant to be used in **Wiki Folder** for all notes tagged with **#alpha**
- Displays custom dataview table similar to a kanban table 
	- Format: Started | Current | Completed | Hiatus
	- Displays file inside of column depending on YAML property
- Steps
	- Defaults to folder specified in dataviewjs code block.
	- Collects all notes tagged `article` in specified folder, sorted by **creation date (newest first)**
	- Defines four statuses: **Started, Current, Completed, Hiatus**.
	- Filters notes into these categories based on their frontmatter properties (`Current`, `Complete`, `Hiatus`).
		- “Started” = articles with none of those properties set.
	- Lays out the results into **four side-by-side columns**.
	- Adds headers:
		- Just the label for **Started**
		- Label + count (e.g. `Completed (12)`) for the other statuses.
- Renders the result as a **kanban table** showing where each character article sits in your workflow.
- Relevant properties
	- **Started** (requires none to be checked)
	- **Current**
	- **Completed**
	- **Hiatus**
- File type: Wiki Alpha notes
	- [[Characters]]
	- [[Settings]]
	- [[Groups]]
	- [[History]]
	- [[Concepts]]
	- [[Objects]]
	  ![[wikiAlpha.png]]
## barStoryTale
- Used to count distribution of all the **Tales** in [[Statistics/Story|Story]]
- Can display a bar graph or pie chart 
- Steps
	- **Scans Files** - Finds all markdown files in the "Story" folder, excluding drafts
	- **Counts Words** - Reads each file and counts total words per tale (based on folder structure)
	- **Calculates Stats** - Determines percentages and sorts tales by word count
	- **Generates SVG** - Creates pie slices using math calculations for angles and positions
	- **Adds Interactivity** - Includes hover effects, tooltips, and percentage labels
	- **Renders Output** - Displays the complete pie chart with legend in your Obsidian note
- Relevant properties: Alpha
- Editable parameters
	- `type` - Chart visualization type
	- `title` - Custom chart title
	- `colors` - Array of hex colors
	- `radius` - Pie chart size
	- `barHeight` - Individual bar height
## barWikiTopic
- Used to count distribution of all the **Topics** in [[Statistics/Wiki|Wiki]]
- Can display a bar graph or pie chart
- Steps
	- **Scans Wiki Files** - Finds all markdown files in the "Wiki" folder
	- **Counts Words** - Reads each file and totals words per topic (based on folder structure)
	- **Processes Data** - Calculates percentages, sorts by word count, finds max values
	- **Chart Selection** - Chooses visualization type (pie, bar, or progress bar)
	- **Generates SVG/HTML** - Creates interactive charts with hover effects and tooltips
	- **Renders Output** - Displays the chart with title and total word count
- Editable parameters
	  - `type` - Chart visualization type
	  - `title` - Custom chart title
	  - `colors` - Array of hex colors
	  - `radius` - Pie chart size
	  - `barHeight` - Individual bar height
## barChapter
- Creates chart comparing **Chapter** size in each **Tale** in [[Statistics/Story|Story]]
- Can be a pie or bar chart
- Steps
	- **Scans All Folders** - Finds all markdown files in the specified folder
	- **Counts Words** - Reads each file and totals words for each section
	- **Calculates Proportions** - Determines percentages and total word count across both sections
	- **Chart Selection** - Chooses visualization type (pie, bar, or progress bar)
	- **Generates Visualization** - Creates interactive charts comparing Story vs Wiki content
	- **Renders Output** - Displays the chart with title and total word count
- Editable Parameters
	- `type` - Chart visualization type ("pie", "bar", or "progress")
	- `title` - Custom chart title
	- `colors` - Array of hex colors (only needs 2 colors for Story/Wiki)
	- `radius` - Pie chart size
	- `barHeight` - Individual bar height
## barProse
- Creates chart comparing **Total Prose Count** between **Story** and **Wiki** for [[Total Word Count]]
	- Counts only words inside scenes and articles without YAML
- Can be a pie or bar chart
- Steps
	- **Scans Two Folders** - Finds all markdown files in both "Story" and "Wiki" folders
	- **Counts Words** - Reads each file and totals words for each section (Story vs Wiki)
	- **Calculates Proportions** - Determines percentages and total word count across both sections
	- **Chart Selection** - Chooses visualization type (pie, bar, or progress bar)
	- **Generates Visualization** - Creates interactive charts comparing Story vs Wiki content
	- **Renders Output** - Displays the chart with title and total word count
- Editable Parameters
	- `type` - Chart visualization type ("pie", "bar", or "progress")
	- `title` - Custom chart title
	- `colors` - Array of hex colors (only needs 2 colors for Story/Wiki)
	- `radius` - Pie chart size
	- `barHeight` - Individual bar height
## barTotal
- Creates chart comparing **Total Word Count** between **Story** and **Wiki** for [[Total Word Count]]
- Can be a pie or bar chart
- Steps
	- **Scans Two Folders** - Finds all markdown files in both "Story" and "Wiki" folders
	- **Counts Words** - Reads each file and totals words for each section (Story vs Wiki)
	- **Calculates Proportions** - Determines percentages and total word count across both sections
	- **Chart Selection** - Chooses visualization type (pie, bar, or progress bar)
	- **Generates Visualization** - Creates interactive charts comparing Story vs Wiki content
	- **Renders Output** - Displays the chart with title and total word count
- Editable Parameters
	- `type` - Chart visualization type ("pie", "bar", or "progress")
	- `title` - Custom chart title
	- `colors` - Array of hex colors (only needs 2 colors for Story/Wiki)
	- `radius` - Pie chart size
	- `barHeight` - Individual bar height

# QuickAdd
Must be used as a Macro in Quickadd, then selected from the dropdown menu to activate it. 
## create-chapter-folder
- Creates **Chapter folder** in specified location with all template files, must also specify the Chapter #
- Steps
	- Starts in the `Story` folder and lists its **subfolders** (tales).
	- Lets the user pick which tale they want to add a chapter to.
	- Prompts for a **chapter number** (e.g., 3).
	- Creates a `Chapter X` folder inside the selected tale, if it doesn’t already exist.
	- Ensures a corresponding folder for **.base files** exists under `z_bases/story/TaleName`.
	- Copies all files from the template folder (`z_templates/chapter`) into the new chapter folder, with smart renaming:
		- `chapter.md` → `Chapter X.md`
		- `toc_x_y.base` → `toc_TaleName_ChapterNumber.base` (moved into the `z_bases` folder).
	-  Updates the `toc` reference inside the main chapter file so it points to the correct `.base` file.
	- Skips files that already exist, and shows a notice listing which ones were skipped.
	- Displays success and error notices throughout the process.
## generateOutline
- Used for **Scene** files, appends **Order** and **File Name** into corresponding **outline** note for the folder
- Steps
	- Finds the **latest note** in the vault.
	- Verifies it is tagged with `scene` and has a valid `Order` in its frontmatter.
	- Builds a **formatted outline entry** (`# Order. [[path|title]]`).
	- Ensures an `_outline.md` file exists in the same folder, creating it if necessary.
	- Appends the new scene entry to the **bottom of `_outline.md`**.
	- Provides notices for any missing frontmatter, invalid `Order`, or newly created `_outline.md`.
- Relevant Properties: **Order**
## generateSceneNext
- Used for **Scene** files, fills in the **Next** property for previously created file. 
- Steps
	- Finds the **most recently created note** in the vault.
	- Determines its **folder** and filters all files in that folder tagged with `scene`.
	- Sorts those scene files by creation date, newest first.
	- Ensures there are at least **two scene files** (so there is a “previous” scene to update).
	- Targets the **second-most recent scene** and reads its YAML frontmatter.
	- Updates or adds a `Next` field pointing to the **most recent scene** using a wiki link.
	- Saves the modified YAML back to the file.
	- Shows a notice confirming the update.
# Templater
Must be used directly in the body of the note with the format undefined
## Image Reference

> [!multi-column|center]
>
>> [!blank|center]
>> ![[scene.png|450]]
>
>> [!blank|center]
>> ![[note.png|500]]

> [!multi-column|center]
>
>> [!blank|center]
>> ![[outline.png|500]]
>
>> [!blank|center]
>> ![[chapter.png|500]]
## chapterLink
- Used in [[z_templates/chapter/_note|_note]], [[z_templates/chapter/_outline|_outline]], [[chapter]], and [[scene]] files under the *Chapter* YAML Property
- Generates a **wiki link to the chapter file** corresponding to the current note’s folder.
- Steps
	- Gets the **current note’s path** and splits it into folder parts.
	- Determines the **folder name** (assumed to match the chapter title).
	- Builds the path to the **chapter Markdown file** within that folder.
	- Returns a **quoted wiki link** with an alias matching the folder name, e.g., `"[[Story/Tale1/Chapter 1/Chapter 1.md|Chapter 1]]"`.
## chapterNext
- Used only in [[z_templates/chapter/_note|_note]] and [[z_templates/chapter/_outline|_outline]] files under the *Next* YAML Property
- Generates a **wiki link** to the [[z_templates/chapter/_note|_note]] and [[z_templates/chapter/_outline|_outline]] files in the **next chapter**
- Steps
	- Retrieves the **current note’s path** and splits it into folder parts.
	- Determines the **current chapter number** from the folder name (expects `Chapter X` format).
	- Calculates the **next chapter number**.
	- Builds the path to the **same filename in the next chapter folder**.
	- Returns a **quoted wiki link** pointing to that location, e.g., `"[[Story/Tale1/Chapter 2/NoteName|Link]]"`.
## chapterNext1
- Used ONLY in the [[chapter]] file under the *Next* YAML property
- Generates a **wiki link** to the **next** [[chapter]] of a story
- Steps
	- Retrieves the **current note’s path** and splits it into folder parts.
	- Extracts the **story name** and **current chapter number** from the folder.
	- Calculates the **next chapter number**.
	- Builds the path to the **next chapter’s main file** (assumes it is named like `Chapter X.md`).
	- Returns a **quoted wiki link** pointing to the next chapter, e.g., `"[[Story/Tale1/Chapter 3/Chapter 3|Chapter 3]]"`.
## chapterOrder
- Used in [[z_templates/chapter/_note|_note]], [[z_templates/chapter/_outline|_outline]], and [[chapter]] files under the *Chapter* YAML Property
- Extracts the **chapter number** from the current note’s folder name.
- Steps
	- Gets the **vault-relative path** of the current note.
	- Determines the **folder name** containing the note.
	- Uses a **regex** to find a number in the format `Chapter X`.
	- Returns the **chapter number** as an integer, or `0` if no number is found.
## chapterPrevious
- Used only in [[z_templates/chapter/_note|_note]] and [[z_templates/chapter/_outline|_outline]] files under the *Next* YAML Property
- Generates a **wiki link** to the [[z_templates/chapter/_note|_note]] and [[z_templates/chapter/_outline|_outline]] files in the **previous chapter**
- Steps
	- Retrieves the **current note’s path** and splits it into folder parts.
	- Determines the **current chapter number** from the folder name (expects `Chapter X` format).
	- Calculates the **previous chapter number**.
	- Builds the path to the **same filename in the previous chapter folder**.
	- Returns a **quoted wiki link** pointing to that location, e.g., `"[[Story/Tale1/Chapter 2/NoteName|Link]]"`.
## chapterPrevious1
- Used ONLY in the [[chapter]] file under the *Next* YAML property
- Generates a **wiki link** to the **previous** [[chapter]] of a story
- Steps
	- Retrieves the **current note’s path** and splits it into folder parts.
	- Extracts the **story name** and **current chapter number** from the folder.
	- Calculates the **previous chapter number**.
	- Builds the path to the **previous chapter’s main file** (assumes it is named like `Chapter X.md`).
	- Returns a **quoted wiki link** pointing to the previous chapter, e.g., `"[[Story/Tale1/Chapter 3/Chapter 3|Chapter 3]]"`.
## storyName
- Used ONLY in [[scene]] files under the *Story* YAML property
- Generates a **wiki link to the Story folder** of the current note.
- Steps
	- Gets the **vault-relative path** of the current note.
	- Extracts the **story name** (assumes it’s the second folder in the path, e.g., `Story/Tale1/...`).
	- Returns a **quoted wiki link** to the story, e.g., `"[[Tale1]]"`.
	- Includes a **safety fallback** returning an empty link if the path is unexpectedly short.
## storyOrder
- Used ONLY in [[scene]] files under the *Order* YAML property
- Calculates the **next “Order” number** for a new scene note within the current folder.
- Steps
	- Retrieves the **current note’s folder** and all Markdown files in the vault.
	- Filters files to only those in the **same folder** that are tagged `scene`.
    - Reads the **Order** property from each scene’s frontmatter.
    - Determines the **highest existing Order number**.
    - Returns the **next available Order number** (highest + 1).
## storyPrevious
- Used ONLY in [[scene]] files under the *Previous* YAML property
- Generates a **wiki link to the second most recently created scene** in the current folder.
- See [[Snippet Compendium#QuickAdd#generateSceneNext|generateSceneNext]] for filling in the *Next* YAML property 
## generateSynopsis
- Used ONLY in [[scene]] files under the *Synopsis* YAML property
- Generates a **quoted Obsidian link to the most recent scene’s entry in the `_outline` file** for its folder.
- Steps
	- Retrieves all **scene-tagged files** in the vault.
    - Finds the **most recently created scene** overall.
    - Filters scenes to only those in the **same folder** as the most recent file.
    - Determines the **Order** of the most recent scene within its folder.
    - Constructs a **header reference** in the corresponding `_outline` file.
    - Returns a **double-quoted wiki link** pointing to that header (`[[path#header|Link]]`).