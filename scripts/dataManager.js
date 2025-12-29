// Data Manager - Handles all data operations
class DataManager {
    constructor() {
        this.data = {
            clients: [],
            projects: [],
            feedback: [],
            notifications: [],
            activities: []
        };
        
        this.nextId = {
            clients: 6,
            projects: 7,
            feedback: 4,
            notifications: 5,
            activities: 5
        };
        
        this.notyf = new Notyf({
            duration: 3000,
            position: {x: 'right', y: 'top'},
            types: [
                {
                    type: 'success',
                    background: '#10b981',
                    icon: false
                },
                {
                    type: 'error',
                    background: '#ef4444',
                    icon: false
                }
            ]
        });
    }
    
    // Load data from JSON files
    async loadData() {
        try {
            const [clients, projects, feedback, notifications] = await Promise.all([
                this.fetchJSON('./data/clients.json'),
                this.fetchJSON('./data/projects.json'),
                this.fetchJSON('./data/feedback.json'),
                this.fetchJSON('./data/notifications.json')
            ]);
            
            this.data.clients = clients;
            this.data.projects = projects;
            this.data.feedback = feedback;
            this.data.notifications = notifications;
            
            // Generate initial activities
            this.data.activities = [
                {
                    id: 1,
                    action: "Project Completed",
                    details: "Retail Mall Renovation marked as completed",
                    time: "2 days ago",
                    icon: "check-circle"
                },
                {
                    id: 2,
                    action: "New Client Added",
                    details: "Global Design Co. added to client database",
                    time: "1 week ago",
                    icon: "user-plus"
                },
                {
                    id: 3,
                    action: "Feedback Submitted",
                    details: "Tech Innovate Inc. submitted project feedback",
                    time: "1 week ago",
                    icon: "message-square"
                },
                {
                    id: 4,
                    action: "Project Delayed",
                    details: "Tech Campus Phase 1 timeline extended by 2 weeks",
                    time: "2 weeks ago",
                    icon: "alert-circle"
                }
            ];
            
            console.log('Data loaded successfully');
            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            this.notyf.error('Failed to load data');
            return false;
        }
    }
    
    // Fetch JSON data
    async fetchJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            return [];
        }
    }
    
    // Save data to localStorage for demo purposes
    saveData() {
        try {
            localStorage.setItem('crm_data', JSON.stringify(this.data));
            localStorage.setItem('crm_nextId', JSON.stringify(this.nextId));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }
    
    // Load data from localStorage
    loadFromStorage() {
        try {
            const savedData = localStorage.getItem('crm_data');
            const savedNextId = localStorage.getItem('crm_nextId');
            
            if (savedData) {
                this.data = JSON.parse(savedData);
            }
            if (savedNextId) {
                this.nextId = JSON.parse(savedNextId);
            }
            return true;
        } catch (error) {
            console.error('Error loading from storage:', error);
            return false;
        }
    }
    
    // CRUD Operations for Clients
    addClient(clientData) {
        const newClient = {
            id: this.nextId.clients++,
            ...clientData,
            joinDate: new Date().toISOString().split('T')[0],
            projects: 0
        };
        
        this.data.clients.push(newClient);
        this.saveData();
        this.addNotification('New Client', `${clientData.name} has been added as a new client`, 'lead');
        this.addActivity('Client Added', `${clientData.name} added to database`, 'user-plus');
        
        this.notyf.success(`Client ${clientData.name} added successfully!`);
        return newClient;
    }
    
    updateClient(id, clientData) {
        const index = this.data.clients.findIndex(c => c.id === id);
        if (index !== -1) {
            this.data.clients[index] = { ...this.data.clients[index], ...clientData };
            this.saveData();
            this.notyf.success('Client updated successfully!');
            return this.data.clients[index];
        }
        return null;
    }
    
    deleteClient(id) {
        const index = this.data.clients.findIndex(c => c.id === id);
        if (index !== -1) {
            const clientName = this.data.clients[index].name;
            this.data.clients.splice(index, 1);
            
            // Also delete associated projects
            this.data.projects = this.data.projects.filter(p => p.clientId !== id);
            
            this.saveData();
            this.addNotification('Client Removed', `${clientName} has been removed from the system`, 'project');
            this.addActivity('Client Deleted', `${clientName} removed from database`, 'user-minus');
            
            this.notyf.success(`Client ${clientName} deleted successfully!`);
            return true;
        }
        return false;
    }
    
    // CRUD Operations for Projects
    addProject(projectData) {
        const client = this.data.clients.find(c => c.id === parseInt(projectData.clientId));
        if (!client) {
            this.notyf.error('Client not found');
            return null;
        }
        
        const newProject = {
            id: this.nextId.projects++,
            ...projectData,
            clientName: client.name,
            clientId: parseInt(projectData.clientId),
            progress: parseInt(projectData.progress) || 0
        };
        
        this.data.projects.push(newProject);
        
        // Update client's project count
        client.projects++;
        
        this.saveData();
        this.addNotification('New Project', `${projectData.name} has been added`, 'project');
        this.addActivity('Project Created', `${projectData.name} added to portfolio`, 'folder-plus');
        
        this.notyf.success(`Project ${projectData.name} added successfully!`);
        return newProject;
    }
    
    updateProject(id, projectData) {
        const index = this.data.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            const oldStatus = this.data.projects[index].status;
            this.data.projects[index] = { ...this.data.projects[index], ...projectData };
            
            // If status changed to completed, create notification
            if (oldStatus !== 'completed' && projectData.status === 'completed') {
                this.addNotification('Project Completed', `${this.data.projects[index].name} has been completed`, 'project');
            }
            
            this.saveData();
            this.notyf.success('Project updated successfully!');
            return this.data.projects[index];
        }
        return null;
    }
    
    deleteProject(id) {
        const index = this.data.projects.findIndex(p => p.id === id);
        if (index !== -1) {
            const project = this.data.projects[index];
            const client = this.data.clients.find(c => c.id === project.clientId);
            
            this.data.projects.splice(index, 1);
            
            // Update client's project count
            if (client && client.projects > 0) {
                client.projects--;
            }
            
            this.saveData();
            this.addNotification('Project Removed', `${project.name} has been deleted`, 'project');
            this.addActivity('Project Deleted', `${project.name} removed from portfolio`, 'folder-minus');
            
            this.notyf.success(`Project ${project.name} deleted successfully!`);
            return true;
        }
        return false;
    }
    
    // CRUD Operations for Feedback
    addFeedback(feedbackData) {
        const client = this.data.clients.find(c => c.id === parseInt(feedbackData.clientId));
        const project = this.data.projects.find(p => p.id === parseInt(feedbackData.projectId));
        
        if (!client || !project) {
            this.notyf.error('Client or project not found');
            return null;
        }
        
        const newFeedback = {
            id: this.nextId.feedback++,
            ...feedbackData,
            clientName: client.name,
            projectName: project.name,
            date: new Date().toISOString().split('T')[0],
            rating: parseInt(feedbackData.rating)
        };
        
        this.data.feedback.push(newFeedback);
        this.saveData();
        this.addNotification('New Feedback', `${client.name} submitted feedback for ${project.name}`, 'feedback');
        this.addActivity('Feedback Submitted', `${client.name} rated ${project.name}`, 'message-square');
        
        this.notyf.success('Feedback submitted successfully!');
        return newFeedback;
    }
    
    deleteFeedback(id) {
        const index = this.data.feedback.findIndex(f => f.id === id);
        if (index !== -1) {
            this.data.feedback.splice(index, 1);
            this.saveData();
            this.notyf.success('Feedback deleted successfully!');
            return true;
        }
        return false;
    }
    
    // Notification methods
    addNotification(title, message, type = 'info') {
        const newNotification = {
            id: this.nextId.notifications++,
            title,
            message,
            time: 'Just now',
            type,
            read: false
        };
        
        this.data.notifications.unshift(newNotification);
        this.saveData();
        return newNotification;
    }
    
    markNotificationAsRead(id) {
        const notification = this.data.notifications.find(n => n.id === id);
        if (notification) {
            notification.read = true;
            this.saveData();
            return true;
        }
        return false;
    }
    
    markAllNotificationsAsRead() {
        this.data.notifications.forEach(n => n.read = true);
        this.saveData();
    }
    
    deleteNotification(id) {
        const index = this.data.notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            this.data.notifications.splice(index, 1);
            this.saveData();
            return true;
        }
        return false;
    }
    
    // Activity methods
    addActivity(action, details, icon) {
        const newActivity = {
            id: this.nextId.activities++,
            action,
            details,
            time: 'Just now',
            icon
        };
        
        this.data.activities.unshift(newActivity);
        if (this.data.activities.length > 10) {
            this.data.activities.pop();
        }
        this.saveData();
        return newActivity;
    }
    
    // Get statistics
    getStats() {
        const totalClients = this.data.clients.length;
        const totalProjects = this.data.projects.length;
        
        // Calculate pending feedback (projects without feedback)
        const projectsWithFeedback = new Set(this.data.feedback.map(f => f.projectId));
        const pendingFeedback = this.data.projects.filter(p => !projectsWithFeedback.has(p.id)).length;
        
        // Calculate total revenue
        const totalRevenue = this.data.projects.reduce((sum, project) => sum + (project.budget || 0), 0);
        
        // Count projects by status
        const completedProjects = this.data.projects.filter(p => p.status === 'completed').length;
        const inProgressProjects = this.data.projects.filter(p => p.status === 'in-progress').length;
        const delayedProjects = this.data.projects.filter(p => p.status === 'delayed').length;
        
        return {
            totalClients,
            totalProjects,
            pendingFeedback,
            totalRevenue,
            completedProjects,
            inProgressProjects,
            delayedProjects
        };
    }
    
    // Get unread notification count
    getUnreadNotificationCount() {
        return this.data.notifications.filter(n => !n.read).length;
    }
    
    // Get client by ID
    getClientById(id) {
        return this.data.clients.find(c => c.id === id);
    }
    
    // Get project by ID
    getProjectById(id) {
        return this.data.projects.find(p => p.id === id);
    }
    
    // Get feedback by ID
    getFeedbackById(id) {
        return this.data.feedback.find(f => f.id === id);
    }
    
    // Get projects for a client
    getProjectsByClient(clientId) {
        return this.data.projects.filter(p => p.clientId === clientId);
    }
    
    // Get feedback for a project
    getFeedbackByProject(projectId) {
        return this.data.feedback.filter(f => f.projectId === projectId);
    }
    
    // Update project progress (for demo auto-update)
    updateProjectProgress() {
        let updated = false;
        
        this.data.projects.forEach(project => {
            if (project.status === 'in-progress' && project.progress < 100) {
                // Increase progress by random amount
                const increase = Math.floor(Math.random() * 5) + 1;
                project.progress = Math.min(100, project.progress + increase);
                
                // If progress reaches 100%, mark as completed
                if (project.progress === 100) {
                    project.status = 'completed';
                    this.addNotification('Project Completed', `${project.name} has been marked as completed`, 'project');
                    this.addActivity('Project Completed', `${project.name} finished successfully`, 'check-circle');
                    updated = true;
                }
            }
        });
        
        if (updated) {
            this.saveData();
        }
        
        return updated;
    }
    
    // Generate demo lead
    generateDemoLead() {
        const companies = [
            'GreenTech Solutions',
            'Urban Design Collective',
            'Modern Living Inc.',
            'Sustainable Builders',
            'Future Spaces LLC',
            'Eco Architecture Group'
        ];
        
        const projects = [
            'commercial building design',
            'residential complex planning',
            'office renovation',
            'hotel design',
            'hospital extension',
            'retail space planning'
        ];
        
        const company = companies[Math.floor(Math.random() * companies.length)];
        const project = projects[Math.floor(Math.random() * projects.length)];
        
        this.addNotification('New Lead', `New inquiry from ${company} about ${project}`, 'lead');
        this.notyf.success(`New lead from ${company}!`);
    }
}

// Create global instance
const dataManager = new DataManager();