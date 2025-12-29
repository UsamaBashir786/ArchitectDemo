// Main Application Script
class App {
    constructor() {
        this.initialized = false;
    }
    
    // Initialize the application
    async init() {
        try {
            console.log('Initializing Access Architects CRM...');
            
            // Show loading state
            this.showLoading();
            
            // Initialize Lucide Icons
            lucide.createIcons();
            
            // Initialize data manager
            console.log('Loading data...');
            const dataLoaded = await dataManager.loadData();
            
            if (!dataLoaded) {
                // Try to load from localStorage
                console.log('Loading from storage...');
                dataManager.loadFromStorage();
            }
            
            // Initialize UI manager
            console.log('Initializing UI...');
            await uiManager.init();
            
            // Initialize modal manager
            console.log('Initializing modals...');
            modalManager.setupModalListeners();
            
            // Hide loading state
            this.hideLoading();
            
            this.initialized = true;
            console.log('Application initialized successfully!');
            
            // Show welcome message
            setTimeout(() => {
                dataManager.notyf.success('Welcome to Access Architects CRM Dashboard!');
            }, 1000);
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }
    
    // Show loading state
    showLoading() {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="flex items-center justify-center h-full">
                    <div class="text-center">
                        <div class="spinner mx-auto mb-4"></div>
                        <p class="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            `;
        }
    }
    
    // Hide loading state
    hideLoading() {
        // Loading state is automatically removed when UI loads
    }
    
    // Show error message
    showError(message) {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="flex items-center justify-center h-full">
                    <div class="text-center max-w-md">
                        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i data-lucide="alert-circle" class="w-8 h-8 text-red-600"></i>
                        </div>
                        <h3 class="text-lg font-medium text-gray-800 mb-2">Something went wrong</h3>
                        <p class="text-gray-600 mb-6">${message}</p>
                        <button onclick="location.reload()" class="btn-primary">
                            <i data-lucide="refresh-ccw" class="w-4 h-4 mr-2"></i>
                            Reload Page
                        </button>
                    </div>
                </div>
            `;
            lucide.createIcons();
        }
    }
    
    // Export data (for demo purposes)
    exportData() {
        const dataStr = JSON.stringify(dataManager.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'access-architects-data.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        dataManager.notyf.success('Data exported successfully!');
    }
    
    // Import data (for demo purposes)
    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                dataManager.data = importedData;
                dataManager.saveData();
                
                // Reload the UI
                if (uiManager.currentPage) {
                    uiManager.loadPage(uiManager.currentPage);
                }
                
                dataManager.notyf.success('Data imported successfully!');
            } catch (error) {
                dataManager.notyf.error('Failed to import data. Invalid file format.');
            }
        };
        reader.readAsText(file);
    }
    
    // Reset demo data
    resetDemoData() {
        if (confirm('Are you sure you want to reset all data to the original demo state? This cannot be undone.')) {
            localStorage.removeItem('crm_data');
            localStorage.removeItem('crm_nextId');
            location.reload();
        }
    }
}

// Create and initialize the application
const app = new App();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// Make app available globally for debugging
window.app = app;
window.dataManager = dataManager;
window.uiManager = uiManager;
window.modalManager = modalManager;
window.chartManager = chartManager;