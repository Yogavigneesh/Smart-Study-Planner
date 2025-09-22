// ===== LOCAL STORAGE MANAGEMENT FOR SMART STUDY PLANNER ===== //

class LocalStorageManager {
    constructor() {
        this.storageKeys = {
            studyPlans: 'studyPlans',
            appSettings: 'appSettings',
            userProfile: 'userProfile',
            studyStats: 'studyStats',
            notifications: 'notifications',
            backupData: 'backupData',
            appVersion: 'appVersion'
        };
        
        this.currentVersion = '1.0.0';
        this.maxBackupCount = 5;
        
        this.init();
    }

    // Initialize storage manager
    init() {
        this.checkStorageSupport();
        this.performMigration();
        this.scheduleCleanup();
        console.log('LocalStorage Manager initialized');
    }

    // Check if localStorage is supported
    checkStorageSupport() {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.error('LocalStorage not supported:', e);
            this.showFallbackMessage();
            return false;
        }
    }

    // Show fallback message for unsupported browsers
    showFallbackMessage() {
        if (window.studyApp) {
            window.studyApp.showNotification(
                'Your browser doesn\'t support local storage. Data won\'t be saved.',
                'warning'
            );
        }
    }

    // ===== STUDY PLANS MANAGEMENT ===== //

    // Save study plans
    saveStudyPlans(plans) {
        try {
            const dataToSave = {
                version: this.currentVersion,
                timestamp: new Date().toISOString(),
                count: plans.length,
                data: plans
            };
            
            localStorage.setItem(this.storageKeys.studyPlans, JSON.stringify(dataToSave));
            console.log(`Saved ${plans.length} study plans to localStorage`);
            
            // Create backup
            this.createBackup('studyPlans', dataToSave);
            
            return true;
        } catch (error) {
            console.error('Error saving study plans:', error);
            this.handleStorageError(error);
            return false;
        }
    }

    // Load study plans
    loadStudyPlans() {
        try {
            const savedData = localStorage.getItem(this.storageKeys.studyPlans);
            
            if (!savedData) {
                console.log('No study plans found in localStorage');
                return [];
            }
            
            const parsedData = JSON.parse(savedData);
            
            // Handle different data formats for backward compatibility
            if (Array.isArray(parsedData)) {
                // Old format - just an array
                console.log('Converting old format study plans');
                return this.validateStudyPlans(parsedData);
            } else if (parsedData.data && Array.isArray(parsedData.data)) {
                // New format - wrapped with metadata
                console.log(`Loaded ${parsedData.count} study plans from localStorage`);
                return this.validateStudyPlans(parsedData.data);
            }
            
            console.warn('Invalid study plans data format');
            return [];
            
        } catch (error) {
            console.error('Error loading study plans:', error);
            return this.attemptDataRecovery('studyPlans');
        }
    }

    // Validate and sanitize study plans
    validateStudyPlans(plans) {
        if (!Array.isArray(plans)) return [];
        
        return plans.filter(plan => {
            // Check required fields
            if (!plan.id || !plan.title) {
                console.warn('Invalid plan found:', plan);
                return false;
            }
            
            // Sanitize data
            plan.title = this.sanitizeString(plan.title);
            plan.description = this.sanitizeString(plan.description || '');
            plan.status = plan.status || 'active';
            plan.priority = plan.priority || 'medium';
            plan.progress = Math.max(0, Math.min(100, plan.progress || 0));
            
            // Validate dates
            if (plan.deadline && !this.isValidDate(plan.deadline)) {
                plan.deadline = null;
            }
            
            if (plan.startDate && !this.isValidDate(plan.startDate)) {
                plan.startDate = null;
            }
            
            // Validate tasks
            if (plan.tasks && Array.isArray(plan.tasks)) {
                plan.tasks = this.validateTasks(plan.tasks);
            } else {
                plan.tasks = [];
            }
            
            return true;
        });
    }

    // Validate tasks within a study plan
    validateTasks(tasks) {
        return tasks.filter(task => {
            if (!task.id || !task.title) return false;
            
            task.title = this.sanitizeString(task.title);
            task.description = this.sanitizeString(task.description || '');
            task.completed = Boolean(task.completed);
            task.estimatedHours = Math.max(0, task.estimatedHours || 1);
            task.difficulty = task.difficulty || 'medium';
            
            return true;
        });
    }

    // ===== APP SETTINGS MANAGEMENT ===== //

    // Save app settings
    saveSettings(settings) {
        try {
            const defaultSettings = {
                notifications: true,
                theme: 'light',
                defaultPriority: 'medium',
                reminderTime: 24,
                autoSave: true,
                soundEnabled: true,
                language: 'en'
            };
            
            const mergedSettings = { ...defaultSettings, ...settings };
            
            const dataToSave = {
                version: this.currentVersion,
                timestamp: new Date().toISOString(),
                data: mergedSettings
            };
            
            localStorage.setItem(this.storageKeys.appSettings, JSON.stringify(dataToSave));
            console.log('App settings saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving app settings:', error);
            this.handleStorageError(error);
            return false;
        }
    }

    // Load app settings
    loadSettings() {
        try {
            const savedData = localStorage.getItem(this.storageKeys.appSettings);
            
            if (!savedData) {
                console.log('No settings found, using defaults');
                return this.getDefaultSettings();
            }
            
            const parsedData = JSON.parse(savedData);
            
            if (parsedData.data) {
                console.log('Settings loaded successfully');
                return { ...this.getDefaultSettings(), ...parsedData.data };
            }
            
            // Fallback for old format
            return { ...this.getDefaultSettings(), ...parsedData };
            
        } catch (error) {
            console.error('Error loading settings:', error);
            return this.getDefaultSettings();
        }
    }

    // Get default settings
    getDefaultSettings() {
        return {
            notifications: true,
            theme: 'light',
            defaultPriority: 'medium',
            reminderTime: 24,
            autoSave: true,
            soundEnabled: true,
            language: 'en'
        };
    }

    // ===== USER PROFILE MANAGEMENT ===== //

    // Save user profile
    saveUserProfile(profile) {
        try {
            const dataToSave = {
                version: this.currentVersion,
                timestamp: new Date().toISOString(),
                data: this.sanitizeProfile(profile)
            };
            
            localStorage.setItem(this.storageKeys.userProfile, JSON.stringify(dataToSave));
            console.log('User profile saved successfully');
            return true;
        } catch (error) {
            console.error('Error saving user profile:', error);
            return false;
        }
    }

    // Load user profile
    loadUserProfile() {
        try {
            const savedData = localStorage.getItem(this.storageKeys.userProfile);
            
            if (!savedData) {
                return this.getDefaultProfile();
            }
            
            const parsedData = JSON.parse(savedData);
            return parsedData.data || this.getDefaultProfile();
            
        } catch (error) {
            console.error('Error loading user profile:', error);
            return this.getDefaultProfile();
        }
    }

    // Get default user profile
    getDefaultProfile() {
        return {
            name: '',
            email: '',
            studyGoals: [],
            preferredSubjects: [],
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            joinedDate: new Date().toISOString()
        };
    }

    // Sanitize user profile data
    sanitizeProfile(profile) {
        return {
            name: this.sanitizeString(profile.name || ''),
            email: this.sanitizeString(profile.email || ''),
            studyGoals: Array.isArray(profile.studyGoals) ? profile.studyGoals : [],
            preferredSubjects: Array.isArray(profile.preferredSubjects) ? profile.preferredSubjects : [],
            timezone: profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            joinedDate: profile.joinedDate || new Date().toISOString()
        };
    }

    // ===== STUDY STATISTICS MANAGEMENT ===== //

    // Save study statistics
    saveStudyStats(stats) {
        try {
            const dataToSave = {
                version: this.currentVersion,
                timestamp: new Date().toISOString(),
                data: stats
            };
            
            localStorage.setItem(this.storageKeys.studyStats, JSON.stringify(dataToSave));
            return true;
        } catch (error) {
            console.error('Error saving study stats:', error);
            return false;
        }
    }

    // Load study statistics
    loadStudyStats() {
        try {
            const savedData = localStorage.getItem(this.storageKeys.studyStats);
            
            if (!savedData) {
                return this.getDefaultStats();
            }
            
            const parsedData = JSON.parse(savedData);
            return parsedData.data || this.getDefaultStats();
            
        } catch (error) {
            console.error('Error loading study stats:', error);
            return this.getDefaultStats();
        }
    }

    // Get default statistics
    getDefaultStats() {
        return {
            totalStudyTime: 0,
            completedPlans: 0,
            totalTasks: 0,
            completedTasks: 0,
            weeklyProgress: [],
            monthlyProgress: [],
            subjectStats: {},
            lastUpdated: new Date().toISOString()
        };
    }

    // ===== BACKUP AND RECOVERY ===== //

    // Create backup of data
    createBackup(dataType, data) {
        try {
            const backupKey = `${this.storageKeys.backupData}_${dataType}`;
            let backups = this.loadBackups(dataType);
            
            // Add new backup
            backups.unshift({
                timestamp: new Date().toISOString(),
                data: data
            });
            
            // Limit backup count
            if (backups.length > this.maxBackupCount) {
                backups = backups.slice(0, this.maxBackupCount);
            }
            
            localStorage.setItem(backupKey, JSON.stringify(backups));
            console.log(`Backup created for ${dataType}`);
            
        } catch (error) {
            console.error('Error creating backup:', error);
        }
    }

    // Load backups for a data type
    loadBackups(dataType) {
        try {
            const backupKey = `${this.storageKeys.backupData}_${dataType}`;
            const savedBackups = localStorage.getItem(backupKey);
            
            if (!savedBackups) return [];
            
            return JSON.parse(savedBackups);
        } catch (error) {
            console.error('Error loading backups:', error);
            return [];
        }
    }

    // Attempt data recovery from backups
    attemptDataRecovery(dataType) {
        console.log(`Attempting data recovery for ${dataType}`);
        
        try {
            const backups = this.loadBackups(dataType);
            
            if (backups.length > 0) {
                const latestBackup = backups[0];
                console.log('Recovery successful from backup:', latestBackup.timestamp);
                
                if (window.studyApp) {
                    window.studyApp.showNotification(
                        'Data recovered from backup!',
                        'success'
                    );
                }
                
                return latestBackup.data.data || latestBackup.data;
            }
        } catch (error) {
            console.error('Error during data recovery:', error);
        }
        
        console.log('No backup found for recovery');
        if (window.studyApp) {
            window.studyApp.showNotification(
                'Unable to recover data. Starting fresh.',
                'warning'
            );
        }
        
        return dataType === 'studyPlans' ? [] : {};
    }

    // ===== UTILITY FUNCTIONS ===== //

    // Sanitize string input
    sanitizeString(str) {
        if (typeof str !== 'string') return '';
        return str.trim().replace(/[<>]/g, '');
    }

    // Validate date string
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    // Handle storage errors
    handleStorageError(error) {
        if (error.name === 'QuotaExceededError') {
            console.error('Storage quota exceeded');
            if (window.studyApp) {
                window.studyApp.showNotification(
                    'Storage limit reached. Please clear some data.',
                    'error'
                );
            }
            this.handleStorageCleanup();
        } else {
            console.error('Storage error:', error);
            if (window.studyApp) {
                window.studyApp.showNotification(
                    'Error saving data. Please try again.',
                    'error'
                );
            }
        }
    }

    // Handle storage cleanup when quota exceeded
    handleStorageCleanup() {
        try {
            // Remove old backups first
            Object.values(this.storageKeys).forEach(key => {
                if (key.includes('backup')) {
                    localStorage.removeItem(key);
                }
            });
            
            console.log('Storage cleanup completed');
            if (window.studyApp) {
                window.studyApp.showNotification(
                    'Storage cleaned up. Please try saving again.',
                    'info'
                );
            }
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    // ===== DATA IMPORT/EXPORT ===== //

    // Export all data
    exportData() {
        try {
            const exportData = {
                version: this.currentVersion,
                exportDate: new Date().toISOString(),
                studyPlans: this.loadStudyPlans(),
                settings: this.loadSettings(),
                userProfile: this.loadUserProfile(),
                studyStats: this.loadStudyStats()
            };
            
            const dataBlob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `study-planner-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            
            if (window.studyApp) {
                window.studyApp.showNotification(
                    'Data exported successfully!',
                    'success'
                );
            }
            
            return true;
        } catch (error) {
            console.error('Error exporting data:', error);
            if (window.studyApp) {
                window.studyApp.showNotification(
                    'Error exporting data',
                    'error'
                );
            }
            return false;
        }
    }

    // Import data from file
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    // Validate import data
                    if (!this.validateImportData(importData)) {
                        reject(new Error('Invalid import data format'));
                        return;
                    }
                    
                    // Import data
                    if (importData.studyPlans) {
                        this.saveStudyPlans(importData.studyPlans);
                    }
                    
                    if (importData.settings) {
                        this.saveSettings(importData.settings);
                    }
                    
                    if (importData.userProfile) {
                        this.saveUserProfile(importData.userProfile);
                    }
                    
                    if (importData.studyStats) {
                        this.saveStudyStats(importData.studyStats);
                    }
                    
                    if (window.studyApp) {
                        window.studyApp.showNotification(
                            'Data imported successfully!',
                            'success'
                        );
                    }
                    
                    resolve(importData);
                } catch (error) {
                    console.error('Error importing data:', error);
                    if (window.studyApp) {
                        window.studyApp.showNotification(
                            'Error importing data. Please check file format.',
                            'error'
                        );
                    }
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Error reading file'));
            };
            
            reader.readAsText(file);
        });
    }

    // Validate import data structure
    validateImportData(data) {
        if (!data || typeof data !== 'object') return false;
        
        // Check version compatibility
        if (data.version && data.version !== this.currentVersion) {
            console.warn('Version mismatch in import data');
        }
        
        // Validate study plans if present
        if (data.studyPlans && !Array.isArray(data.studyPlans)) {
            return false;
        }
        
        return true;
    }

    // ===== MAINTENANCE FUNCTIONS ===== //

    // Perform data migration if needed
    performMigration() {
        const currentVersion = localStorage.getItem(this.storageKeys.appVersion);
        
        if (!currentVersion || currentVersion !== this.currentVersion) {
            console.log('Performing data migration...');
            this.migrateData(currentVersion);
            localStorage.setItem(this.storageKeys.appVersion, this.currentVersion);
        }
    }

    // Migrate data between versions
    migrateData(fromVersion) {
        try {
            // Migration logic for different versions
            switch (fromVersion) {
                case null:
                    // First time setup
                    console.log('First time setup - no migration needed');
                    break;
                default:
                    console.log('No specific migration needed');
            }
        } catch (error) {
            console.error('Error during migration:', error);
        }
    }

    // Schedule periodic cleanup
    scheduleCleanup() {
        // Clean up old data every time the app loads
        this.performCleanup();
        
        // Set up periodic cleanup (every hour)
        setInterval(() => {
            this.performCleanup();
        }, 60 * 60 * 1000);
    }

    // Perform cleanup of old data
    performCleanup() {
        try {
            // Clean up old backups (keep only recent ones)
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith(this.storageKeys.backupData)) {
                    const backups = JSON.parse(localStorage.getItem(key) || '[]');
                    if (backups.length > this.maxBackupCount) {
                        const trimmedBackups = backups.slice(0, this.maxBackupCount);
                        localStorage.setItem(key, JSON.stringify(trimmedBackups));
                    }
                }
            });
            
            console.log('Cleanup completed');
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }

    // Get storage usage statistics
    getStorageStats() {
        const stats = {
            totalSize: 0,
            itemCount: 0,
            items: {}
        };
        
        try {
            Object.keys(localStorage).forEach(key => {
                const value = localStorage.getItem(key);
                const size = new Blob([value]).size;
                stats.totalSize += size;
                stats.itemCount++;
                stats.items[key] = {
                    size: size,
                    sizeFormatted: this.formatBytes(size)
                };
            });
            
            stats.totalSizeFormatted = this.formatBytes(stats.totalSize);
            return stats;
        } catch (error) {
            console.error('Error getting storage stats:', error);
            return stats;
        }
    }

    // Format bytes for display
    formatBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Clear all data (for reset functionality)
    clearAllData() {
        try {
            Object.values(this.storageKeys).forEach(key => {
                localStorage.removeItem(key);
            });
            
            // Also clear any backup data
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('backup_') || key.startsWith('studyPlanner_')) {
                    localStorage.removeItem(key);
                }
            });
            
            console.log('All data cleared');
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }
}

// Create global instance
window.storageManager = new LocalStorageManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocalStorageManager;
}
