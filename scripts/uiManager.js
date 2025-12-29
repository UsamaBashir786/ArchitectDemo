// UI Manager - Handles all UI updates and rendering
class UIManager {
    constructor() {
        this.currentPage = 'dashboard';
        this.projectChart = null;
        this.clientTable = null;
        this.projectTable = null;
        this.revenueChart = null;
        this.clientGrowthChart = null;
        this.projectDistributionChart = null;
        this.monthlyFeedbackChart = null;
    }
    
    // Initialize the UI
    async init() {
        // Load components
        await this.loadComponents();
        
        // Initialize icons
        lucide.createIcons();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Load initial page
        await this.loadPage('dashboard');
        
        // Initialize Flatpickr
        this.initDatePickers();
        
        // Start demo updates
        this.startDemoUpdates();
        
        console.log('UI Manager initialized');
    }
    
    // Load HTML components
    async loadComponents() {
        try {
            const [sidebar, header] = await Promise.all([
                fetch('./components/sidebar.html').then(r => r.text()),
                fetch('./components/header.html').then(r => r.text())
            ]);
            
            document.getElementById('sidebar-container').innerHTML = sidebar;
            document.getElementById('header-container').innerHTML = header;
            
            lucide.createIcons();
        } catch (error) {
            console.error('Error loading components:', error);
        }
    }
    
    // Setup event listeners
    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            // Navigation links
            if (e.target.closest('.nav-link')) {
                e.preventDefault();
                const page = e.target.closest('.nav-link').dataset.page;
                this.loadPage(page);
            }
            
            // Tab buttons
            if (e.target.closest('.tab-button')) {
                const button = e.target.closest('.tab-button');
                const tabId = button.dataset.tab;
                this.switchTab(tabId);
            }
            
            // Modal triggers
            if (e.target.closest('#add-client-btn')) {
                this.openModal('client');
            }
            if (e.target.closest('#add-project-btn')) {
                this.openModal('project');
            }
            if (e.target.closest('#add-feedback-btn')) {
                this.openModal('feedback');
            }
            
            // Modal cancel buttons
            if (e.target.closest('[data-modal-close]')) {
                const modalType = e.target.closest('[data-modal-close]').dataset.modalClose;
                this.closeModal(modalType);
            }
            
            // Form submissions
            if (e.target.closest('#client-form')) {
                e.preventDefault();
                this.handleAddClient(e);
            }
            if (e.target.closest('#project-form')) {
                e.preventDefault();
                this.handleAddProject(e);
            }
            if (e.target.closest('#feedback-form')) {
                e.preventDefault();
                this.handleAddFeedback(e);
            }
            
            // Notification panel
            if (e.target.closest('#notification-btn')) {
                this.toggleNotificationPanel();
            }
            
            // Mobile menu
            if (e.target.closest('#mobile-menu-btn')) {
                this.toggleMobileMenu();
            }
            
            // Rating stars
            if (e.target.closest('.rating-star')) {
                const star = e.target.closest('.rating-star');
                const rating = parseInt(star.dataset.rating);
                this.setRatingStars(rating);
            }
        });
        
        // Close notification panel when clicking outside
        document.addEventListener('click', (e) => {
            const notificationPanel = document.getElementById('notification-panel');
            const notificationBtn = document.getElementById('notification-btn');
            
            if (notificationPanel && !notificationPanel.contains(e.target) && !notificationBtn.contains(e.target)) {
                notificationPanel.classList.add('hidden');
            }
        });
        
        // Progress slider
        document.addEventListener('input', (e) => {
            if (e.target.id === 'project-progress') {
                const value = e.target.value;
                document.getElementById('progress-value').textContent = `${value}%`;
            }
        });
        
        // Chart period changes
        document.addEventListener('change', (e) => {
            if (e.target.id === 'chart-period' && this.currentPage === 'dashboard') {
                this.initProjectChart();
            }
            if (e.target.id === 'revenue-period' && this.currentPage === 'analytics') {
                this.initRevenueChart();
            }
        });
    }
    
    // Load a page
    async loadPage(page) {
        this.currentPage = page;
        
        // Update page title
        document.getElementById('page-title').textContent = this.getPageTitle(page);
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.dataset.page === page) {
                link.classList.add('bg-blue-50', 'text-blue-700');
                link.classList.remove('text-gray-600', 'hover:bg-gray-100');
            } else {
                link.classList.remove('bg-blue-50', 'text-blue-700');
                link.classList.add('text-gray-600', 'hover:bg-gray-100');
            }
        });
        
        // Load page content
        let content = '';
        
        switch (page) {
            case 'dashboard':
                content = this.getDashboardContent();
                break;
            case 'clients':
                content = this.getClientsContent();
                break;
            case 'projects':
                content = this.getProjectsContent();
                break;
            case 'feedback':
                content = this.getFeedbackContent();
                break;
            case 'analytics':
                content = this.getAnalyticsContent();
                break;
            default:
                content = this.getDashboardContent();
        }
        
        document.getElementById('main-content').innerHTML = content;
        
        // Initialize page-specific components
        await this.initPageComponents(page);
        
        // Update icons
        lucide.createIcons();
    }
    
    // Get page title
    getPageTitle(page) {
        const titles = {
            dashboard: 'Dashboard',
            clients: 'Client Management',
            projects: 'Project Management',
            feedback: 'Client Feedback',
            analytics: 'Analytics'
        };
        return titles[page] || 'Dashboard';
    }
    
    // Get dashboard content
    getDashboardContent() {
        const stats = dataManager.getStats();
        const unreadCount = dataManager.getUnreadNotificationCount();
        
        return `
            <!-- Stats Overview -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div class="stat-card card p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-gray-700">Total Clients</h3>
                        <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <i data-lucide="users" class="w-6 h-6 text-blue-600"></i>
                        </div>
                    </div>
                    <p class="text-3xl font-bold text-gray-800 mb-2">${stats.totalClients}</p>
                    <p class="text-sm text-green-600 flex items-center">
                        <i data-lucide="trending-up" class="w-4 h-4 mr-1"></i>
                        <span>+${Math.floor(stats.totalClients * 0.12)} from last month</span>
                    </p>
                </div>
                
                <div class="stat-card card p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-gray-700">Active Projects</h3>
                        <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <i data-lucide="folder-kanban" class="w-6 h-6 text-green-600"></i>
                        </div>
                    </div>
                    <p class="text-3xl font-bold text-gray-800 mb-2">${stats.totalProjects}</p>
                    <p class="text-sm text-blue-600 flex items-center">
                        <i data-lucide="clipboard-check" class="w-4 h-4 mr-1"></i>
                        <span>${stats.completedProjects} projects completed</span>
                    </p>
                </div>
                
                <div class="stat-card card p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-gray-700">Pending Feedback</h3>
                        <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                            <i data-lucide="message-square" class="w-6 h-6 text-amber-600"></i>
                        </div>
                    </div>
                    <p class="text-3xl font-bold text-gray-800 mb-2">${stats.pendingFeedback}</p>
                    <p class="text-sm text-amber-600 flex items-center">
                        <i data-lucide="clock" class="w-4 h-4 mr-1"></i>
                        <span>Awaiting client responses</span>
                    </p>
                </div>
                
                <div class="stat-card card p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-medium text-gray-700">Total Revenue</h3>
                        <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <i data-lucide="dollar-sign" class="w-6 h-6 text-purple-600"></i>
                        </div>
                    </div>
                    <p class="text-3xl font-bold text-gray-800 mb-2">$${(stats.totalRevenue / 1000).toFixed(0)}K</p>
                    <p class="text-sm text-purple-600 flex items-center">
                        <i data-lucide="trending-up" class="w-4 h-4 mr-1"></i>
                        <span>+18% from last quarter</span>
                    </p>
                </div>
            </div>
            
            <!-- Charts and Activity -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <!-- Project Status Chart -->
                <div class="card p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-medium text-gray-800">Project Status</h3>
                        <select id="chart-period" class="form-input text-sm w-32">
                            <option value="all">All Time</option>
                            <option value="month">This Month</option>
                            <option value="quarter">This Quarter</option>
                        </select>
                    </div>
                    <div style="position: relative; width: 100%; min-height: 350px;">
                        <div id="project-chart" style="width: 100%; height: 350px;"></div>
                    </div>
                </div>
                
                <!-- Recent Activity -->
                <div class="card p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-lg font-medium text-gray-800">Recent Activity</h3>
                        <span class="text-sm text-gray-500">Last 7 days</span>
                    </div>
                    <div id="activity-feed" class="space-y-4">
                        <!-- Activity will be loaded by JS -->
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="card p-6 mb-8">
                <h3 class="text-lg font-medium text-gray-800 mb-6">Quick Actions</h3>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onclick="uiManager.openModal('client')" class="card p-4 text-left hover-lift transition-all duration-200 border border-dashed border-gray-300 hover:border-blue-400">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <i data-lucide="user-plus" class="w-5 h-5 text-blue-600"></i>
                            </div>
                            <div>
                                <h4 class="font-medium text-gray-800">Add New Client</h4>
                                <p class="text-sm text-gray-600">Register a new client</p>
                            </div>
                        </div>
                    </button>
                    
                    <button onclick="uiManager.openModal('project')" class="card p-4 text-left hover-lift transition-all duration-200 border border-dashed border-gray-300 hover:border-green-400">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                <i data-lucide="folder-plus" class="w-5 h-5 text-green-600"></i>
                            </div>
                            <div>
                                <h4 class="font-medium text-gray-800">Create Project</h4>
                                <p class="text-sm text-gray-600">Start a new project</p>
                            </div>
                        </div>
                    </button>
                    
                    <button onclick="uiManager.openModal('feedback')" class="card p-4 text-left hover-lift transition-all duration-200 border border-dashed border-gray-300 hover:border-amber-400">
                        <div class="flex items-center">
                            <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                                <i data-lucide="message-square-plus" class="w-5 h-5 text-amber-600"></i>
                            </div>
                            <div>
                                <h4 class="font-medium text-gray-800">Record Feedback</h4>
                                <p class="text-sm text-gray-600">Add client feedback</p>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
            
            <!-- Recent Projects -->
            <div class="card p-6">
                <div class="flex items-center justify-between mb-6">
                    <h3 class="text-lg font-medium text-gray-800">Recent Projects</h3>
                    <a href="#" data-page="projects" class="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center nav-link">
                        View All
                        <i data-lucide="arrow-right" class="w-4 h-4 ml-1"></i>
                    </a>
                </div>
                <div id="recent-projects">
                    <!-- Recent projects will be loaded by JS -->
                </div>
            </div>
        `;
    }
    
    // Get clients content
    getClientsContent() {
        return `
            <div class="card overflow-hidden">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 class="text-lg font-medium text-gray-800">Client Management</h3>
                            <p class="text-sm text-gray-600 mt-1">Manage all your clients and their information</p>
                        </div>
                        <button id="add-client-btn" class="btn-primary flex items-center justify-center">
                            <i data-lucide="user-plus" class="w-4 h-4 mr-2"></i>
                            Add Client
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <div id="clients-table-container">
                        <!-- Client table will be loaded here -->
                    </div>
                </div>
            </div>
        `;
    }
    
    // Get projects content
    getProjectsContent() {
        return `
            <div class="card overflow-hidden">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 class="text-lg font-medium text-gray-800">Project Management</h3>
                            <p class="text-sm text-gray-600 mt-1">Track and manage all ongoing projects</p>
                        </div>
                        <button id="add-project-btn" class="btn-primary flex items-center justify-center">
                            <i data-lucide="folder-plus" class="w-4 h-4 mr-2"></i>
                            Add Project
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <div id="projects-table-container">
                        <!-- Project table will be loaded here -->
                    </div>
                </div>
            </div>
        `;
    }
    
    // Get feedback content
    getFeedbackContent() {
        return `
            <div class="card overflow-hidden">
                <div class="p-6 border-b border-gray-200">
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h3 class="text-lg font-medium text-gray-800">Client Feedback</h3>
                            <p class="text-sm text-gray-600 mt-1">View and manage client feedback for projects</p>
                        </div>
                        <button id="add-feedback-btn" class="btn-primary flex items-center justify-center">
                            <i data-lucide="message-square-plus" class="w-4 h-4 mr-2"></i>
                            Add Feedback
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <div id="feedback-container" class="space-y-6">
                        <!-- Feedback cards will be loaded here -->
                    </div>
                </div>
            </div>
        `;
    }
    
    // Get analytics content
    getAnalyticsContent() {
        const activeClients = dataManager.data.clients.filter(c => c.status === 'active').length;
        const positiveReviews = dataManager.data.feedback.filter(f => f.rating >= 4).length;
        const neutralReviews = dataManager.data.feedback.filter(f => f.rating === 3).length;
        const negativeReviews = dataManager.data.feedback.filter(f => f.rating <= 2).length;
        
        // Calculate average project duration from actual data
        const projects = dataManager.data.projects;
        const avgDuration = projects.length > 0 
            ? (projects.reduce((sum, p) => sum + (p.duration || 4.2), 0) / projects.length).toFixed(1)
            : '4.2';
        
        // Calculate client satisfaction from feedback
        const feedbacks = dataManager.data.feedback;
        const avgSatisfaction = feedbacks.length > 0
            ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
            : '4.6';
        
        // Calculate on-time delivery rate
        const completedProjects = projects.filter(p => p.status === 'completed');
        const onTimeProjects = completedProjects.filter(p => !p.delayed).length;
        const onTimeRate = completedProjects.length > 0
            ? Math.round((onTimeProjects / completedProjects.length) * 100)
            : 92;

        return `
            <div class="space-y-6">
                <!-- Stats Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div class="card p-6">
                        <h3 class="text-lg font-medium text-gray-800 mb-2">Active Clients</h3>
                        <p class="text-3xl font-bold text-gray-800">${activeClients}</p>
                        <p class="text-sm text-gray-600 mt-2">Currently engaged with projects</p>
                    </div>
                    
                    <div class="card p-6">
                        <h3 class="text-lg font-medium text-gray-800 mb-2">Avg. Project Duration</h3>
                        <p class="text-3xl font-bold text-gray-800">${avgDuration}</p>
                        <p class="text-sm text-gray-600 mt-2">Months per project</p>
                    </div>
                    
                    <div class="card p-6">
                        <h3 class="text-lg font-medium text-gray-800 mb-2">Client Satisfaction</h3>
                        <p class="text-3xl font-bold text-gray-800">${avgSatisfaction}</p>
                        <p class="text-sm text-gray-600 mt-2">Average rating out of 5</p>
                    </div>
                    
                    <div class="card p-6">
                        <h3 class="text-lg font-medium text-gray-800 mb-2">On-Time Delivery</h3>
                        <p class="text-3xl font-bold text-gray-800">${onTimeRate}%</p>
                        <p class="text-sm text-gray-600 mt-2">Projects delivered on schedule</p>
                    </div>
                </div>
                
                <!-- Charts with fixed containers -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Monthly Revenue Chart -->
                    <div class="card p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-lg font-medium text-gray-800">Monthly Revenue</h3>
                            <select class="form-input text-sm w-32" id="revenue-period">
                                <option value="yearly">This Year</option>
                                <option value="quarterly">This Quarter</option>
                                <option value="monthly">This Month</option>
                            </select>
                        </div>
                        <!-- Fixed height container -->
                        <div style="position: relative; width: 100%; min-height: 300px;">
                            <div id="revenue-chart" style="width: 100%; height: 300px;"></div>
                        </div>
                    </div>
                    
                    <!-- Client Growth Chart -->
                    <div class="card p-6">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-lg font-medium text-gray-800">Client Growth</h3>
                            <span class="text-sm text-gray-500">Last 12 months</span>
                        </div>
                        <!-- Fixed height container -->
                        <div style="position: relative; width: 100%; min-height: 300px;">
                            <div id="client-growth-chart" style="width: 100%; height: 300px;"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Additional Charts -->
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Project Status Distribution -->
                    <div class="card p-6">
                        <h3 class="text-lg font-medium text-gray-800 mb-6">Project Status Distribution</h3>
                        <!-- Fixed height container -->
                        <div style="position: relative; width: 100%; min-height: 300px;">
                            <div id="project-distribution-chart" style="width: 100%; height: 300px;"></div>
                        </div>
                    </div>
                    
                    <!-- Feedback by Month -->
                    <div class="card p-6">
                        <h3 class="text-lg font-medium text-gray-800 mb-6">Monthly Feedback</h3>
                        <!-- Fixed height container -->
                        <div style="position: relative; width: 100%; min-height: 300px;">
                            <div id="monthly-feedback-chart" style="width: 100%; height: 300px;"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Feedback Summary -->
                <div class="card p-6">
                    <h3 class="text-lg font-medium text-gray-800 mb-6">Feedback Summary</h3>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div class="text-center p-6 bg-green-50 rounded-lg">
                            <div class="text-4xl font-bold text-green-600 mb-2">${positiveReviews}</div>
                            <h4 class="font-medium text-gray-800">Positive Reviews</h4>
                            <p class="text-sm text-gray-600 mt-1">4+ star ratings</p>
                        </div>
                        
                        <div class="text-center p-6 bg-amber-50 rounded-lg">
                            <div class="text-4xl font-bold text-amber-600 mb-2">${neutralReviews}</div>
                            <h4 class="font-medium text-gray-800">Neutral Reviews</h4>
                            <p class="text-sm text-gray-600 mt-1">3 star ratings</p>
                        </div>
                        
                        <div class="text-center p-6 bg-red-50 rounded-lg">
                            <div class="text-4xl font-bold text-red-600 mb-2">${negativeReviews}</div>
                            <h4 class="font-medium text-gray-800">Needs Improvement</h4>
                            <p class="text-sm text-gray-600 mt-1">1-2 star ratings</p>
                        </div>
                    </div>
                </div>
                
                <!-- Performance Metrics -->
                <div class="card p-6">
                    <h3 class="text-lg font-medium text-gray-800 mb-6">Performance Metrics</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div class="text-center p-4 border border-gray-200 rounded-lg">
                            <div class="text-2xl font-bold text-blue-600 mb-1">$${(dataManager.getStats().totalRevenue / 1000000).toFixed(1)}M</div>
                            <p class="text-sm text-gray-600">Total Revenue</p>
                        </div>
                        <div class="text-center p-4 border border-gray-200 rounded-lg">
                            <div class="text-2xl font-bold text-green-600 mb-1">${dataManager.data.projects.length}</div>
                            <p class="text-sm text-gray-600">Total Projects</p>
                        </div>
                        <div class="text-center p-4 border border-gray-200 rounded-lg">
                            <div class="text-2xl font-bold text-purple-600 mb-1">${dataManager.data.clients.length}</div>
                            <p class="text-sm text-gray-600">Total Clients</p>
                        </div>
                        <div class="text-center p-4 border border-gray-200 rounded-lg">
                            <div class="text-2xl font-bold text-amber-600 mb-1">${dataManager.data.feedback.length}</div>
                            <p class="text-sm text-gray-600">Total Feedback</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Initialize page components
    async initPageComponents(page) {
        switch (page) {
            case 'dashboard':
                await this.initDashboard();
                break;
            case 'clients':
                await this.initClientsPage();
                break;
            case 'projects':
                await this.initProjectsPage();
                break;
            case 'feedback':
                await this.initFeedbackPage();
                break;
            case 'analytics':
                await this.initAnalyticsPage();
                break;
        }
    }
    
    // Initialize dashboard
    async initDashboard() {
        // Initialize chart
        this.initProjectChart();
        
        // Load activity feed
        this.renderActivityFeed();
        
        // Load recent projects
        this.renderRecentProjects();
        
        // Load notifications
        this.renderNotifications();
        
        // Update notification badge
        this.updateNotificationBadge();
        
        // Chart resize handler add karein
        window.addEventListener('resize', () => {
            if (this.projectChart && this.currentPage === 'dashboard') {
                setTimeout(() => {
                    this.projectChart.updateSeries([...this.projectChart.w.config.series]);
                }, 300);
            }
        });
        
        // Page load pe bhi resize trigger karein
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 500);
    }
    
    // Initialize clients page
    async initClientsPage() {
        this.renderClientTable();
    }
    
    // Initialize projects page
    async initProjectsPage() {
        this.renderProjectTable();
    }
    
    // Initialize feedback page
    async initFeedbackPage() {
        this.renderFeedbackCards();
    }
    
    // Initialize analytics page
    async initAnalyticsPage() {
        // Wait for DOM to be ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Initialize all charts with proper timing
        setTimeout(() => {
            this.initAnalyticsCharts();
            // Trigger resize to fix chart positioning
            window.dispatchEvent(new Event('resize'));
        }, 200);
    }
    
    // Switch tab
    switchTab(tabId) {
        // Update active tab button
        document.querySelectorAll('.tab-button').forEach(button => {
            if (button.dataset.tab === tabId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Show active tab content
        document.querySelectorAll('.tab-content').forEach(tab => {
            if (tab.id === `${tabId}-tab`) {
                tab.classList.remove('hidden');
            } else {
                tab.classList.add('hidden');
            }
        });
    }
    
    // Open modal
    openModal(modalType) {
        // Create modal if it doesn't exist
        if (!document.getElementById(`${modalType}-modal`)) {
            this.createModal(modalType);
        }
        
        const modal = document.getElementById(`${modalType}-modal`);
        modal.classList.add('active');
        
        // Populate dropdowns if needed
        if (modalType === 'project' || modalType === 'feedback') {
            this.populateClientSelect();
        }
        
        if (modalType === 'feedback') {
            this.populateProjectSelect();
        }
        
        // Initialize date picker
        if (modalType === 'project') {
            this.initDatePickers();
        }
        
        // Reset form
        const form = modal.querySelector('form');
        if (form) form.reset();
        
        // Reset rating stars for feedback modal
        if (modalType === 'feedback') {
            this.setRatingStars(5);
        }
        
        // Reset progress value for project modal
        if (modalType === 'project') {
            document.getElementById('progress-value').textContent = '0%';
        }
    }
    
    // Close modal
    closeModal(modalType) {
        const modal = document.getElementById(`${modalType}-modal`);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    // Create modal HTML
    createModal(modalType) {
        let modalHTML = '';
        
        if (modalType === 'client') {
            modalHTML = `
                <div id="client-modal" class="modal-overlay">
                    <div class="modal-content">
                        <div class="p-6 border-b">
                            <h3 class="text-lg font-medium text-gray-800">Add New Client</h3>
                        </div>
                        <form id="client-form" class="p-6 space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
                                <input type="text" id="client-name" class="form-input" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input type="email" id="client-email" class="form-input" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                                <input type="text" id="client-company" class="form-input" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                                <input type="tel" id="client-phone" class="form-input" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select id="client-status" class="form-input">
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                            <div class="flex justify-end space-x-3 pt-4">
                                <button type="button" data-modal-close="client" class="btn-secondary">Cancel</button>
                                <button type="submit" class="btn-primary">Add Client</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        } else if (modalType === 'project') {
            modalHTML = `
                <div id="project-modal" class="modal-overlay">
                    <div class="modal-content">
                        <div class="p-6 border-b">
                            <h3 class="text-lg font-medium text-gray-800">Add New Project</h3>
                        </div>
                        <form id="project-form" class="p-6 space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                                <input type="text" id="project-name" class="form-input" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                                <select id="project-client" class="form-input" required>
                                    <option value="">Select a client</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                                <input type="text" id="project-due-date" class="form-input" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select id="project-status" class="form-input">
                                    <option value="planning">Planning</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="delayed">Delayed</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                                <input type="range" id="project-progress" min="0" max="100" class="w-full" value="0">
                                <div class="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>0%</span>
                                    <span id="progress-value">0%</span>
                                    <span>100%</span>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                                <input type="number" id="project-budget" class="form-input" min="0" step="1000">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea id="project-description" rows="3" class="form-input"></textarea>
                            </div>
                            <div class="flex justify-end space-x-3 pt-4">
                                <button type="button" data-modal-close="project" class="btn-secondary">Cancel</button>
                                <button type="submit" class="btn-primary">Add Project</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        } else if (modalType === 'feedback') {
            modalHTML = `
                <div id="feedback-modal" class="modal-overlay">
                    <div class="modal-content">
                        <div class="p-6 border-b">
                            <h3 class="text-lg font-medium text-gray-800">Add Client Feedback</h3>
                        </div>
                        <form id="feedback-form" class="p-6 space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Client *</label>
                                <select id="feedback-client" class="form-input" required>
                                    <option value="">Select a client</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                                <select id="feedback-project" class="form-input" required>
                                    <option value="">Select a project</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                <div class="flex space-x-1" id="rating-stars">
                                    <i data-lucide="star" class="w-6 h-6 text-gray-300 rating-star cursor-pointer" data-rating="1"></i>
                                    <i data-lucide="star" class="w-6 h-6 text-gray-300 rating-star cursor-pointer" data-rating="2"></i>
                                    <i data-lucide="star" class="w-6 h-6 text-gray-300 rating-star cursor-pointer" data-rating="3"></i>
                                    <i data-lucide="star" class="w-6 h-6 text-gray-300 rating-star cursor-pointer" data-rating="4"></i>
                                    <i data-lucide="star" class="w-6 h-6 text-gray-300 rating-star cursor-pointer" data-rating="5"></i>
                                </div>
                                <input type="hidden" id="feedback-rating" value="5">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Comments *</label>
                                <textarea id="feedback-comments" rows="4" class="form-input" placeholder="What did the client say about the project?" required></textarea>
                            </div>
                            <div class="flex justify-end space-x-3 pt-4">
                                <button type="button" data-modal-close="feedback" class="btn-secondary">Cancel</button>
                                <button type="submit" class="btn-primary">Submit Feedback</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        }
        
        document.getElementById('modal-container').innerHTML += modalHTML;
    }
    
    // Handle add client
    async handleAddClient(e) {
        const form = e.target;
        const formData = new FormData(form);
        
        const clientData = {
            name: formData.get('client-name') || document.getElementById('client-name').value,
            email: formData.get('client-email') || document.getElementById('client-email').value,
            company: formData.get('client-company') || document.getElementById('client-company').value,
            phone: formData.get('client-phone') || document.getElementById('client-phone').value,
            status: document.getElementById('client-status').value
        };
        
        const result = dataManager.addClient(clientData);
        if (result) {
            this.closeModal('client');
            if (this.currentPage === 'clients') {
                this.renderClientTable();
            } else if (this.currentPage === 'dashboard') {
                this.updateDashboardStats();
            }
        }
    }
    
    // Handle add project
    async handleAddProject(e) {
        const form = e.target;
        const formData = new FormData(form);
        
        const projectData = {
            name: formData.get('project-name') || document.getElementById('project-name').value,
            clientId: document.getElementById('project-client').value,
            dueDate: document.getElementById('project-due-date').value,
            status: document.getElementById('project-status').value,
            progress: document.getElementById('project-progress').value,
            budget: document.getElementById('project-budget').value ? parseInt(document.getElementById('project-budget').value) : 0,
            description: document.getElementById('project-description').value
        };
        
        const result = dataManager.addProject(projectData);
        if (result) {
            this.closeModal('project');
            if (this.currentPage === 'projects') {
                this.renderProjectTable();
            } else if (this.currentPage === 'dashboard') {
                this.updateDashboardStats();
                this.renderRecentProjects();
                this.initProjectChart();
            }
        }
    }
    
    // Handle add feedback
    async handleAddFeedback(e) {
        const form = e.target;
        const formData = new FormData(form);
        
        const feedbackData = {
            clientId: document.getElementById('feedback-client').value,
            projectId: document.getElementById('feedback-project').value,
            rating: document.getElementById('feedback-rating').value,
            comments: document.getElementById('feedback-comments').value
        };
        
        const result = dataManager.addFeedback(feedbackData);
        if (result) {
            this.closeModal('feedback');
            if (this.currentPage === 'feedback') {
                this.renderFeedbackCards();
            } else if (this.currentPage === 'dashboard') {
                this.updateDashboardStats();
            }
        }
    }
    
    // Populate client select dropdown
    populateClientSelect() {
        const clientSelects = document.querySelectorAll('select[id$="client"]');
        
        clientSelects.forEach(select => {
            // Clear existing options except the first one
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            // Add client options
            dataManager.data.clients.forEach(client => {
                const option = document.createElement('option');
                option.value = client.id;
                option.textContent = `${client.name} (${client.company})`;
                select.appendChild(option);
            });
        });
    }
    
    // Populate project select dropdown
    populateProjectSelect() {
        const projectSelect = document.getElementById('feedback-project');
        if (!projectSelect) return;
        
        // Clear existing options except the first one
        while (projectSelect.options.length > 1) {
            projectSelect.remove(1);
        }
        
        // Add project options
        dataManager.data.projects.forEach(project => {
            const option = document.createElement('option');
            option.value = project.id;
            option.textContent = `${project.name} (${project.clientName})`;
            projectSelect.appendChild(option);
        });
    }
    
    // Set rating stars
    setRatingStars(rating) {
        document.getElementById('feedback-rating').value = rating;
        
        document.querySelectorAll('.rating-star').forEach(star => {
            const starRating = parseInt(star.dataset.rating);
            if (starRating <= rating) {
                star.classList.remove('text-gray-300');
                star.classList.add('text-amber-500', 'fill-amber-500');
            } else {
                star.classList.remove('text-amber-500', 'fill-amber-500');
                star.classList.add('text-gray-300');
            }
        });
    }
    
    // Initialize date pickers
    initDatePickers() {
        const dateInputs = document.querySelectorAll('input[type="text"].form-input[id$="date"]');
        dateInputs.forEach(input => {
            if (!input.classList.contains('flatpickr-initialized')) {
                flatpickr(input, {
                    dateFormat: "Y-m-d",
                    minDate: "today",
                    onChange: function(selectedDates, dateStr, instance) {
                        input.value = dateStr;
                    }
                });
                input.classList.add('flatpickr-initialized');
            }
        });
    }
    
    // Toggle notification panel
    toggleNotificationPanel() {
        const panel = document.getElementById('notification-panel');
        panel.classList.toggle('hidden');
        
        if (!panel.classList.contains('hidden')) {
            // Mark all notifications as read when opening panel
            dataManager.markAllNotificationsAsRead();
            this.updateNotificationBadge();
        }
    }
    
    // Toggle mobile menu
    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('hidden');
    }
    
    // Update notification badge
    updateNotificationBadge() {
        const badge = document.getElementById('notification-badge');
        const unreadCount = dataManager.getUnreadNotificationCount();
        
        if (unreadCount > 0) {
            badge.classList.remove('hidden');
            badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        } else {
            badge.classList.add('hidden');
        }
    }
    
    // Render notifications
    renderNotifications() {
        const container = document.getElementById('notifications-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (dataManager.data.notifications.length === 0) {
            container.innerHTML = `
                <div class="p-4 text-center text-gray-500">
                    <i data-lucide="bell-off" class="w-8 h-8 mx-auto mb-2"></i>
                    <p>No notifications</p>
                </div>
            `;
            return;
        }
        
        dataManager.data.notifications.forEach(notification => {
            let icon = 'bell';
            let iconColor = 'text-blue-500';
            let bgColor = 'bg-blue-50';
            
            if (notification.type === 'lead') {
                icon = 'user-plus';
                iconColor = 'text-green-500';
                bgColor = 'bg-green-50';
            } else if (notification.type === 'project') {
                icon = 'folder-kanban';
                iconColor = 'text-amber-500';
                bgColor = 'bg-amber-50';
            } else if (notification.type === 'feedback') {
                icon = 'message-square';
                iconColor = 'text-purple-500';
                bgColor = 'bg-purple-50';
            } else if (notification.type === 'financial') {
                icon = 'dollar-sign';
                iconColor = 'text-green-500';
                bgColor = 'bg-green-50';
            }
            
            const notificationEl = document.createElement('div');
            notificationEl.className = `notification ${!notification.read ? 'border-l-4 border-l-blue-500' : ''}`;
            notificationEl.innerHTML = `
                <div class="flex items-start">
                    <div class="w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                        <i data-lucide="${icon}" class="w-5 h-5 ${iconColor}"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-800">${notification.title}</h4>
                        <p class="text-sm text-gray-600 mt-1">${notification.message}</p>
                        <p class="text-xs text-gray-500 mt-2">${notification.time}</p>
                    </div>
                    ${!notification.read ? `
                    <button onclick="uiManager.markNotificationAsRead(${notification.id})" class="text-gray-400 hover:text-gray-600 ml-2">
                        <i data-lucide="circle" class="w-3 h-3"></i>
                    </button>
                    ` : ''}
                </div>
            `;
            
            container.appendChild(notificationEl);
        });
        
        lucide.createIcons();
    }
    
    // Mark notification as read
    markNotificationAsRead(id) {
        dataManager.markNotificationAsRead(id);
        this.renderNotifications();
        this.updateNotificationBadge();
    }
    
    // Render activity feed
    renderActivityFeed() {
        const container = document.getElementById('activity-feed');
        if (!container) return;
        
        container.innerHTML = '';
        
        dataManager.data.activities.slice(0, 5).forEach(activity => {
            const activityEl = document.createElement('div');
            activityEl.className = 'flex items-start';
            
            activityEl.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <i data-lucide="${activity.icon}" class="w-4 h-4 text-blue-600"></i>
                </div>
                <div class="flex-1">
                    <h4 class="font-medium text-gray-800">${activity.action}</h4>
                    <p class="text-sm text-gray-600">${activity.details}</p>
                    <p class="text-xs text-gray-500 mt-1">${activity.time}</p>
                </div>
            `;
            
            container.appendChild(activityEl);
        });
        
        lucide.createIcons();
    }
    
    // Render recent projects
    renderRecentProjects() {
        const container = document.getElementById('recent-projects');
        if (!container) return;
        
        const recentProjects = dataManager.data.projects
            .sort((a, b) => b.id - a.id)
            .slice(0, 5);
        
        if (recentProjects.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i data-lucide="folder-x" class="w-12 h-12 mx-auto mb-3"></i>
                    <p>No projects yet</p>
                </div>
            `;
            return;
        }
        
        let projectsHTML = '<div class="space-y-4">';
        
        recentProjects.forEach(project => {
            let statusColor = 'bg-green-100 text-green-800';
            if (project.status === 'in-progress') statusColor = 'bg-blue-100 text-blue-800';
            if (project.status === 'delayed') statusColor = 'bg-red-100 text-red-800';
            if (project.status === 'planning') statusColor = 'bg-gray-100 text-gray-800';
            
            projectsHTML += `
                <div class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover-lift">
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-800">${project.name}</h4>
                        <p class="text-sm text-gray-600">${project.clientName}</p>
                    </div>
                    <div class="flex items-center space-x-4">
                        <span class="text-sm ${statusColor} px-3 py-1 rounded-full">${project.status}</span>
                        <div class="w-24">
                            <div class="progress-bar">
                                <div class="progress-fill ${project.progress < 30 ? 'bg-red-500' : project.progress < 70 ? 'bg-amber-500' : 'bg-green-500'}" style="width: ${project.progress}%"></div>
                            </div>
                            <p class="text-xs text-gray-500 text-center mt-1">${project.progress}%</p>
                        </div>
                    </div>
                </div>
            `;
        });
        
        projectsHTML += '</div>';
        container.innerHTML = projectsHTML;
    }
    
    // Render client table
    renderClientTable() {
        const container = document.getElementById('clients-table-container');
        if (!container) return;
        
        if (this.clientTable) {
            this.clientTable.destroy();
        }
        
        this.clientTable = new Tabulator("#clients-table-container", {
            data: dataManager.data.clients,
            layout: "fitColumns",
            responsiveLayout: "collapse",
            pagination: "local",
            paginationSize: 10,
            columns: [
                {title: "ID", field: "id", width: 80, hozAlign: "center"},
                {title: "Name", field: "name", headerFilter: "input"},
                {title: "Company", field: "company", headerFilter: "input"},
                {title: "Email", field: "email", headerFilter: "input"},
                {title: "Phone", field: "phone"},
                {title: "Status", field: "status", width: 120,
                    formatter: (cell) => {
                        const status = cell.getValue();
                        let badgeClass = "status-badge ";
                        
                        if (status === "active") {
                            badgeClass += "status-active";
                        } else if (status === "pending") {
                            badgeClass += "status-pending";
                        } else {
                            badgeClass += "bg-gray-100 text-gray-800";
                        }
                        
                        return `<span class="${badgeClass}">${status}</span>`;
                    }
                },
                {title: "Projects", field: "projects", width: 100, hozAlign: "center"},
                {title: "Join Date", field: "joinDate", width: 120},
                {title: "Actions", width: 120, hozAlign: "center",
                    formatter: (cell) => {
                        const data = cell.getRow().getData();
                        return `
                            <div class="flex space-x-2 justify-center">
                                <button onclick="uiManager.editClient(${data.id})" class="text-blue-600 hover:text-blue-800">
                                    <i data-lucide="edit" class="w-4 h-4"></i>
                                </button>
                                <button onclick="uiManager.deleteClient(${data.id})" class="text-red-600 hover:text-red-800">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>
                        `;
                    }
                }
            ],
            initialSort: [
                {column: "id", dir: "desc"}
            ]
        });
        
        // Create icons after table is rendered
        setTimeout(() => lucide.createIcons(), 100);
    }
    
    // Render project table
    renderProjectTable() {
        const container = document.getElementById('projects-table-container');
        if (!container) return;
        
        if (this.projectTable) {
            this.projectTable.destroy();
        }
        
        this.projectTable = new Tabulator("#projects-table-container", {
            data: dataManager.data.projects,
            layout: "fitColumns",
            responsiveLayout: "collapse",
            pagination: "local",
            paginationSize: 10,
            columns: [
                {title: "ID", field: "id", width: 80, hozAlign: "center"},
                {title: "Project Name", field: "name", headerFilter: "input"},
                {title: "Client", field: "clientName", headerFilter: "input"},
                {title: "Due Date", field: "dueDate", width: 120},
                {title: "Status", field: "status", width: 120,
                    formatter: (cell) => {
                        const status = cell.getValue();
                        let badgeClass = "status-badge ";
                        
                        if (status === "completed") {
                            badgeClass += "status-active";
                        } else if (status === "in-progress") {
                            badgeClass += "status-pending";
                        } else if (status === "delayed") {
                            badgeClass += "status-delayed";
                        } else {
                            badgeClass += "bg-gray-100 text-gray-800";
                        }
                        
                        return `<span class="${badgeClass}">${status}</span>`;
                    }
                },
                {title: "Progress", field: "progress", width: 120,
                    formatter: (cell) => {
                        const progress = cell.getValue();
                        let color = "bg-green-500";
                        
                        if (progress < 30) color = "bg-red-500";
                        else if (progress < 70) color = "bg-amber-500";
                        
                        return `
                            <div class="flex items-center">
                                <div class="progress-bar w-16 mr-2">
                                    <div class="progress-fill ${color}" style="width: ${progress}%"></div>
                                </div>
                                <span class="text-sm">${progress}%</span>
                            </div>
                        `;
                    }
                },
                {title: "Budget", field: "budget", width: 120,
                    formatter: (cell) => {
                        const budget = cell.getValue();
                        return `$${budget.toLocaleString()}`;
                    }
                },
                {title: "Actions", width: 120, hozAlign: "center",
                    formatter: (cell) => {
                        const data = cell.getRow().getData();
                        return `
                            <div class="flex space-x-2 justify-center">
                                <button onclick="uiManager.editProject(${data.id})" class="text-blue-600 hover:text-blue-800">
                                    <i data-lucide="edit" class="w-4 h-4"></i>
                                </button>
                                <button onclick="uiManager.deleteProject(${data.id})" class="text-red-600 hover:text-red-800">
                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                </button>
                            </div>
                        `;
                    }
                }
            ],
            initialSort: [
                {column: "id", dir: "desc"}
            ]
        });
        
        // Create icons after table is rendered
        setTimeout(() => lucide.createIcons(), 100);
    }
    
    // Render feedback cards
    renderFeedbackCards() {
        const container = document.getElementById('feedback-container');
        if (!container) return;
        
        if (dataManager.data.feedback.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i data-lucide="message-square" class="w-8 h-8 text-gray-400"></i>
                    </div>
                    <h3 class="text-lg font-medium text-gray-800 mb-2">No Feedback Yet</h3>
                    <p class="text-gray-600 mb-6">Client feedback will appear here once submitted.</p>
                    <button onclick="uiManager.openModal('feedback')" class="btn-primary">
                        <i data-lucide="message-square-plus" class="w-4 h-4 mr-2"></i>
                        Add Feedback
                    </button>
                </div>
            `;
            return;
        }
        
        let feedbackHTML = '';
        
        dataManager.data.feedback.forEach(feedback => {
            // Create star rating HTML
            let starsHTML = '';
            for (let i = 1; i <= 5; i++) {
                if (i <= feedback.rating) {
                    starsHTML += '<i data-lucide="star" class="w-5 h-5 text-amber-500 fill-amber-500"></i>';
                } else {
                    starsHTML += '<i data-lucide="star" class="w-5 h-5 text-gray-300"></i>';
                }
            }
            
            feedbackHTML += `
                <div class="card p-6 hover-lift">
                    <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                        <div>
                            <h4 class="font-medium text-gray-800">${feedback.clientName}</h4>
                            <p class="text-sm text-gray-600">${feedback.projectName}</p>
                        </div>
                        <div class="flex items-center">
                            <div class="flex mr-3">${starsHTML}</div>
                            <span class="text-sm text-gray-500">${feedback.date}</span>
                        </div>
                    </div>
                    
                    <div class="bg-gray-50 p-4 rounded-lg mb-4">
                        <p class="text-gray-700 italic">"${feedback.comments}"</p>
                    </div>
                    
                    <div class="flex justify-end">
                        <button onclick="uiManager.deleteFeedback(${feedback.id})" class="text-sm text-red-600 hover:text-red-800 flex items-center">
                            <i data-lucide="trash-2" class="w-4 h-4 mr-1"></i>
                            Delete
                        </button>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = feedbackHTML;
        lucide.createIcons();
    }
    
    // Initialize project chart
    initProjectChart() {
        // Pehle chart container ko check karein
        const chartContainer = document.querySelector("#project-chart");
        if (!chartContainer) return;
        
        // Existing chart ko destroy karein agar hai
        if (this.projectChart) {
            this.projectChart.destroy();
        }
        
        // Thoda delay dein ta ke container properly render ho jaye
        setTimeout(() => {
            const stats = dataManager.getStats();
            
            // Container ki height set karein
            chartContainer.style.height = '350px';
            chartContainer.style.minHeight = '350px';
            
            const options = {
                series: [stats.completedProjects, stats.inProgressProjects, stats.delayedProjects],
                chart: {
                    type: 'donut',
                    height: 350,
                    fontFamily: 'Inter, sans-serif',
                },
                colors: ['#10b981', '#3b82f6', '#ef4444'],
                labels: ['Completed', 'In Progress', 'Delayed'],
                legend: {
                    position: 'bottom',
                },
                plotOptions: {
                    pie: {
                        donut: {
                            size: '65%',
                            labels: {
                                show: true,
                                total: {
                                    show: true,
                                    label: 'Total Projects',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    formatter: function (w) {
                                        return stats.totalProjects.toString();
                                    }
                                }
                            }
                        }
                    }
                },
                dataLabels: {
                    enabled: false,
                },
                responsive: [{
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: '100%'
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }]
            };
            
            const chart = new ApexCharts(chartContainer, options);
            chart.render();
            this.projectChart = chart;
            
            // Resize trigger dein
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
            }, 100);
            
        }, 100); // 100ms ka delay
    }
    
    // Initialize analytics charts
    initAnalyticsCharts() {
        // Revenue chart
        setTimeout(() => this.initRevenueChart(), 100);
        
        // Client growth chart
        setTimeout(() => this.initClientGrowthChart(), 150);
        
        // Additional charts
        setTimeout(() => this.initProjectDistributionChart(), 200);
        setTimeout(() => this.initMonthlyFeedbackChart(), 250);
    }
    
    // Initialize revenue chart
    initRevenueChart() {
        const container = document.querySelector("#revenue-chart");
        if (!container) return;
        
        // Destroy existing chart
        if (this.revenueChart) {
            this.revenueChart.destroy();
        }
        
        setTimeout(() => {
            container.style.height = '300px';
            container.style.minHeight = '300px';
            
            const options = {
                series: [{
                    name: 'Revenue',
                    data: [45000, 52000, 48000, 61000, 58000, 72000, 68000, 75000, 82000, 78000, 85000, 90000]
                }],
                chart: {
                    height: 300,
                    type: 'area',
                    fontFamily: 'Inter, sans-serif',
                    toolbar: {
                        show: false
                    }
                },
                colors: ['#3b82f6'],
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    curve: 'smooth',
                    width: 3
                },
                fill: {
                    type: 'gradient',
                    gradient: {
                        shadeIntensity: 1,
                        opacityFrom: 0.7,
                        opacityTo: 0.2,
                        stops: [0, 90, 100]
                    }
                },
                xaxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                },
                yaxis: {
                    labels: {
                        formatter: function(value) {
                            return '$' + (value / 1000) + 'k';
                        }
                    }
                },
                tooltip: {
                    y: {
                        formatter: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            };
            
            this.revenueChart = new ApexCharts(container, options);
            this.revenueChart.render();
        }, 100);
    }
    
    // Initialize client growth chart
    initClientGrowthChart() {
        const container = document.querySelector("#client-growth-chart");
        if (!container) return;
        
        // Destroy existing chart
        if (this.clientGrowthChart) {
            this.clientGrowthChart.destroy();
        }
        
        setTimeout(() => {
            container.style.height = '300px';
            container.style.minHeight = '300px';
            
            const options = {
                series: [{
                    name: 'Clients',
                    data: [12, 15, 18, 22, 26, 30, 35, 38, 42, 45, 48, 52]
                }],
                chart: {
                    height: 300,
                    type: 'line',
                    fontFamily: 'Inter, sans-serif',
                    toolbar: {
                        show: false
                    }
                },
                colors: ['#10b981'],
                stroke: {
                    width: 3,
                    curve: 'smooth'
                },
                markers: {
                    size: 6
                },
                xaxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                },
                yaxis: {
                    min: 0,
                    max: 60,
                    tickAmount: 6
                },
                tooltip: {
                    y: {
                        formatter: function(value) {
                            return value + ' clients';
                        }
                    }
                }
            };
            
            this.clientGrowthChart = new ApexCharts(container, options);
            this.clientGrowthChart.render();
        }, 100);
    }
    
    // Initialize project distribution chart
    initProjectDistributionChart() {
        const container = document.querySelector("#project-distribution-chart");
        if (!container) return;
        
        // Destroy existing chart
        if (this.projectDistributionChart) {
            this.projectDistributionChart.destroy();
        }
        
        setTimeout(() => {
            container.style.height = '300px';
            container.style.minHeight = '300px';
            
            const stats = dataManager.getStats();
            const options = {
                series: [
                    stats.completedProjects,
                    stats.inProgressProjects,
                    stats.delayedProjects,
                    stats.planningProjects || 2
                ],
                chart: {
                    type: 'pie',
                    height: 300,
                },
                labels: ['Completed', 'In Progress', 'Delayed', 'Planning'],
                colors: ['#10b981', '#3b82f6', '#ef4444', '#6b7280'],
                legend: {
                    position: 'bottom'
                },
                responsive: [{
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: '100%'
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }]
            };
            
            this.projectDistributionChart = new ApexCharts(container, options);
            this.projectDistributionChart.render();
        }, 100);
    }
    
    // Initialize monthly feedback chart
    initMonthlyFeedbackChart() {
        const container = document.querySelector("#monthly-feedback-chart");
        if (!container) return;
        
        // Destroy existing chart
        if (this.monthlyFeedbackChart) {
            this.monthlyFeedbackChart.destroy();
        }
        
        setTimeout(() => {
            container.style.height = '300px';
            container.style.minHeight = '300px';
            
            // Generate demo feedback data for last 6 months
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
            const positiveData = months.map(() => Math.floor(Math.random() * 8) + 3);
            const negativeData = months.map(() => Math.floor(Math.random() * 3) + 1);
            
            const options = {
                series: [
                    {
                        name: 'Positive (4-5 stars)',
                        data: positiveData
                    },
                    {
                        name: 'Neutral (3 stars)',
                        data: months.map(() => Math.floor(Math.random() * 4) + 1)
                    },
                    {
                        name: 'Negative (1-2 stars)',
                        data: negativeData
                    }
                ],
                chart: {
                    type: 'bar',
                    height: 300,
                    stacked: true,
                    toolbar: {
                        show: false
                    }
                },
                plotOptions: {
                    bar: {
                        horizontal: false,
                        columnWidth: '60%',
                    },
                },
                colors: ['#10b981', '#f59e0b', '#ef4444'],
                xaxis: {
                    categories: months,
                },
                yaxis: {
                    title: {
                        text: 'Number of Feedback'
                    }
                },
                fill: {
                    opacity: 1
                },
                legend: {
                    position: 'bottom'
                }
            };
            
            this.monthlyFeedbackChart = new ApexCharts(container, options);
            this.monthlyFeedbackChart.render();
        }, 100);
    }
    
    // Update dashboard stats
    updateDashboardStats() {
        if (this.currentPage === 'dashboard') {
            // Reload the dashboard to update stats
            this.loadPage('dashboard');
        }
    }
    
    // Edit client (placeholder for demo)
    editClient(id) {
        const client = dataManager.getClientById(id);
        if (client) {
            dataManager.notyf.success(`Edit client "${client.name}" - This would open an edit form in a full application.`);
        }
    }
    
    // Delete client
    deleteClient(id) {
        if (confirm('Are you sure you want to delete this client? This will also delete all associated projects.')) {
            const success = dataManager.deleteClient(id);
            if (success) {
                if (this.currentPage === 'clients') {
                    this.renderClientTable();
                } else if (this.currentPage === 'dashboard') {
                    this.updateDashboardStats();
                }
            }
        }
    }
    
    // Edit project (placeholder for demo)
    editProject(id) {
        const project = dataManager.getProjectById(id);
        if (project) {
            dataManager.notyf.success(`Edit project "${project.name}" - This would open an edit form in a full application.`);
        }
    }
    
    // Delete project
    deleteProject(id) {
        if (confirm('Are you sure you want to delete this project?')) {
            const success = dataManager.deleteProject(id);
            if (success) {
                if (this.currentPage === 'projects') {
                    this.renderProjectTable();
                } else if (this.currentPage === 'dashboard') {
                    this.updateDashboardStats();
                    this.renderRecentProjects();
                    this.initProjectChart();
                }
            }
        }
    }
    
    // Delete feedback
    deleteFeedback(id) {
        if (confirm('Are you sure you want to delete this feedback?')) {
            const success = dataManager.deleteFeedback(id);
            if (success && this.currentPage === 'feedback') {
                this.renderFeedbackCards();
            }
        }
    }
    
    // Start demo updates
    startDemoUpdates() {
        // Auto-update project progress every 30 seconds
        setInterval(() => {
            const updated = dataManager.updateProjectProgress();
            if (updated && this.currentPage === 'dashboard') {
                this.updateDashboardStats();
                this.renderRecentProjects();
                if (this.projectChart) {
                    this.initProjectChart();
                }
            }
        }, 30000);
        
        // Generate demo leads randomly every 45-90 seconds
        setInterval(() => {
            if (Math.random() > 0.3) { // 70% chance
                dataManager.generateDemoLead();
                this.renderNotifications();
                this.updateNotificationBadge();
            }
        }, 45000 + Math.random() * 45000);
        
        // Auto-refresh notifications every minute
        setInterval(() => {
            this.renderNotifications();
            this.updateNotificationBadge();
        }, 60000);
    }
    
    // Show notification
    showNotification(message) {
        dataManager.notyf.success(message);
    }
}

// Create global instance
const uiManager = new UIManager();