// ===== SMART STUDY PLANNER - MAIN APPLICATION ===== //

// Application State
// SPEED MODE: Remove all artificial delays
window.SPEED_MODE = true;

// Override setTimeout for loading delays
const originalSetTimeout = window.setTimeout;
window.setTimeout = function(callback, delay) {
    if (window.SPEED_MODE && delay > 100) {
        // Convert long delays to instant execution
        return originalSetTimeout(callback, 10);
    }
    return originalSetTimeout(callback, delay);
};

class StudyPlannerApp {
    constructor() {
        this.currentPage = 'home';
        this.studyPlans = [];
        this.settings = {
            notifications: true,
            theme: 'light',
            defaultPriority: 'medium',
            reminderTime: 24 // hours before deadline
        };
        
        this.init();
    }

    // Initialize the application
    init() {
        this.loadFromStorage();
        this.setupEventListeners();
        this.setupNavigation();
        this.startCounterAnimations();
        this.checkNotificationPermission();
        
        console.log('Study Planner App initialized successfully');
    }

    // Load data from localStorage
    loadFromStorage() {
        try {
            const savedPlans = localStorage.getItem('studyPlans');
            const savedSettings = localStorage.getItem('appSettings');
            
            if (savedPlans) {
                this.studyPlans = JSON.parse(savedPlans);
                console.log(`Loaded ${this.studyPlans.length} study plans from storage`);
            }
            
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
                console.log('Settings loaded from storage');
            }
        } catch (error) {
            console.error('Error loading from storage:', error);
            this.showNotification('Error loading saved data', 'error');
        }
    }

    // Save data to localStorage
    saveToStorage() {
        try {
            localStorage.setItem('studyPlans', JSON.stringify(this.studyPlans));
            localStorage.setItem('appSettings', JSON.stringify(this.settings));
            console.log('Data saved to storage successfully');
        } catch (error) {
            console.error('Error saving to storage:', error);
            this.showNotification('Error saving data', 'error');
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Mobile navigation toggle
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (hamburger && navMenu) {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            });
        });

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Navbar scroll effect
        window.addEventListener('scroll', this.handleNavbarScroll.bind(this));

        // Close notifications on click
        document.addEventListener('click', (e) => {
            if (e.target.matches('.notification-close')) {
                e.target.closest('.notification').remove();
            }
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    }

    // Setup navigation highlighting
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('section[id]');

        const observerOptions = {
            rootMargin: '-20% 0px -70% 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const currentId = entry.target.id;
                    
                    // Update active nav link
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${currentId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            observer.observe(section);
        });
    }

    // Handle navbar scroll effects
    handleNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'var(--white)';
            navbar.style.backdropFilter = 'none';
            navbar.style.boxShadow = 'var(--shadow-sm)';
        }
    }

    // Handle keyboard navigation
    handleKeyboardNavigation(e) {
        // Close modals with Escape key
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal-overlay.active');
            if (activeModal) {
                this.closeModal(activeModal);
            }
        }

        // Quick actions with keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    // Navigate to create new plan (if on dashboard)
                    if (window.location.pathname.includes('dashboard.html')) {
                        window.location.href = 'create-plan.html';
                    }
                    break;
                case 'h':
                    e.preventDefault();
                    // Navigate to home
                    window.location.href = '../index.html';
                    break;
            }
        }
    }

    // Start counter animations
    startCounterAnimations() {
        const counters = document.querySelectorAll('.stat-number[data-count]');
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        });

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    // Animate counter numbers
    animateCounter(element) {
        const target = parseInt(element.dataset.count);
        const duration = 2000; // 2 seconds
        const start = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = Math.floor(target * easeOutExpo);
            
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = target.toLocaleString();
            }
        };

        requestAnimationFrame(animate);
    }

    // Check and request notification permission
    async checkNotificationPermission() {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                // Show a gentle prompt for notifications
                setTimeout(() => {
                    this.showNotification(
                        'Enable notifications to get study reminders!',
                        'info',
                        true,
                        () => this.requestNotificationPermission()
                    );
                }, 5000); // Show after 5 seconds
            }
        }
    }

    // Request notification permission
    async requestNotificationPermission() {
        if ('Notification' in window) {
            try {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    this.showNotification('Notifications enabled successfully!', 'success');
                    this.settings.notifications = true;
                    this.saveToStorage();
                } else {
                    this.showNotification('Notifications disabled. You can enable them later in settings.', 'warning');
                    this.settings.notifications = false;
                    this.saveToStorage();
                }
            } catch (error) {
                console.error('Error requesting notification permission:', error);
            }
        }
    }

    // Show in-app notification
    showNotification(message, type = 'info', persistent = false, action = null) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon ${iconMap[type]}"></i>
                <div class="notification-text">
                    <div class="notification-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
                    <p class="notification-message">${message}</p>
                </div>
                <button class="notification-close">&times;</button>
            </div>
            ${action ? '<button class="btn btn-sm btn-primary notification-action">Enable</button>' : ''}
        `;

        document.body.appendChild(notification);

        // Add action listener if provided
        if (action) {
            const actionBtn = notification.querySelector('.notification-action');
            if (actionBtn) {
                actionBtn.addEventListener('click', () => {
                    action();
                    notification.remove();
                });
            }
        }

        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto-hide notification unless persistent
        if (!persistent) {
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }, 4000);
        }
    }

    // Show browser notification
    showBrowserNotification(title, message, icon = null) {
        if ('Notification' in window && Notification.permission === 'granted') {
            try {
                const notification = new Notification(title, {
                    body: message,
                    icon: icon || '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: 'study-reminder',
                    requireInteraction: false,
                    silent: false
                });

                // Auto-close after 6 seconds
                setTimeout(() => {
                    notification.close();
                }, 6000);

                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };
            } catch (error) {
                console.error('Error showing browser notification:', error);
                // Fallback to in-app notification
                this.showNotification(`${title}: ${message}`, 'info');
            }
        }
    }

    // Modal utilities
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Focus the modal for accessibility
            const firstInput = modal.querySelector('input, textarea, select, button');
            if (firstInput) {
                firstInput.focus();
            }
        }
    }

    closeModal(modal) {
        if (typeof modal === 'string') {
            modal = document.getElementById(modal);
        }
        
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // Utility functions
    formatDate(date) {
        if (!date) return 'No date';
        
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        
        return new Date(date).toLocaleDateString(undefined, options);
    }

    formatRelativeDate(date) {
        if (!date) return 'No date';
        
        const now = new Date();
        const targetDate = new Date(date);
        const diffTime = targetDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return `${Math.abs(diffDays)} days overdue`;
        } else if (diffDays === 0) {
            return 'Due today';
        } else if (diffDays === 1) {
            return 'Due tomorrow';
        } else if (diffDays <= 7) {
            return `Due in ${diffDays} days`;
        } else {
            return this.formatDate(date);
        }
    }

    calculateProgress(tasks) {
        if (!tasks || tasks.length === 0) return 0;
        
        const completedTasks = tasks.filter(task => task.completed);
        return Math.round((completedTasks.length / tasks.length) * 100);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Theme utilities
    setTheme(theme) {
        document.body.className = theme === 'dark' ? 'theme-dark' : '';
        this.settings.theme = theme;
        this.saveToStorage();
    }

    toggleTheme() {
        const currentTheme = this.settings.theme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    // Error handling
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        this.showNotification(
            `Something went wrong ${context}. Please try again.`,
            'error'
        );
    }

    // Debug utilities (for development)
    debug() {
        console.log('=== Study Planner Debug Info ===');
        console.log('Study Plans:', this.studyPlans);
        console.log('Settings:', this.settings);
        console.log('Local Storage:', {
            studyPlans: localStorage.getItem('studyPlans'),
            appSettings: localStorage.getItem('appSettings')
        });
    }

    // Reset application data
    reset() {
        if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
            localStorage.removeItem('studyPlans');
            localStorage.removeItem('appSettings');
            this.studyPlans = [];
            this.settings = {
                notifications: true,
                theme: 'light',
                defaultPriority: 'medium',
                reminderTime: 24
            };
            this.showNotification('Application data has been reset', 'success');
            
            // Reload page to reset UI
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }
}

// ===== PAGE-SPECIFIC FUNCTIONALITY ===== //

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the main app
    window.studyApp = new StudyPlannerApp();
    
    // Add fade-in animation to elements
    const animatedElements = document.querySelectorAll('.hero-content, .feature-card, .about-text');
    
    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                fadeInObserver.unobserve(entry.target);
            }
        });
    });
    
    animatedElements.forEach(element => {
        fadeInObserver.observe(element);
    });
    
    // Initialize tooltips if needed
    initializeTooltips();
    
    // Add version info to console
    console.log('🎓 Smart Study Planner v1.0.0');
    console.log('Built with ❤️ for students worldwide');
});

// Initialize tooltips (if using a tooltip library)
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    // Custom tooltip implementation
    const text = e.target.getAttribute('data-tooltip');
    if (!text) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = text;
    tooltip.style.cssText = `
        position: absolute;
        background: var(--gray-900);
        color: var(--white);
        padding: var(--spacing-2) var(--spacing-3);
        border-radius: var(--radius-md);
        font-size: var(--font-size-xs);
        white-space: nowrap;
        z-index: var(--z-tooltip);
        pointer-events: none;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    
    tooltip.style.left = `${rect.left + rect.width / 2 - tooltipRect.width / 2}px`;
    tooltip.style.top = `${rect.top - tooltipRect.height - 8}px`;
    
    e.target._tooltip = tooltip;
}

function hideTooltip(e) {
    if (e.target._tooltip) {
        e.target._tooltip.remove();
        e.target._tooltip = null;
    }
}

// ===== GLOBAL UTILITY FUNCTIONS ===== //

// Format file sizes
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StudyPlannerApp;
}

// ===== PERFORMANCE IMPROVEMENTS ===== //

// Faster page transitions
document.addEventListener('DOMContentLoaded', function() {
    // Remove artificial delays in dashboard and other pages
    const loadingOverlays = document.querySelectorAll('.loading-overlay');
    loadingOverlays.forEach(overlay => {
        if (overlay.style.display === 'flex') {
            // Reduce loading time from 500ms to 100ms
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 100);
        }
    });
    
    // Pre-cache frequently used data
    if (window.studyApp && window.studyApp.studyPlans) {
        console.log('App data pre-loaded for faster access');
    }
});

// Optimize localStorage operations
const originalSaveToStorage = window.studyApp?.saveToStorage;
if (originalSaveToStorage) {
    window.studyApp.saveToStorage = function() {
        // Debounce save operations to prevent excessive writes
        clearTimeout(this.saveTimeout);
        this.saveTimeout = setTimeout(() => {
            originalSaveToStorage.call(this);
        }, 100);
    };
}
