// ===== NOTIFICATIONS SYSTEM FOR SMART STUDY PLANNER ===== //

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.scheduledReminders = new Map();
        this.notificationQueue = [];
        this.isProcessingQueue = false;
        this.settings = {
            enableBrowserNotifications: true,
            enableSounds: true,
            quietHours: {
                enabled: false,
                start: 22, // 10 PM
                end: 8     // 8 AM
            },
            reminderTypes: {
                deadline: true,
                daily: true,
                milestone: true,
                encouragement: true
            }
        };
        
        this.init();
    }

    // Initialize notification manager
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.setupPeriodicChecks();
        this.requestNotificationPermission();
        console.log('Notification Manager initialized');
    }

    // Load notification settings
    loadSettings() {
        if (window.storageManager) {
            const savedSettings = window.storageManager.loadSettings();
            this.settings = { ...this.settings, ...savedSettings.notifications };
        }
    }

    // Save notification settings
    saveSettings() {
        if (window.storageManager) {
            const currentSettings = window.storageManager.loadSettings();
            currentSettings.notifications = this.settings;
            window.storageManager.saveSettings(currentSettings);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Listen for plan creation to schedule reminders
        document.addEventListener('planCreated', (e) => {
            this.schedulePlanReminders(e.detail.plan);
        });

        // Listen for plan updates to reschedule reminders
        document.addEventListener('planUpdated', (e) => {
            this.updatePlanReminders(e.detail.plan);
        });

        // Listen for plan deletion to cancel reminders
        document.addEventListener('planDeleted', (e) => {
            this.cancelPlanReminders(e.detail.plan.id);
        });

        // Listen for task completion for encouragement notifications
        document.addEventListener('taskCompleted', (e) => {
            this.handleTaskCompletion(e.detail);
        });

        // Listen for milestone achievements
        document.addEventListener('milestoneAchieved', (e) => {
            this.handleMilestoneAchievement(e.detail);
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseInAppNotifications();
            } else {
                this.resumeInAppNotifications();
            }
        });
    }

    // Request notification permission
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.log('Browser does not support notifications');
            this.settings.enableBrowserNotifications = false;
            return false;
        }

        if (Notification.permission === 'default') {
            try {
                const permission = await Notification.requestPermission();
                this.settings.enableBrowserNotifications = permission === 'granted';
                this.saveSettings();
                
                if (permission === 'granted') {
                    this.showInAppNotification(
                        'Notifications enabled! You\'ll receive study reminders.',
                        'success'
                    );
                } else {
                    this.showInAppNotification(
                        'Notifications disabled. Enable them in settings to get reminders.',
                        'info'
                    );
                }
                
                return permission === 'granted';
            } catch (error) {
                console.error('Error requesting notification permission:', error);
                return false;
            }
        }

        return Notification.permission === 'granted';
    }

    // ===== REMINDER SCHEDULING ===== //

    // Schedule reminders for a study plan
    schedulePlanReminders(plan) {
        try {
            // Cancel existing reminders for this plan
            this.cancelPlanReminders(plan.id);

            const reminders = this.generatePlanReminders(plan);
            
            reminders.forEach(reminder => {
                this.scheduleReminder(reminder);
            });

            console.log(`Scheduled ${reminders.length} reminders for plan: ${plan.title}`);
        } catch (error) {
            console.error('Error scheduling plan reminders:', error);
        }
    }

    // Generate reminders for a study plan
    generatePlanReminders(plan) {
        const reminders = [];
        const now = new Date();
        
        if (!plan.reminderSettings?.enabled) {
            return reminders;
        }

        // Daily study reminders
        if (this.settings.reminderTypes.daily && plan.reminderSettings.frequency === 'daily') {
            const dailyReminders = this.generateDailyReminders(plan);
            reminders.push(...dailyReminders);
        }

        // Weekly study reminders
        if (plan.reminderSettings.frequency === 'weekly') {
            const weeklyReminders = this.generateWeeklyReminders(plan);
            reminders.push(...weeklyReminders);
        }

        // Deadline reminders
        if (this.settings.reminderTypes.deadline && plan.deadline) {
            const deadlineReminders = this.generateDeadlineReminders(plan);
            reminders.push(...deadlineReminders);
        }

        // Milestone reminders
        if (this.settings.reminderTypes.milestone && plan.milestones) {
            const milestoneReminders = this.generateMilestoneReminders(plan);
            reminders.push(...milestoneReminders);
        }

        return reminders.filter(reminder => reminder.scheduledTime > now);
    }

    // Generate daily study reminders
    generateDailyReminders(plan) {
        const reminders = [];
        const startDate = new Date(plan.startDate || plan.createdAt);
        const endDate = new Date(plan.deadline);
        const reminderHour = plan.reminderSettings.time || 18;

        let currentDate = new Date(startDate);
        
        while (currentDate <= endDate) {
            // Skip weekends if preferred
            if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
                const reminderTime = new Date(currentDate);
                reminderTime.setHours(reminderHour, 0, 0, 0);

                if (reminderTime > new Date()) {
                    reminders.push({
                        id: `${plan.id}_daily_${currentDate.toISOString().split('T')[0]}`,
                        planId: plan.id,
                        type: 'daily_study',
                        title: 'Study Reminder',
                        message: `Time to work on "${plan.title}"! Keep up the great progress.`,
                        scheduledTime: reminderTime,
                        data: { plan: plan }
                    });
                }
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
        }

        return reminders;
    }

    // Generate weekly study reminders
    generateWeeklyReminders(plan) {
        const reminders = [];
        const startDate = new Date(plan.startDate || plan.createdAt);
        const endDate = new Date(plan.deadline);
        const reminderHour = plan.reminderSettings.time || 18;

        let currentWeek = new Date(startDate);
        currentWeek.setDate(currentWeek.getDate() - currentWeek.getDay()); // Start of week

        while (currentWeek <= endDate) {
            const reminderTime = new Date(currentWeek);
            reminderTime.setDate(reminderTime.getDate() + 1); // Monday
            reminderTime.setHours(reminderHour, 0, 0, 0);

            if (reminderTime > new Date()) {
                reminders.push({
                    id: `${plan.id}_weekly_${currentWeek.toISOString().split('T')[0]}`,
                    planId: plan.id,
                    type: 'weekly_study',
                    title: 'Weekly Study Check-in',
                    message: `How's your progress on "${plan.title}" this week?`,
                    scheduledTime: reminderTime,
                    data: { plan: plan }
                });
            }

            currentWeek.setDate(currentWeek.getDate() + 7);
        }

        return reminders;
    }

    // Generate deadline reminders
    generateDeadlineReminders(plan) {
        const reminders = [];
        const deadline = new Date(plan.deadline);
        const reminderIntervals = [7, 3, 1]; // Days before deadline

        reminderIntervals.forEach(days => {
            const reminderTime = new Date(deadline);
            reminderTime.setDate(reminderTime.getDate() - days);
            reminderTime.setHours(plan.reminderSettings.time || 18, 0, 0, 0);

            if (reminderTime > new Date()) {
                const urgencyMap = {
                    7: 'upcoming',
                    3: 'urgent',
                    1: 'critical'
                };

                reminders.push({
                    id: `${plan.id}_deadline_${days}d`,
                    planId: plan.id,
                    type: 'deadline_reminder',
                    title: `Deadline ${days === 1 ? 'Tomorrow' : `in ${days} days`}!`,
                    message: `"${plan.title}" is due ${days === 1 ? 'tomorrow' : `in ${days} days`}. Current progress: ${plan.progress || 0}%`,
                    scheduledTime: reminderTime,
                    urgency: urgencyMap[days],
                    data: { plan: plan, daysRemaining: days }
                });
            }
        });

        return reminders;
    }

    // Generate milestone reminders
    generateMilestoneReminders(plan) {
        const reminders = [];
        
        if (!plan.milestones) return reminders;

        plan.milestones.forEach(milestone => {
            if (!milestone.achieved && milestone.date) {
                const reminderTime = new Date(milestone.date);
                reminderTime.setHours(plan.reminderSettings.time || 18, 0, 0, 0);

                if (reminderTime > new Date()) {
                    reminders.push({
                        id: `${plan.id}_milestone_${milestone.id}`,
                        planId: plan.id,
                        type: 'milestone_reminder',
                        title: 'Milestone Check',
                        message: `Time to check your progress on "${plan.title}". Target: ${milestone.title}`,
                        scheduledTime: reminderTime,
                        data: { plan: plan, milestone: milestone }
                    });
                }
            }
        });

        return reminders;
    }

    // Schedule a single reminder
    scheduleReminder(reminder) {
        const now = new Date();
        const delay = reminder.scheduledTime.getTime() - now.getTime();

        if (delay <= 0) {
            console.log('Reminder scheduled for the past, skipping:', reminder.title);
            return;
        }

        const timeoutId = setTimeout(() => {
            this.triggerReminder(reminder);
        }, delay);

        // Store the timeout ID for potential cancellation
        if (!this.scheduledReminders.has(reminder.planId)) {
            this.scheduledReminders.set(reminder.planId, []);
        }
        
        this.scheduledReminders.get(reminder.planId).push({
            id: reminder.id,
            timeoutId: timeoutId,
            reminder: reminder
        });

        console.log(`Reminder scheduled: ${reminder.title} at ${reminder.scheduledTime.toLocaleString()}`);
    }

    // Trigger a reminder
    triggerReminder(reminder) {
        try {
            // Check quiet hours
            if (this.isQuietHours()) {
                this.queueReminder(reminder);
                return;
            }

            // Show browser notification if enabled
            if (this.settings.enableBrowserNotifications) {
                this.showBrowserNotification(reminder);
            }

            // Show in-app notification
            this.showInAppNotification(reminder.message, this.getReminderType(reminder.type), reminder);

            // Play notification sound if enabled
            if (this.settings.enableSounds) {
                this.playNotificationSound(reminder.type);
            }

            // Log the notification
            this.logNotification(reminder);

            console.log('Reminder triggered:', reminder.title);
        } catch (error) {
            console.error('Error triggering reminder:', error);
        }
    }

    // ===== NOTIFICATION DISPLAY ===== //

    // Show browser notification
    showBrowserNotification(reminder) {
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }

        try {
            const notification = new Notification(reminder.title, {
                body: reminder.message,
                icon: this.getNotificationIcon(reminder.type),
                badge: '/favicon.ico',
                tag: `study-reminder-${reminder.planId}`,
                requireInteraction: reminder.urgency === 'critical',
                silent: this.isQuietHours(),
                data: reminder.data
            });

            // Handle notification click
            notification.onclick = () => {
                window.focus();
                this.handleNotificationClick(reminder);
                notification.close();
            };

            // Auto-close after delay
            const autoCloseDelay = reminder.urgency === 'critical' ? 10000 : 6000;
            setTimeout(() => {
                notification.close();
            }, autoCloseDelay);

        } catch (error) {
            console.error('Error showing browser notification:', error);
        }
    }

    // Show in-app notification
    showInAppNotification(message, type = 'info', reminder = null) {
        const notification = {
            id: this.generateId(),
            message: message,
            type: type,
            timestamp: new Date(),
            reminder: reminder,
            dismissed: false
        };

        this.notifications.push(notification);
        this.displayInAppNotification(notification);
        
        // Auto-dismiss after delay
        setTimeout(() => {
            this.dismissInAppNotification(notification.id);
        }, this.getNotificationDuration(type));
    }

    // Display in-app notification element
    displayInAppNotification(notification) {
        const container = this.getNotificationContainer();
        const element = this.createNotificationElement(notification);
        
        container.appendChild(element);
        
        // Animate in
        setTimeout(() => {
            element.classList.add('show');
        }, 100);
    }

    // Create notification element
    createNotificationElement(notification) {
        const element = document.createElement('div');
        element.className = `notification ${notification.type}`;
        element.dataset.notificationId = notification.id;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle',
            reminder: 'fas fa-bell'
        };

        const actions = notification.reminder ? this.createReminderActions(notification.reminder) : '';

        element.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon ${iconMap[notification.type]}"></i>
                <div class="notification-text">
                    <div class="notification-title">${this.getNotificationTitle(notification)}</div>
                    <p class="notification-message">${notification.message}</p>
                    <div class="notification-timestamp">${this.formatNotificationTime(notification.timestamp)}</div>
                </div>
                <button class="notification-close" onclick="notificationManager.dismissInAppNotification('${notification.id}')">&times;</button>
            </div>
            ${actions}
        `;

        return element;
    }

    // Create reminder action buttons
    createReminderActions(reminder) {
        const actions = [];
        
        switch (reminder.type) {
            case 'daily_study':
                actions.push('<button class="notification-action btn-primary" onclick="notificationManager.startStudySession(\'' + reminder.planId + '\')">Start Studying</button>');
                actions.push('<button class="notification-action btn-secondary" onclick="notificationManager.snoozeReminder(\'' + reminder.id + '\', 30)">Snooze 30min</button>');
                break;
                
            case 'deadline_reminder':
                actions.push('<button class="notification-action btn-primary" onclick="notificationManager.viewPlan(\'' + reminder.planId + '\')">View Plan</button>');
                actions.push('<button class="notification-action btn-secondary" onclick="notificationManager.dismissInAppNotification(\'' + reminder.id + '\')">Dismiss</button>');
                break;
                
            case 'milestone_reminder':
                actions.push('<button class="notification-action btn-primary" onclick="notificationManager.checkProgress(\'' + reminder.planId + '\')">Check Progress</button>');
                break;
        }
        
        if (actions.length > 0) {
            return `<div class="notification-actions">${actions.join('')}</div>`;
        }
        
        return '';
    }

    // Get notification container
    getNotificationContainer() {
        let container = document.getElementById('notification-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        return container;
    }

    // Dismiss in-app notification
    dismissInAppNotification(notificationId) {
        const element = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (element) {
            element.classList.remove('show');
            setTimeout(() => {
                element.remove();
            }, 300);
        }

        // Mark as dismissed in array
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.dismissed = true;
        }
    }

    // ===== REMINDER MANAGEMENT ===== //

    // Update plan reminders
    updatePlanReminders(plan) {
        this.cancelPlanReminders(plan.id);
        this.schedulePlanReminders(plan);
    }

    // Cancel all reminders for a plan
    cancelPlanReminders(planId) {
        const planReminders = this.scheduledReminders.get(planId);
        
        if (planReminders) {
            planReminders.forEach(({ timeoutId }) => {
                clearTimeout(timeoutId);
            });
            
            this.scheduledReminders.delete(planId);
            console.log('Cancelled reminders for plan:', planId);
        }
    }

    // Snooze a reminder
    snoozeReminder(reminderId, minutes) {
        const snoozeTime = new Date();
        snoozeTime.setMinutes(snoozeTime.getMinutes() + minutes);
        
        // Find and update the reminder
        for (const [planId, reminders] of this.scheduledReminders) {
            const reminderIndex = reminders.findIndex(r => r.id === reminderId);
            if (reminderIndex !== -1) {
                const { reminder } = reminders[reminderIndex];
                
                // Cancel current reminder
                clearTimeout(reminders[reminderIndex].timeoutId);
                
                // Reschedule for snooze time
                reminder.scheduledTime = snoozeTime;
                this.scheduleReminder(reminder);
                
                this.showInAppNotification(
                    `Reminder snoozed for ${minutes} minutes`,
                    'info'
                );
                break;
            }
        }
    }

    // ===== EVENT HANDLERS ===== //

    // Handle task completion
    handleTaskCompletion({ planId, task }) {
        if (!this.settings.reminderTypes.encouragement) return;

        const plan = window.studyPlanManager?.getPlan(planId);
        if (!plan) return;

        const completedTasks = plan.tasks.filter(t => t.completed).length;
        const totalTasks = plan.tasks.length;
        const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

        // Show encouragement based on progress
        let message = '';
        if (progressPercentage === 100) {
            message = `🎉 Congratulations! You completed "${plan.title}"!`;
        } else if (progressPercentage >= 75) {
            message = `🚀 Almost there! ${100 - progressPercentage}% left on "${plan.title}".`;
        } else if (progressPercentage >= 50) {
            message = `💪 Great progress! You're halfway through "${plan.title}".`;
        } else if (progressPercentage >= 25) {
            message = `👍 Nice work! Keep going with "${plan.title}".`;
        } else {
            message = `🌟 Great start on "${plan.title}"! Every task completed is progress.`;
        }

        this.showInAppNotification(message, 'success');
    }

    // Handle milestone achievement
    handleMilestoneAchievement({ planId, milestone }) {
        const plan = window.studyPlanManager?.getPlan(planId);
        if (!plan) return;

        this.showInAppNotification(
            `🏆 Milestone achieved! ${milestone.title} for "${plan.title}"`,
            'success'
        );

        if (this.settings.enableBrowserNotifications) {
            this.showBrowserNotification({
                title: 'Milestone Achieved!',
                message: `${milestone.title} for "${plan.title}"`,
                type: 'milestone_achievement',
                data: { plan, milestone }
            });
        }
    }

    // ===== ACTION HANDLERS ===== //

    // Start study session
    startStudySession(planId) {
        window.location.href = `dashboard.html?plan=${planId}&action=study`;
    }

    // View plan details
    viewPlan(planId) {
        window.location.href = `view-plans.html?plan=${planId}`;
    }

    // Check progress
    checkProgress(planId) {
        window.location.href = `dashboard.html?plan=${planId}&action=progress`;
    }

    // Handle notification click
    handleNotificationClick(reminder) {
        switch (reminder.type) {
            case 'daily_study':
                this.startStudySession(reminder.planId);
                break;
            case 'deadline_reminder':
                this.viewPlan(reminder.planId);
                break;
            case 'milestone_reminder':
                this.checkProgress(reminder.planId);
                break;
            default:
                window.location.href = 'dashboard.html';
        }
    }

    // ===== UTILITY FUNCTIONS ===== //

    // Check if current time is during quiet hours
    isQuietHours() {
        if (!this.settings.quietHours.enabled) return false;
        
        const now = new Date();
        const currentHour = now.getHours();
        const { start, end } = this.settings.quietHours;
        
        if (start > end) {
            // Quiet hours cross midnight
            return currentHour >= start || currentHour < end;
        } else {
            return currentHour >= start && currentHour < end;
        }
    }

    // Queue reminder for after quiet hours
    queueReminder(reminder) {
        this.notificationQueue.push(reminder);
        
        if (!this.isProcessingQueue) {
            this.processQueueAfterQuietHours();
        }
    }

    // Process queued reminders after quiet hours
    processQueueAfterQuietHours() {
        this.isProcessingQueue = true;
        
        const checkQueue = () => {
            if (!this.isQuietHours() && this.notificationQueue.length > 0) {
                const reminder = this.notificationQueue.shift();
                this.triggerReminder(reminder);
                
                // Process next reminder after a delay
                setTimeout(checkQueue, 2000);
            } else if (this.notificationQueue.length > 0) {
                // Still in quiet hours, check again in 5 minutes
                setTimeout(checkQueue, 5 * 60 * 1000);
            } else {
                this.isProcessingQueue = false;
            }
        };
        
        checkQueue();
    }

    // Get notification icon based on type
    getNotificationIcon(type) {
        const iconMap = {
            daily_study: '/icons/study.png',
            deadline_reminder: '/icons/deadline.png',
            milestone_reminder: '/icons/milestone.png',
            encouragement: '/icons/success.png'
        };
        
        return iconMap[type] || '/favicon.ico';
    }

    // Get reminder type for styling
    getReminderType(type) {
        const typeMap = {
            daily_study: 'info',
            weekly_study: 'info',
            deadline_reminder: 'warning',
            milestone_reminder: 'info',
            encouragement: 'success'
        };
        
        return typeMap[type] || 'info';
    }

    // Get notification duration
    getNotificationDuration(type) {
        const durationMap = {
            success: 4000,
            info: 5000,
            warning: 7000,
            error: 8000,
            reminder: 6000
        };
        
        return durationMap[type] || 5000;
    }

    // Get notification title
    getNotificationTitle(notification) {
        if (notification.reminder) {
            return notification.reminder.title;
        }
        
        const titleMap = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information',
            reminder: 'Reminder'
        };
        
        return titleMap[notification.type] || 'Notification';
    }

    // Format notification time
    formatNotificationTime(timestamp) {
        const now = new Date();
        const diff = now.getTime() - timestamp.getTime();
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    // Play notification sound
    playNotificationSound(type) {
        try {
            const audio = new Audio();
            const soundMap = {
                daily_study: '/sounds/gentle-bell.mp3',
                deadline_reminder: '/sounds/urgent-bell.mp3',
                milestone_reminder: '/sounds/achievement.mp3',
                encouragement: '/sounds/success.mp3'
            };
            
            audio.src = soundMap[type] || '/sounds/default-notification.mp3';
            audio.volume = 0.5;
            audio.play().catch(error => {
                console.log('Could not play notification sound:', error);
            });
        } catch (error) {
            console.log('Error playing notification sound:', error);
        }
    }

    // Log notification for analytics
    logNotification(reminder) {
        const logEntry = {
            timestamp: new Date(),
            type: reminder.type,
            planId: reminder.planId,
            title: reminder.title,
            triggered: true
        };
        
        // Could send to analytics service
        console.log('Notification logged:', logEntry);
    }

    // Setup periodic checks
    setupPeriodicChecks() {
        // Check for overdue reminders every 5 minutes
        setInterval(() => {
            this.checkOverdueReminders();
        }, 5 * 60 * 1000);

        // Clean up old notifications every hour
        setInterval(() => {
            this.cleanupOldNotifications();
        }, 60 * 60 * 1000);
    }

    // Check for overdue reminders
    checkOverdueReminders() {
        const now = new Date();
        
        for (const [planId, reminders] of this.scheduledReminders) {
            reminders.forEach(({ reminder }) => {
                if (reminder.scheduledTime < now && !reminder.triggered) {
                    console.log('Found overdue reminder:', reminder.title);
                    this.triggerReminder(reminder);
                    reminder.triggered = true;
                }
            });
        }
    }

    // Clean up old notifications
    cleanupOldNotifications() {
        const cutoff = new Date();
        cutoff.setHours(cutoff.getHours() - 24); // 24 hours ago
        
        this.notifications = this.notifications.filter(
            notification => notification.timestamp > cutoff
        );
    }

    // Pause in-app notifications
    pauseInAppNotifications() {
        this.inAppPaused = true;
    }

    // Resume in-app notifications
    resumeInAppNotifications() {
        this.inAppPaused = false;
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Get all notifications
    getAllNotifications() {
        return [...this.notifications];
    }

    // Clear all notifications
    clearAllNotifications() {
        this.notifications = [];
        const container = document.getElementById('notification-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    // Update notification settings
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }
}

// Initialize notification manager
document.addEventListener('DOMContentLoaded', () => {
    window.notificationManager = new NotificationManager();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationManager;
}
