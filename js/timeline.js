// ===== TIMELINE VISUALIZATION FOR SMART STUDY PLANNER ===== //

class TimelineManager {
    constructor() {
        this.timelines = new Map();
        this.animationSettings = {
            duration: 800,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            stagger: 100
        };
        
        this.init();
    }

    // Initialize timeline manager
    init() {
        this.setupEventListeners();
        this.initializeIntersectionObserver();
        console.log('Timeline Manager initialized');
    }

    // Setup event listeners for timeline interactions
    setupEventListeners() {
        // Listen for plan updates to refresh timelines
        document.addEventListener('planUpdated', (e) => {
            this.updateTimeline(e.detail.plan);
        });

        // Listen for task completion to animate progress
        document.addEventListener('taskToggled', (e) => {
            this.animateTaskProgress(e.detail.planId, e.detail.task);
        });

        // Listen for plan completion for celebration animation
        document.addEventListener('planCompleted', (e) => {
            this.celebratePlanCompletion(e.detail.plan.id);
        });
    }

    // Initialize intersection observer for timeline animations
    initializeIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const timelineElement = entry.target;
                    const planId = timelineElement.dataset.planId;
                    
                    if (planId && !timelineElement.classList.contains('animated')) {
                        this.animateTimelineEntry(timelineElement);
                        timelineElement.classList.add('animated');
                    }
                }
            });
        }, {
            threshold: 0.2,
            rootMargin: '50px'
        });
    }

    // ===== TIMELINE CREATION ===== //

    // Create a visual timeline for a study plan
    createTimeline(planId, containerElement, options = {}) {
        try {
            const plan = window.studyPlanManager?.getPlan(planId);
            if (!plan) {
                console.error('Plan not found for timeline:', planId);
                return null;
            }

            const defaultOptions = {
                showProgress: true,
                showMilestones: true,
                showTasks: true,
                showDeadline: true,
                interactive: true,
                compact: false,
                theme: 'default'
            };

            const config = { ...defaultOptions, ...options };
            
            const timeline = {
                id: planId,
                element: containerElement,
                config: config,
                plan: plan,
                milestones: this.generateTimelineMilestones(plan),
                animations: []
            };

            // Clear existing content
            containerElement.innerHTML = '';
            containerElement.className = `timeline-container ${config.theme} ${config.compact ? 'compact' : ''}`;
            containerElement.dataset.planId = planId;

            // Build timeline structure
            this.buildTimelineStructure(timeline);
            this.updateTimelineProgress(timeline);
            
            // Store timeline reference
            this.timelines.set(planId, timeline);
            
            // Observe for animations
            this.observer.observe(containerElement);
            
            console.log('Timeline created for plan:', planId);
            return timeline;
            
        } catch (error) {
            console.error('Error creating timeline:', error);
            return null;
        }
    }

    // Generate timeline milestones based on plan data
    generateTimelineMilestones(plan) {
        const milestones = [];
        const startDate = new Date(plan.startDate || plan.createdAt);
        const endDate = new Date(plan.deadline);
        const totalDuration = endDate.getTime() - startDate.getTime();
        
        // Add start milestone
        milestones.push({
            id: 'start',
            type: 'start',
            date: startDate,
            title: 'Study Plan Started',
            description: 'Beginning of your learning journey',
            progress: 0,
            achieved: true,
            achievedAt: plan.createdAt
        });

        // Add task-based milestones
        if (plan.tasks && plan.tasks.length > 0) {
            const taskMilestones = [25, 50, 75];
            
            taskMilestones.forEach(percentage => {
                const taskIndex = Math.floor((plan.tasks.length * percentage) / 100);
                const milestoneDate = new Date(startDate.getTime() + (totalDuration * percentage / 100));
                
                const completedTasks = plan.tasks.filter(task => task.completed).length;
                const requiredTasks = Math.ceil(plan.tasks.length * percentage / 100);
                const isAchieved = completedTasks >= requiredTasks;
                
                milestones.push({
                    id: `milestone-${percentage}`,
                    type: 'progress',
                    date: milestoneDate,
                    title: `${percentage}% Complete`,
                    description: `${requiredTasks} of ${plan.tasks.length} tasks completed`,
                    progress: percentage,
                    achieved: isAchieved,
                    achievedAt: isAchieved ? this.getLastCompletedTaskDate(plan, requiredTasks) : null
                });
            });
        }

        // Add deadline milestone
        milestones.push({
            id: 'deadline',
            type: 'deadline',
            date: endDate,
            title: 'Target Deadline',
            description: plan.status === 'completed' ? 'Plan completed!' : 'Complete all tasks',
            progress: 100,
            achieved: plan.status === 'completed',
            achievedAt: plan.completedAt
        });

        return milestones.sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    // Get the date of the last completed task for milestone calculation
    getLastCompletedTaskDate(plan, taskCount) {
        const completedTasks = plan.tasks
            .filter(task => task.completed && task.completedAt)
            .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt));
            
        if (completedTasks.length >= taskCount) {
            return completedTasks[taskCount - 1].completedAt;
        }
        
        return null;
    }

    // Build the timeline structure
    buildTimelineStructure(timeline) {
        const { element, plan, milestones, config } = timeline;
        
        // Create timeline header
        const header = this.createTimelineHeader(plan);
        element.appendChild(header);
        
        // Create progress bar
        if (config.showProgress) {
            const progressBar = this.createProgressBar(plan);
            element.appendChild(progressBar);
        }
        
        // Create timeline track
        const track = document.createElement('div');
        track.className = 'timeline-track';
        
        // Add milestones to track
        if (config.showMilestones) {
            milestones.forEach((milestone, index) => {
                const milestoneElement = this.createMilestoneElement(milestone, index, timeline);
                track.appendChild(milestoneElement);
            });
        }
        
        // Add tasks to timeline if enabled
        if (config.showTasks && plan.tasks.length > 0) {
            const tasksContainer = this.createTasksTimeline(plan.tasks, timeline);
            element.appendChild(tasksContainer);
        }
        
        element.appendChild(track);
        
        // Add timeline controls if interactive
        if (config.interactive) {
            const controls = this.createTimelineControls(timeline);
            element.appendChild(controls);
        }
    }

    // Create timeline header
    createTimelineHeader(plan) {
        const header = document.createElement('div');
        header.className = 'timeline-header';
        
        const daysRemaining = this.calculateDaysRemaining(plan.deadline);
        const progressPercentage = plan.progress || 0;
        
        header.innerHTML = `
            <div class="timeline-title">
                <h3>${plan.title}</h3>
                <span class="timeline-subject">${plan.subject || 'General'}</span>
            </div>
            <div class="timeline-stats">
                <div class="stat">
                    <span class="stat-value">${progressPercentage}%</span>
                    <span class="stat-label">Complete</span>
                </div>
                <div class="stat">
                    <span class="stat-value ${daysRemaining < 0 ? 'overdue' : ''}">${Math.abs(daysRemaining)}</span>
                    <span class="stat-label">${daysRemaining < 0 ? 'Days Overdue' : 'Days Left'}</span>
                </div>
            </div>
        `;
        
        return header;
    }

    // Create progress bar
    createProgressBar(plan) {
        const progressContainer = document.createElement('div');
        progressContainer.className = 'timeline-progress-container';
        
        const progressPercentage = plan.progress || 0;
        const completedTasks = plan.tasks.filter(task => task.completed).length;
        const totalTasks = plan.tasks.length;
        
        progressContainer.innerHTML = `
            <div class="timeline-progress-header">
                <span class="progress-label">Overall Progress</span>
                <span class="progress-stats">${completedTasks}/${totalTasks} tasks completed</span>
            </div>
            <div class="timeline-progress-bar">
                <div class="progress-fill" style="width: 0%" data-target="${progressPercentage}"></div>
                <div class="progress-text">${progressPercentage}%</div>
            </div>
        `;
        
        return progressContainer;
    }

    // Create milestone element
    createMilestoneElement(milestone, index, timeline) {
        const milestoneElement = document.createElement('div');
        milestoneElement.className = `timeline-milestone ${milestone.type} ${milestone.achieved ? 'achieved' : 'pending'}`;
        milestoneElement.dataset.milestoneId = milestone.id;
        
        const position = this.calculateMilestonePosition(milestone, timeline);
        milestoneElement.style.left = `${position}%`;
        
        const iconMap = {
            start: 'fas fa-play-circle',
            progress: 'fas fa-flag-checkered',
            deadline: 'fas fa-trophy'
        };
        
        milestoneElement.innerHTML = `
            <div class="milestone-dot">
                <i class="${iconMap[milestone.type] || 'fas fa-circle'}"></i>
            </div>
            <div class="milestone-content">
                <div class="milestone-title">${milestone.title}</div>
                <div class="milestone-description">${milestone.description}</div>
                <div class="milestone-date">${this.formatDate(milestone.date)}</div>
                ${milestone.achieved ? `<div class="milestone-achieved">✓ Achieved</div>` : ''}
            </div>
            <div class="milestone-line"></div>
        `;
        
        // Add click handler for interactive timelines
        if (timeline.config.interactive) {
            milestoneElement.addEventListener('click', () => {
                this.showMilestoneDetails(milestone, timeline);
            });
        }
        
        return milestoneElement;
    }

    // Calculate milestone position on timeline
    calculateMilestonePosition(milestone, timeline) {
        const startDate = new Date(timeline.plan.startDate || timeline.plan.createdAt);
        const endDate = new Date(timeline.plan.deadline);
        const totalDuration = endDate.getTime() - startDate.getTime();
        const milestoneTime = milestone.date.getTime() - startDate.getTime();
        
        return Math.max(0, Math.min(100, (milestoneTime / totalDuration) * 100));
    }

    // Create tasks timeline
    createTasksTimeline(tasks, timeline) {
        const tasksContainer = document.createElement('div');
        tasksContainer.className = 'timeline-tasks';
        
        const tasksHeader = document.createElement('div');
        tasksHeader.className = 'tasks-header';
        tasksHeader.innerHTML = `
            <h4>Study Tasks</h4>
            <span class="tasks-count">${tasks.filter(t => t.completed).length} / ${tasks.length} completed</span>
        `;
        tasksContainer.appendChild(tasksHeader);
        
        const tasksList = document.createElement('div');
        tasksList.className = 'tasks-list';
        
        tasks.forEach((task, index) => {
            const taskElement = this.createTaskElement(task, index, timeline);
            tasksList.appendChild(taskElement);
        });
        
        tasksContainer.appendChild(tasksList);
        return tasksContainer;
    }

    // Create task element
    createTaskElement(task, index, timeline) {
        const taskElement = document.createElement('div');
        taskElement.className = `timeline-task ${task.completed ? 'completed' : 'pending'}`;
        taskElement.dataset.taskId = task.id;
        
        const difficultyIcons = {
            easy: '🟢',
            medium: '🟡',
            hard: '🔴'
        };
        
        taskElement.innerHTML = `
            <div class="task-checkbox">
                <input type="checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="timelineManager.toggleTaskFromTimeline('${timeline.id}', '${task.id}')">
                <span class="checkmark"></span>
            </div>
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">
                    <span class="task-difficulty">${difficultyIcons[task.difficulty]} ${task.difficulty}</span>
                    <span class="task-hours">${task.estimatedHours}h</span>
                </div>
                ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
            </div>
            <div class="task-progress-ring">
                <svg class="progress-ring" width="24" height="24">
                    <circle class="progress-ring-background" cx="12" cy="12" r="10"></circle>
                    <circle class="progress-ring-fill" cx="12" cy="12" r="10" 
                            style="stroke-dasharray: ${2 * Math.PI * 10}; 
                                   stroke-dashoffset: ${task.completed ? 0 : 2 * Math.PI * 10}"></circle>
                </svg>
            </div>
        `;
        
        return taskElement;
    }

    // Create timeline controls
    createTimelineControls(timeline) {
        const controls = document.createElement('div');
        controls.className = 'timeline-controls';
        
        controls.innerHTML = `
            <div class="timeline-actions">
                <button class="timeline-btn" onclick="timelineManager.zoomTimeline('${timeline.id}', 'in')">
                    <i class="fas fa-search-plus"></i> Zoom In
                </button>
                <button class="timeline-btn" onclick="timelineManager.zoomTimeline('${timeline.id}', 'out')">
                    <i class="fas fa-search-minus"></i> Zoom Out
                </button>
                <button class="timeline-btn" onclick="timelineManager.exportTimeline('${timeline.id}')">
                    <i class="fas fa-download"></i> Export
                </button>
            </div>
            <div class="timeline-view-options">
                <label class="timeline-option">
                    <input type="checkbox" ${timeline.config.showTasks ? 'checked' : ''} 
                           onchange="timelineManager.toggleTimelineOption('${timeline.id}', 'showTasks', this.checked)">
                    Show Tasks
                </label>
                <label class="timeline-option">
                    <input type="checkbox" ${timeline.config.showMilestones ? 'checked' : ''} 
                           onchange="timelineManager.toggleTimelineOption('${timeline.id}', 'showMilestones', this.checked)">
                    Show Milestones
                </label>
            </div>
        `;
        
        return controls;
    }

    // ===== TIMELINE UPDATES AND ANIMATIONS ===== //

    // Update timeline when plan changes
    updateTimeline(plan) {
        const timeline = this.timelines.get(plan.id);
        if (!timeline) return;
        
        timeline.plan = plan;
        timeline.milestones = this.generateTimelineMilestones(plan);
        
        this.updateTimelineProgress(timeline);
        this.refreshTimelineElements(timeline);
    }

    // Update timeline progress with animation
    updateTimelineProgress(timeline) {
        const progressFill = timeline.element.querySelector('.progress-fill');
        if (!progressFill) return;
        
        const targetProgress = progressFill.dataset.target;
        
        // Animate progress bar
        progressFill.style.transition = `width ${this.animationSettings.duration}ms ${this.animationSettings.easing}`;
        progressFill.style.width = `${targetProgress}%`;
        
        // Update progress text
        const progressText = timeline.element.querySelector('.progress-text');
        if (progressText) {
            this.animateNumber(progressText, 0, targetProgress, this.animationSettings.duration);
        }
    }

    // Refresh timeline elements after updates
    refreshTimelineElements(timeline) {
        const track = timeline.element.querySelector('.timeline-track');
        if (!track) return;
        
        // Remove existing milestones
        track.querySelectorAll('.timeline-milestone').forEach(el => el.remove());
        
        // Add updated milestones
        timeline.milestones.forEach((milestone, index) => {
            const milestoneElement = this.createMilestoneElement(milestone, index, timeline);
            track.appendChild(milestoneElement);
            
            // Animate milestone entry
            setTimeout(() => {
                milestoneElement.classList.add('animate-in');
            }, index * this.animationSettings.stagger);
        });
    }

    // Animate timeline entry
    animateTimelineEntry(timelineElement) {
        const milestones = timelineElement.querySelectorAll('.timeline-milestone');
        const progressFill = timelineElement.querySelector('.progress-fill');
        
        // Animate milestones sequentially
        milestones.forEach((milestone, index) => {
            setTimeout(() => {
                milestone.style.opacity = '0';
                milestone.style.transform = 'translateY(20px)';
                milestone.style.transition = `all ${this.animationSettings.duration}ms ${this.animationSettings.easing}`;
                
                setTimeout(() => {
                    milestone.style.opacity = '1';
                    milestone.style.transform = 'translateY(0)';
                }, 50);
            }, index * this.animationSettings.stagger);
        });
        
        // Animate progress bar
        if (progressFill) {
            setTimeout(() => {
                this.updateTimelineProgress(this.timelines.get(timelineElement.dataset.planId));
            }, milestones.length * this.animationSettings.stagger);
        }
    }

    // Animate task progress when toggled
    animateTaskProgress(planId, task) {
        const timeline = this.timelines.get(planId);
        if (!timeline) return;
        
        const taskElement = timeline.element.querySelector(`[data-task-id="${task.id}"]`);
        if (!taskElement) return;
        
        // Animate task completion
        if (task.completed) {
            taskElement.classList.add('completing');
            
            setTimeout(() => {
                taskElement.classList.remove('completing');
                taskElement.classList.add('completed');
                
                // Animate progress ring
                const progressRing = taskElement.querySelector('.progress-ring-fill');
                if (progressRing) {
                    progressRing.style.transition = 'stroke-dashoffset 0.5s ease-out';
                    progressRing.style.strokeDashoffset = '0';
                }
                
                // Update overall progress
                this.updateTimelineProgress(timeline);
                
            }, 300);
        } else {
            taskElement.classList.remove('completed');
            
            // Reset progress ring
            const progressRing = taskElement.querySelector('.progress-ring-fill');
            if (progressRing) {
                progressRing.style.strokeDashoffset = `${2 * Math.PI * 10}`;
            }
            
            this.updateTimelineProgress(timeline);
        }
    }

    // Celebrate plan completion with animations
    celebratePlanCompletion(planId) {
        const timeline = this.timelines.get(planId);
        if (!timeline) return;
        
        const timelineElement = timeline.element;
        
        // Add celebration class for special styling
        timelineElement.classList.add('celebration');
        
        // Animate all milestones as achieved
        const milestones = timelineElement.querySelectorAll('.timeline-milestone');
        milestones.forEach((milestone, index) => {
            setTimeout(() => {
                milestone.classList.add('achieved', 'celebrate');
            }, index * 200);
        });
        
        // Show completion message
        const celebration = document.createElement('div');
        celebration.className = 'timeline-celebration';
        celebration.innerHTML = `
            <div class="celebration-content">
                <i class="fas fa-trophy celebration-icon"></i>
                <h3>Congratulations!</h3>
                <p>You've completed this study plan!</p>
            </div>
        `;
        
        timelineElement.appendChild(celebration);
        
        // Remove celebration after animation
        setTimeout(() => {
            timelineElement.classList.remove('celebration');
            celebration.remove();
            milestones.forEach(milestone => {
                milestone.classList.remove('celebrate');
            });
        }, 3000);
    }

    // ===== INTERACTIVE FUNCTIONS ===== //

    // Toggle task completion from timeline
    toggleTaskFromTimeline(planId, taskId) {
        if (window.studyPlanManager) {
            window.studyPlanManager.toggleTaskCompletion(planId, taskId);
        }
    }

    // Show milestone details
    showMilestoneDetails(milestone, timeline) {
        // Create modal or tooltip with milestone details
        console.log('Showing milestone details:', milestone);
    }

    // Zoom timeline
    zoomTimeline(planId, direction) {
        const timeline = this.timelines.get(planId);
        if (!timeline) return;
        
        const track = timeline.element.querySelector('.timeline-track');
        const currentScale = parseFloat(track.style.transform?.match(/scale\(([^)]+)\)/)?.[1] || '1');
        
        const zoomFactor = direction === 'in' ? 1.2 : 0.8;
        const newScale = Math.max(0.5, Math.min(3, currentScale * zoomFactor));
        
        track.style.transform = `scale(${newScale})`;
        track.style.transformOrigin = 'center center';
    }

    // Toggle timeline display options
    toggleTimelineOption(planId, option, enabled) {
        const timeline = this.timelines.get(planId);
        if (!timeline) return;
        
        timeline.config[option] = enabled;
        
        // Rebuild timeline with new options
        this.buildTimelineStructure(timeline);
        this.updateTimelineProgress(timeline);
    }

    // Export timeline as image
    exportTimeline(planId) {
        const timeline = this.timelines.get(planId);
        if (!timeline) return;
        
        // Implementation would use html2canvas or similar
        console.log('Exporting timeline:', planId);
    }

    // ===== UTILITY FUNCTIONS ===== //

    // Calculate days remaining until deadline
    calculateDaysRemaining(deadline) {
        if (!deadline) return 0;
        
        const now = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate.getTime() - now.getTime();
        
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Format date for display
    formatDate(date) {
        if (!date) return '';
        
        return new Date(date).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    // Animate number changes
    animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.round(start + (end - start) * progress);
            element.textContent = `${current}%`;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }

    // Remove timeline
    removeTimeline(planId) {
        const timeline = this.timelines.get(planId);
        if (timeline) {
            this.observer.unobserve(timeline.element);
            timeline.element.innerHTML = '';
            this.timelines.delete(planId);
            console.log('Timeline removed:', planId);
        }
    }

    // Get timeline statistics
    getTimelineStats(planId) {
        const timeline = this.timelines.get(planId);
        if (!timeline) return null;
        
        return {
            totalMilestones: timeline.milestones.length,
            achievedMilestones: timeline.milestones.filter(m => m.achieved).length,
            progressPercentage: timeline.plan.progress,
            daysRemaining: this.calculateDaysRemaining(timeline.plan.deadline),
            tasksCompleted: timeline.plan.tasks.filter(t => t.completed).length,
            totalTasks: timeline.plan.tasks.length
        };
    }
}

// Initialize timeline manager
document.addEventListener('DOMContentLoaded', () => {
    window.timelineManager = new TimelineManager();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TimelineManager;
}
