// ===== STUDY PLAN MANAGEMENT FOR SMART STUDY PLANNER ===== //

class StudyPlanManager {
    constructor() {
        this.plans = [];
        this.currentPlan = null;
        this.studyStats = {
            totalStudyTime: 0,
            completedPlans: 0,
            totalTasks: 0,
            completedTasks: 0,
            currentStreak: 0,
            longestStreak: 0,
            weeklyGoals: [],
            achievements: []
        };
        
        this.init();
    }

    // Initialize study plan manager
    init() {
        this.loadData();
        this.setupEventListeners();
        this.startProgressTracking();
        console.log('Study Plan Manager initialized');
    }

    // Load data from storage
    loadData() {
        if (window.storageManager) {
            this.plans = window.storageManager.loadStudyPlans();
            this.studyStats = window.storageManager.loadStudyStats();
            console.log(`Loaded ${this.plans.length} study plans`);
        }
    }

    // Save data to storage
    saveData() {
        if (window.storageManager) {
            window.storageManager.saveStudyPlans(this.plans);
            window.storageManager.saveStudyStats(this.studyStats);
        }
    }

    // Setup event listeners for study plan interactions
    setupEventListeners() {
        // Listen for plan completion events
        document.addEventListener('planCompleted', (e) => {
            this.handlePlanCompletion(e.detail.planId);
        });

        // Listen for task completion events
        document.addEventListener('taskCompleted', (e) => {
            this.handleTaskCompletion(e.detail.planId, e.detail.taskId);
        });

        // Listen for study session events
        document.addEventListener('studySessionComplete', (e) => {
            this.handleStudySession(e.detail);
        });
    }

    // ===== STUDY PLAN CRUD OPERATIONS ===== //

    // Create a new study plan
    createPlan(planData) {
        try {
            const plan = {
                id: this.generateId(),
                title: this.sanitizeInput(planData.title),
                subject: planData.subject || 'general',
                description: this.sanitizeInput(planData.description || ''),
                startDate: planData.startDate || new Date().toISOString().split('T')[0],
                deadline: planData.deadline,
                priority: planData.priority || 'medium',
                estimatedHours: parseInt(planData.estimatedHours) || 0,
                actualHours: 0,
                resources: this.sanitizeInput(planData.resources || ''),
                methods: Array.isArray(planData.methods) ? planData.methods : [],
                tasks: this.processTasks(planData.tasks || []),
                status: 'active',
                progress: 0,
                reminderSettings: {
                    frequency: planData.reminderFrequency || 'daily',
                    time: parseInt(planData.reminderTime) || 18,
                    enabled: true
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                lastStudiedAt: null,
                completedAt: null,
                tags: this.extractTags(planData.title + ' ' + planData.description),
                difficulty: this.calculatePlanDifficulty(planData.tasks || []),
                milestones: this.generateMilestones(planData.tasks || [])
            };

            this.plans.push(plan);
            this.saveData();
            this.updateStatistics();
            
            // Schedule reminders
            this.scheduleReminders(plan);
            
            console.log('Study plan created:', plan.id);
            this.dispatchEvent('planCreated', { plan });
            
            return plan;
        } catch (error) {
            console.error('Error creating study plan:', error);
            throw error;
        }
    }

    // Update an existing study plan
    updatePlan(planId, updateData) {
        try {
            const planIndex = this.plans.findIndex(plan => plan.id === planId);
            
            if (planIndex === -1) {
                throw new Error('Study plan not found');
            }

            const existingPlan = this.plans[planIndex];
            const updatedPlan = {
                ...existingPlan,
                ...updateData,
                id: planId, // Ensure ID doesn't change
                updatedAt: new Date().toISOString(),
                tasks: this.processTasks(updateData.tasks || existingPlan.tasks),
                tags: this.extractTags((updateData.title || existingPlan.title) + ' ' + (updateData.description || existingPlan.description))
            };

            // Recalculate progress and difficulty
            updatedPlan.progress = this.calculateProgress(updatedPlan.tasks);
            updatedPlan.difficulty = this.calculatePlanDifficulty(updatedPlan.tasks);
            updatedPlan.milestones = this.generateMilestones(updatedPlan.tasks);

            this.plans[planIndex] = updatedPlan;
            this.saveData();
            this.updateStatistics();
            
            // Update reminders
            this.scheduleReminders(updatedPlan);
            
            console.log('Study plan updated:', planId);
            this.dispatchEvent('planUpdated', { plan: updatedPlan });
            
            return updatedPlan;
        } catch (error) {
            console.error('Error updating study plan:', error);
            throw error;
        }
    }

    // Delete a study plan
    deletePlan(planId) {
        try {
            const planIndex = this.plans.findIndex(plan => plan.id === planId);
            
            if (planIndex === -1) {
                throw new Error('Study plan not found');
            }

            const deletedPlan = this.plans[planIndex];
            this.plans.splice(planIndex, 1);
            
            this.saveData();
            this.updateStatistics();
            
            // Cancel reminders
            this.cancelReminders(planId);
            
            console.log('Study plan deleted:', planId);
            this.dispatchEvent('planDeleted', { plan: deletedPlan });
            
            return true;
        } catch (error) {
            console.error('Error deleting study plan:', error);
            throw error;
        }
    }

    // Get a specific study plan
    getPlan(planId) {
        return this.plans.find(plan => plan.id === planId) || null;
    }

    // Get all study plans
    getAllPlans() {
        return [...this.plans]; // Return a copy to prevent external modifications
    }

    // ===== TASK MANAGEMENT ===== //

    // Process and validate tasks
    processTasks(tasks) {
        if (!Array.isArray(tasks)) return [];
        
        return tasks.map((task, index) => ({
            id: task.id || this.generateId(),
            title: this.sanitizeInput(task.title),
            description: this.sanitizeInput(task.description || ''),
            estimatedHours: parseFloat(task.estimatedHours) || 1,
            actualHours: task.actualHours || 0,
            difficulty: task.difficulty || 'medium',
            completed: Boolean(task.completed),
            completedAt: task.completedAt || null,
            order: task.order !== undefined ? task.order : index,
            prerequisites: Array.isArray(task.prerequisites) ? task.prerequisites : [],
            resources: task.resources || [],
            notes: this.sanitizeInput(task.notes || ''),
            createdAt: task.createdAt || new Date().toISOString()
        })).sort((a, b) => a.order - b.order);
    }

    // Add task to a study plan
    addTask(planId, taskData) {
        try {
            const plan = this.getPlan(planId);
            if (!plan) {
                throw new Error('Study plan not found');
            }

            const task = {
                id: this.generateId(),
                title: this.sanitizeInput(taskData.title),
                description: this.sanitizeInput(taskData.description || ''),
                estimatedHours: parseFloat(taskData.estimatedHours) || 1,
                actualHours: 0,
                difficulty: taskData.difficulty || 'medium',
                completed: false,
                completedAt: null,
                order: plan.tasks.length,
                prerequisites: [],
                resources: [],
                notes: '',
                createdAt: new Date().toISOString()
            };

            plan.tasks.push(task);
            plan.updatedAt = new Date().toISOString();
            plan.progress = this.calculateProgress(plan.tasks);
            
            this.saveData();
            this.dispatchEvent('taskAdded', { planId, task });
            
            return task;
        } catch (error) {
            console.error('Error adding task:', error);
            throw error;
        }
    }

    // Update a task
    updateTask(planId, taskId, updateData) {
        try {
            const plan = this.getPlan(planId);
            if (!plan) {
                throw new Error('Study plan not found');
            }

            const taskIndex = plan.tasks.findIndex(task => task.id === taskId);
            if (taskIndex === -1) {
                throw new Error('Task not found');
            }

            const updatedTask = {
                ...plan.tasks[taskIndex],
                ...updateData,
                id: taskId // Ensure ID doesn't change
            };

            plan.tasks[taskIndex] = updatedTask;
            plan.updatedAt = new Date().toISOString();
            plan.progress = this.calculateProgress(plan.tasks);
            
            this.saveData();
            this.dispatchEvent('taskUpdated', { planId, task: updatedTask });
            
            return updatedTask;
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }

    // Toggle task completion
    toggleTaskCompletion(planId, taskId) {
        try {
            const plan = this.getPlan(planId);
            if (!plan) {
                throw new Error('Study plan not found');
            }

            const task = plan.tasks.find(task => task.id === taskId);
            if (!task) {
                throw new Error('Task not found');
            }

            const wasCompleted = task.completed;
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            
            // Update plan progress
            plan.progress = this.calculateProgress(plan.tasks);
            plan.updatedAt = new Date().toISOString();
            
            // Check if plan is now complete
            if (plan.progress === 100 && plan.status !== 'completed') {
                this.completePlan(planId);
            }
            
            // Update statistics
            if (task.completed && !wasCompleted) {
                this.studyStats.completedTasks++;
                this.updateStudyStreak();
            } else if (!task.completed && wasCompleted) {
                this.studyStats.completedTasks--;
            }
            
            this.saveData();
            this.updateStatistics();
            this.dispatchEvent('taskToggled', { planId, task, wasCompleted });
            
            return task;
        } catch (error) {
            console.error('Error toggling task completion:', error);
            throw error;
        }
    }

    // Delete a task
    deleteTask(planId, taskId) {
        try {
            const plan = this.getPlan(planId);
            if (!plan) {
                throw new Error('Study plan not found');
            }

            const taskIndex = plan.tasks.findIndex(task => task.id === taskId);
            if (taskIndex === -1) {
                throw new Error('Task not found');
            }

            const deletedTask = plan.tasks[taskIndex];
            plan.tasks.splice(taskIndex, 1);
            
            // Reorder remaining tasks
            plan.tasks.forEach((task, index) => {
                task.order = index;
            });
            
            plan.progress = this.calculateProgress(plan.tasks);
            plan.updatedAt = new Date().toISOString();
            
            this.saveData();
            this.dispatchEvent('taskDeleted', { planId, task: deletedTask });
            
            return deletedTask;
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }

    // ===== PROGRESS AND STATISTICS ===== //

    // Calculate progress for a study plan
    calculateProgress(tasks) {
        if (!tasks || tasks.length === 0) return 0;
        
        const completedTasks = tasks.filter(task => task.completed);
        return Math.round((completedTasks.length / tasks.length) * 100);
    }

    // Calculate plan difficulty based on tasks
    calculatePlanDifficulty(tasks) {
        if (!tasks || tasks.length === 0) return 'medium';
        
        const difficultyScores = { easy: 1, medium: 2, hard: 3 };
        const totalScore = tasks.reduce((sum, task) => {
            return sum + (difficultyScores[task.difficulty] || 2);
        }, 0);
        
        const averageScore = totalScore / tasks.length;
        
        if (averageScore <= 1.5) return 'easy';
        if (averageScore <= 2.5) return 'medium';
        return 'hard';
    }

    // Generate milestones based on tasks
    generateMilestones(tasks) {
        if (!tasks || tasks.length === 0) return [];
        
        const milestones = [];
        const taskCount = tasks.length;
        const milestonePoints = [25, 50, 75, 100];
        
        milestonePoints.forEach(percentage => {
            const taskIndex = Math.floor((taskCount * percentage) / 100) - 1;
            if (taskIndex >= 0 && taskIndex < taskCount) {
                milestones.push({
                    percentage,
                    description: `Complete ${Math.ceil(taskCount * percentage / 100)} tasks`,
                    achieved: false,
                    achievedAt: null
                });
            }
        });
        
        return milestones;
    }

    // Complete a study plan
    completePlan(planId) {
        try {
            const plan = this.getPlan(planId);
            if (!plan) {
                throw new Error('Study plan not found');
            }

            plan.status = 'completed';
            plan.completedAt = new Date().toISOString();
            plan.progress = 100;
            
            // Mark all milestones as achieved
            plan.milestones.forEach(milestone => {
                if (!milestone.achieved) {
                    milestone.achieved = true;
                    milestone.achievedAt = new Date().toISOString();
                }
            });
            
            this.studyStats.completedPlans++;
            this.updateStudyStreak();
            
            // Add achievement
            this.addAchievement({
                type: 'plan_completed',
                title: 'Plan Completed!',
                description: `Completed "${plan.title}"`,
                planId: planId,
                earnedAt: new Date().toISOString()
            });
            
            this.saveData();
            this.updateStatistics();
            this.dispatchEvent('planCompleted', { plan });
            
            // Show congratulations notification
            if (window.studyApp) {
                window.studyApp.showNotification(
                    `Congratulations! You completed "${plan.title}"!`,
                    'success'
                );
            }
            
            return plan;
        } catch (error) {
            console.error('Error completing study plan:', error);
            throw error;
        }
    }

    // Update study streak
    updateStudyStreak() {
        const today = new Date().toISOString().split('T')[0];
        const lastStudyDate = this.studyStats.lastStudyDate;
        
        if (!lastStudyDate || lastStudyDate !== today) {
            // Check if yesterday was a study day
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            if (lastStudyDate === yesterdayStr) {
                this.studyStats.currentStreak++;
            } else {
                this.studyStats.currentStreak = 1;
            }
            
            if (this.studyStats.currentStreak > this.studyStats.longestStreak) {
                this.studyStats.longestStreak = this.studyStats.currentStreak;
            }
            
            this.studyStats.lastStudyDate = today;
        }
    }

    // Add achievement
    addAchievement(achievement) {
        achievement.id = this.generateId();
        this.studyStats.achievements.push(achievement);
        
        // Check for streak achievements
        this.checkStreakAchievements();
    }

    // Check for streak-based achievements
    checkStreakAchievements() {
        const streakMilestones = [7, 14, 30, 60, 100];
        const currentStreak = this.studyStats.currentStreak;
        
        streakMilestones.forEach(days => {
            if (currentStreak >= days) {
                const existingAchievement = this.studyStats.achievements.find(
                    a => a.type === 'streak' && a.days === days
                );
                
                if (!existingAchievement) {
                    this.addAchievement({
                        type: 'streak',
                        title: `${days}-Day Streak!`,
                        description: `Maintained a ${days}-day study streak`,
                        days: days,
                        earnedAt: new Date().toISOString()
                    });
                }
            }
        });
    }

    // ===== FILTERING AND SORTING ===== //

    // Filter plans by criteria
    filterPlans(criteria) {
        let filteredPlans = [...this.plans];
        
        // Filter by status
        if (criteria.status && criteria.status !== 'all') {
            filteredPlans = filteredPlans.filter(plan => plan.status === criteria.status);
        }
        
        // Filter by priority
        if (criteria.priority && criteria.priority !== 'all') {
            filteredPlans = filteredPlans.filter(plan => plan.priority === criteria.priority);
        }
        
        // Filter by subject
        if (criteria.subject && criteria.subject !== 'all') {
            filteredPlans = filteredPlans.filter(plan => plan.subject === criteria.subject);
        }
        
        // Filter by deadline (due soon)
        if (criteria.dueSoon) {
            const now = new Date();
            const weekFromNow = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));
            filteredPlans = filteredPlans.filter(plan => {
                if (!plan.deadline) return false;
                const deadline = new Date(plan.deadline);
                return deadline >= now && deadline <= weekFromNow;
            });
        }
        
        // Filter by search term
        if (criteria.searchTerm) {
            const term = criteria.searchTerm.toLowerCase();
            filteredPlans = filteredPlans.filter(plan => 
                plan.title.toLowerCase().includes(term) ||
                plan.description.toLowerCase().includes(term) ||
                plan.tags.some(tag => tag.toLowerCase().includes(term))
            );
        }
        
        return filteredPlans;
    }

    // Sort plans by criteria
    sortPlans(plans, sortBy = 'recent') {
        const sortedPlans = [...plans];
        
        switch (sortBy) {
            case 'deadline':
                return sortedPlans.sort((a, b) => {
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return new Date(a.deadline) - new Date(b.deadline);
                });
                
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return sortedPlans.sort((a, b) => 
                    priorityOrder[b.priority] - priorityOrder[a.priority]
                );
                
            case 'progress':
                return sortedPlans.sort((a, b) => b.progress - a.progress);
                
            case 'alphabetical':
                return sortedPlans.sort((a, b) => 
                    a.title.localeCompare(b.title)
                );
                
            case 'recent':
            default:
                return sortedPlans.sort((a, b) => 
                    new Date(b.updatedAt) - new Date(a.updatedAt)
                );
        }
    }

    // ===== UTILITY FUNCTIONS ===== //

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Sanitize input to prevent XSS
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        return input.trim().replace(/[<>]/g, '');
    }

    // Extract tags from text
    extractTags(text) {
        if (!text) return [];
        
        const words = text.toLowerCase().split(/\s+/);
        const stopWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'a', 'an'];
        
        return words
            .filter(word => word.length > 2 && !stopWords.includes(word))
            .slice(0, 10); // Limit to 10 tags
    }

    // Start progress tracking
    startProgressTracking() {
        // Update progress statistics every minute
        setInterval(() => {
            this.updateStatistics();
        }, 60000);
    }

    // Update statistics
    updateStatistics() {
        this.studyStats.totalTasks = this.plans.reduce((sum, plan) => sum + plan.tasks.length, 0);
        this.studyStats.completedTasks = this.plans.reduce((sum, plan) => 
            sum + plan.tasks.filter(task => task.completed).length, 0
        );
        this.studyStats.completedPlans = this.plans.filter(plan => plan.status === 'completed').length;
        
        // Calculate total actual study time
        this.studyStats.totalStudyTime = this.plans.reduce((sum, plan) => {
            return sum + plan.tasks.reduce((taskSum, task) => taskSum + task.actualHours, 0);
        }, 0);
        
        this.saveData();
    }

    // Schedule reminders for a plan
    scheduleReminders(plan) {
        if (!plan.reminderSettings.enabled) return;
        
        // This would integrate with the notifications system
        console.log(`Scheduling reminders for plan: ${plan.title}`);
    }

    // Cancel reminders for a plan
    cancelReminders(planId) {
        console.log(`Cancelling reminders for plan: ${planId}`);
    }

    // Handle study session completion
    handleStudySession(sessionData) {
        const { planId, taskId, duration, notes } = sessionData;
        
        if (taskId) {
            // Update specific task
            const plan = this.getPlan(planId);
            if (plan) {
                const task = plan.tasks.find(t => t.id === taskId);
                if (task) {
                    task.actualHours += duration;
                    if (notes) task.notes += `\n${new Date().toLocaleString()}: ${notes}`;
                }
            }
        }
        
        // Update plan last studied time
        const plan = this.getPlan(planId);
        if (plan) {
            plan.lastStudiedAt = new Date().toISOString();
            plan.actualHours += duration;
        }
        
        this.updateStudyStreak();
        this.saveData();
        this.updateStatistics();
    }

    // Dispatch custom events
    dispatchEvent(eventType, data) {
        const event = new CustomEvent(eventType, { detail: data });
        document.dispatchEvent(event);
    }

    // Get study statistics
    getStatistics() {
        return { ...this.studyStats };
    }

    // Export plan data for sharing
    exportPlan(planId) {
        const plan = this.getPlan(planId);
        if (!plan) return null;
        
        return {
            ...plan,
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    // Import plan data
    importPlan(planData) {
        try {
            // Validate and sanitize imported data
            const sanitizedPlan = {
                ...planData,
                id: this.generateId(), // Generate new ID to avoid conflicts
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                tasks: this.processTasks(planData.tasks || [])
            };
            
            this.plans.push(sanitizedPlan);
            this.saveData();
            
            return sanitizedPlan;
        } catch (error) {
            console.error('Error importing plan:', error);
            throw error;
        }
    }
}

// Initialize study plan manager
document.addEventListener('DOMContentLoaded', () => {
    window.studyPlanManager = new StudyPlanManager();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudyPlanManager;
}
