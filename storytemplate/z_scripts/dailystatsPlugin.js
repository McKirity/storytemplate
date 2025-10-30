import { App, Plugin, PluginSettingTab, Setting, TFile, Notice, WorkspaceLeaf } from 'obsidian';

interface NovelTrackerSettings {
	chapterFolders: string[];
	trackingFile: string;
	excludePatterns: string[];
	autoSave: boolean;
	autoSaveInterval: number;
}

const DEFAULT_SETTINGS: NovelTrackerSettings = {
	chapterFolders: ['Chapters', 'Manuscript'],
	trackingFile: 'Novel Statistics.md',
	excludePatterns: ['template', 'Template', 'draft'],
	autoSave: true,
	autoSaveInterval: 30000 // 30 seconds
}

interface DayStats {
	date: string;
	totalWords: number;
	dailyChange: number;
	chaptersModified: string[];
}

interface WeekStats {
	weekStart: string;
	totalWords: number;
	wordsAdded: number;
}

interface MonthStats {
	month: string;
	totalWords: number;
	wordsAdded: number;
}

interface StreakData {
	currentStreak: number;
	longestStreak: number;
	lastWritingDate: string;
}

export default class NovelTrackerPlugin extends Plugin {
	settings: NovelTrackerSettings;
	dailyStats: Map<string, DayStats> = new Map();
	autoSaveTimer: NodeJS.Timer;
	lastTotalWords = 0;

	async onload() {
		await this.loadSettings();

		// Load existing data
		await this.loadTrackingData();

		// Initial scan
		await this.scanAndUpdate();

		// Set up file modification listener
		this.registerEvent(
			this.app.vault.on('modify', async (file: TFile) => {
				if (this.isChapterFile(file)) {
					await this.onFileModified(file);
				}
			})
		);

		// Auto-save timer
		if (this.settings.autoSave) {
			this.startAutoSave();
		}

		// Add ribbon icon
		this.addRibbonIcon('book-open', 'Novel Tracker', async () => {
			await this.showStats();
		});

		// Add commands
		this.addCommand({
			id: 'show-novel-stats',
			name: 'Show Novel Statistics',
			callback: async () => await this.showStats()
		});

		this.addCommand({
			id: 'rescan-chapters',
			name: 'Rescan All Chapters',
			callback: async () => await this.scanAndUpdate()
		});

		// Add settings tab
		this.addSettingTab(new NovelTrackerSettingTab(this.app, this));
	}

	onunload() {
		if (this.autoSaveTimer) {
			clearInterval(this.autoSaveTimer);
		}
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		
		// Restart auto-save if settings changed
		if (this.autoSaveTimer) {
			clearInterval(this.autoSaveTimer);
		}
		if (this.settings.autoSave) {
			this.startAutoSave();
		}
	}

	startAutoSave() {
		this.autoSaveTimer = setInterval(async () => {
			await this.saveTrackingData();
		}, this.settings.autoSaveInterval);
	}

	isChapterFile(file: TFile): boolean {
		// Check if file is in one of the specified chapter folders
		const isInFolder = this.settings.chapterFolders.some(folder => 
			file.path.startsWith(folder + '/') || file.path === folder
		);
		
		if (!isInFolder) return false;

		// Check exclude patterns
		const isExcluded = this.settings.excludePatterns.some(pattern =>
			file.name.toLowerCase().includes(pattern.toLowerCase())
		);

		return !isExcluded && file.extension === 'md';
	}

	async onFileModified(file: TFile) {
		const today = new Date().toISOString().split('T')[0];
		await this.updateDailyStats(today);
	}

	async scanAndUpdate() {
		const today = new Date().toISOString().split('T')[0];
		await this.updateDailyStats(today);
		new Notice('Novel statistics updated!');
	}

	async updateDailyStats(date: string) {
		const chapterFiles = this.app.vault.getMarkdownFiles()
			.filter(file => this.isChapterFile(file));

		let totalWords = 0;
		const modifiedChapters: string[] = [];

		for (const file of chapterFiles) {
			const content = await this.app.vault.read(file);
			const wordCount = this.countWords(content);
			totalWords += wordCount;

			// Check if this file was modified today
			if (this.wasModifiedToday(file)) {
				modifiedChapters.push(file.basename);
			}
		}

		const dailyChange = totalWords - this.lastTotalWords;
		
		const dayStats: DayStats = {
			date,
			totalWords,
			dailyChange: this.dailyStats.has(date) ? 
				totalWords - (this.dailyStats.get(date)?.totalWords || this.lastTotalWords) : 
				dailyChange,
			chaptersModified: modifiedChapters
		};

		this.dailyStats.set(date, dayStats);
		this.lastTotalWords = totalWords;
	}

	countWords(content: string): number {
		// Remove markdown formatting and count words
		const cleanContent = content
			.replace(/#{1,6}\s+/g, '') // Remove headers
			.replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1') // Remove bold/italic
			.replace(/`([^`]+)`/g, '$1') // Remove inline code
			.replace(/```[\s\S]*?```/g, '') // Remove code blocks
			.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
			.replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // Remove images
			.trim();

		if (!cleanContent) return 0;
		
		return cleanContent.split(/\s+/).filter(word => word.length > 0).length;
	}

	wasModifiedToday(file: TFile): boolean {
		const today = new Date();
		const fileModified = new Date(file.stat.mtime);
		return fileModified.toDateString() === today.toDateString();
	}

	calculateWeeklyStats(): WeekStats[] {
		const weeks = new Map<string, WeekStats>();
		
		for (const [date, stats] of this.dailyStats) {
			const weekStart = this.getWeekStart(new Date(date));
			const weekKey = weekStart.toISOString().split('T')[0];
			
			if (!weeks.has(weekKey)) {
				weeks.set(weekKey, {
					weekStart: weekKey,
					totalWords: stats.totalWords,
					wordsAdded: 0
				});
			}
			
			const weekStats = weeks.get(weekKey)!;
			weekStats.wordsAdded += Math.max(0, stats.dailyChange);
			weekStats.totalWords = Math.max(weekStats.totalWords, stats.totalWords);
		}
		
		return Array.from(weeks.values()).sort((a, b) => 
			new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
		);
	}

	calculateMonthlyStats(): MonthStats[] {
		const months = new Map<string, MonthStats>();
		
		for (const [date, stats] of this.dailyStats) {
			const monthKey = date.substring(0, 7); // YYYY-MM
			
			if (!months.has(monthKey)) {
				months.set(monthKey, {
					month: monthKey,
					totalWords: stats.totalWords,
					wordsAdded: 0
				});
			}
			
			const monthStats = months.get(monthKey)!;
			monthStats.wordsAdded += Math.max(0, stats.dailyChange);
			monthStats.totalWords = Math.max(monthStats.totalWords, stats.totalWords);
		}
		
		return Array.from(months.values()).sort((a, b) => b.month.localeCompare(a.month));
	}

	calculateStreaks(): StreakData {
		const sortedDates = Array.from(this.dailyStats.keys())
			.filter(date => this.dailyStats.get(date)!.dailyChange > 0)
			.sort();

		let currentStreak = 0;
		let longestStreak = 0;
		let tempStreak = 0;
		let lastDate: Date | null = null;

		for (const dateStr of sortedDates) {
			const date = new Date(dateStr);
			
			if (lastDate && this.daysBetween(lastDate, date) === 1) {
				tempStreak++;
			} else {
				tempStreak = 1;
			}
			
			longestStreak = Math.max(longestStreak, tempStreak);
			lastDate = date;
		}

		// Calculate current streak from today backwards
		const today = new Date();
		const todayStr = today.toISOString().split('T')[0];
		
		if (this.dailyStats.has(todayStr) && this.dailyStats.get(todayStr)!.dailyChange > 0) {
			currentStreak = 1;
			let checkDate = new Date(today);
			checkDate.setDate(checkDate.getDate() - 1);
			
			while (true) {
				const checkDateStr = checkDate.toISOString().split('T')[0];
				if (this.dailyStats.has(checkDateStr) && this.dailyStats.get(checkDateStr)!.dailyChange > 0) {
					currentStreak++;
					checkDate.setDate(checkDate.getDate() - 1);
				} else {
					break;
				}
			}
		}

		return {
			currentStreak,
			longestStreak,
			lastWritingDate: sortedDates[sortedDates.length - 1] || ''
		};
	}

	getWeekStart(date: Date): Date {
		const day = date.getDay();
		const diff = date.getDate() - day;
		return new Date(date.setDate(diff));
	}

	daysBetween(date1: Date, date2: Date): number {
		const oneDay = 24 * 60 * 60 * 1000;
		return Math.round((date2.getTime() - date1.getTime()) / oneDay);
	}

	async showStats() {
		const weeklyStats = this.calculateWeeklyStats();
		const monthlyStats = this.calculateMonthlyStats();
		const streaks = this.calculateStreaks();
		const today = new Date().toISOString().split('T')[0];
		const todayStats = this.dailyStats.get(today);

		let statsContent = `# Novel Writing Statistics\n\n`;
		statsContent += `*Last updated: ${new Date().toLocaleString()}*\n\n`;

		// Current stats
		statsContent += `## Current Progress\n\n`;
		if (todayStats) {
			statsContent += `**Today's Words:** ${todayStats.dailyChange >= 0 ? '+' : ''}${todayStats.dailyChange}\n`;
			statsContent += `**Total Words:** ${todayStats.totalWords.toLocaleString()}\n`;
		}
		statsContent += `**Current Streak:** ${streaks.currentStreak} days\n`;
		statsContent += `**Longest Streak:** ${streaks.longestStreak} days\n\n`;

		// Weekly stats
		if (weeklyStats.length > 0) {
			statsContent += `## Weekly Progress\n\n`;
			statsContent += `| Week Starting | Words Added | Total Words |\n`;
			statsContent += `|---|---|---|\n`;
			weeklyStats.slice(0, 8).forEach(week => {
				statsContent += `| ${week.weekStart} | +${week.wordsAdded.toLocaleString()} | ${week.totalWords.toLocaleString()} |\n`;
			});
			statsContent += `\n`;
		}

		// Monthly stats
		if (monthlyStats.length > 0) {
			statsContent += `## Monthly Progress\n\n`;
			statsContent += `| Month | Words Added | Total Words |\n`;
			statsContent += `|---|---|---|\n`;
			monthlyStats.slice(0, 12).forEach(month => {
				statsContent += `| ${month.month} | +${month.wordsAdded.toLocaleString()} | ${month.totalWords.toLocaleString()} |\n`;
			});
			statsContent += `\n`;
		}

		// Recent daily activity
		const recentDays = Array.from(this.dailyStats.entries())
			.sort((a, b) => b[0].localeCompare(a[0]))
			.slice(0, 14);

		if (recentDays.length > 0) {
			statsContent += `## Recent Daily Activity\n\n`;
			statsContent += `| Date | Daily Change | Total Words | Chapters Modified |\n`;
			statsContent += `|---|---|---|---|\n`;
			recentDays.forEach(([date, stats]) => {
				const changeStr = stats.dailyChange >= 0 ? `+${stats.dailyChange}` : `${stats.dailyChange}`;
				const chapters = stats.chaptersModified.length > 0 ? stats.chaptersModified.join(', ') : '-';
				statsContent += `| ${date} | ${changeStr} | ${stats.totalWords.toLocaleString()} | ${chapters} |\n`;
			});
		}

		// Write to tracking file
		await this.app.vault.adapter.write(this.settings.trackingFile, statsContent);
		
		// Open the file
		const file = this.app.vault.getAbstractFileByPath(this.settings.trackingFile);
		if (file instanceof TFile) {
			const leaf = this.app.workspace.getLeaf(false);
			await leaf.openFile(file);
		}
	}

	async loadTrackingData() {
		// Try to load existing data from a JSON file
		const dataFile = '.novel-tracker-data.json';
		try {
			const data = await this.app.vault.adapter.read(dataFile);
			const parsed = JSON.parse(data);
			this.dailyStats = new Map(parsed.dailyStats || []);
			this.lastTotalWords = parsed.lastTotalWords || 0;
		} catch (error) {
			// File doesn't exist or is corrupted, start fresh
			this.dailyStats = new Map();
			this.lastTotalWords = 0;
		}
	}

	async saveTrackingData() {
		const dataFile = '.novel-tracker-data.json';
		const data = {
			dailyStats: Array.from(this.dailyStats.entries()),
			lastTotalWords: this.lastTotalWords
		};
		await this.app.vault.adapter.write(dataFile, JSON.stringify(data, null, 2));
	}
}

class NovelTrackerSettingTab extends PluginSettingTab {
	plugin: NovelTrackerPlugin;

	constructor(app: App, plugin: NovelTrackerPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl('h2', { text: 'Novel Tracker Settings' });

		new Setting(containerEl)
			.setName('Chapter folders')
			.setDesc('Folders containing your chapter files (one per line)')
			.addTextArea(text => text
				.setPlaceholder('Chapters\nManuscript\nNovel')
				.setValue(this.plugin.settings.chapterFolders.join('\n'))
				.onChange(async (value) => {
					this.plugin.settings.chapterFolders = value
						.split('\n')
						.map(line => line.trim())
						.filter(line => line.length > 0);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Statistics file')
			.setDesc('File where statistics will be displayed')
			.addText(text => text
				.setPlaceholder('Novel Statistics.md')
				.setValue(this.plugin.settings.trackingFile)
				.onChange(async (value) => {
					this.plugin.settings.trackingFile = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Exclude patterns')
			.setDesc('Files containing these terms will be ignored (one per line)')
			.addTextArea(text => text
				.setPlaceholder('template\ndraft\noutline')
				.setValue(this.plugin.settings.excludePatterns.join('\n'))
				.onChange(async (value) => {
					this.plugin.settings.excludePatterns = value
						.split('\n')
						.map(line => line.trim())
						.filter(line => line.length > 0);
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Auto-save tracking data')
			.setDesc('Automatically save progress data')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.autoSave)
				.onChange(async (value) => {
					this.plugin.settings.autoSave = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Auto-save interval')
			.setDesc('How often to save data (in seconds)')
			.addSlider(slider => slider
				.setLimits(10, 300, 10)
				.setValue(this.plugin.settings.autoSaveInterval / 1000)
				.setDynamicTooltip()
				.onChange(async (value) => {
					this.plugin.settings.autoSaveInterval = value * 1000;
					await this.plugin.saveSettings();
				}));
	}
}