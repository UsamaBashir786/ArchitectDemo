// Modal Manager - Handles modal operations
class ModalManager {
    constructor() {
        this.activeModal = null;
    }
    
    // Create modal HTML
    createModal(type, content) {
        const modalId = `${type}-modal`;
        
        if (document.getElementById(modalId)) {
            return;
        }
        
        const modalHTML = `
            <div id="${modalId}" class="modal-overlay">
                <div class="modal-content">
                    ${content}
                </div>
            </div>
        `;
        
        document.getElementById('modal-container').innerHTML += modalHTML;
    }
    
    // Show modal
    showModal(type) {
        this.hideAllModals();
        
        const modal = document.getElementById(`${type}-modal`);
        if (modal) {
            modal.classList.add('active');
            this.activeModal = modal;
            
            // Focus first input
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }
    
    // Hide modal
    hideModal(type) {
        const modal = document.getElementById(`${type}-modal`);
        if (modal) {
            modal.classList.remove('active');
            if (this.activeModal === modal) {
                this.activeModal = null;
            }
        }
    }
    
    // Hide all modals
    hideAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
        this.activeModal = null;
    }
    
    // Create client modal
    createClientModal() {
        const content = `
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
                    <button type="button" onclick="modalManager.hideModal('client')" class="btn-secondary">Cancel</button>
                    <button type="submit" class="btn-primary">Add Client</button>
                </div>
            </form>
        `;
        
        this.createModal('client', content);
    }
    
    // Create project modal
    createProjectModal() {
        const content = `
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
                    <button type="button" onclick="modalManager.hideModal('project')" class="btn-secondary">Cancel</button>
                    <button type="submit" class="btn-primary">Add Project</button>
                </div>
            </form>
        `;
        
        this.createModal('project', content);
    }
    
    // Create feedback modal
    createFeedbackModal() {
        const content = `
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
                    <button type="button" onclick="modalManager.hideModal('feedback')" class="btn-secondary">Cancel</button>
                    <button type="submit" class="btn-primary">Submit Feedback</button>
                </div>
            </form>
        `;
        
        this.createModal('feedback', content);
    }
    
    // Setup modal event listeners
    setupModalListeners() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (this.activeModal && e.target === this.activeModal) {
                this.hideAllModals();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                this.hideAllModals();
            }
        });
    }
}

// Create global instance
const modalManager = new ModalManager();