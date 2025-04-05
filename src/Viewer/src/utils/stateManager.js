/**
 * State Manager for FileToMarkdown Viewer
 * Handles saving and loading the state of files and folders
 */

class StateManager {
    constructor(fileManager) {
        this.fileManager = fileManager;
        this.saveBtn = document.getElementById('btn-save');
        this.cidronBox = document.querySelector('.cidron-box');
        this.garbageBtn = null; // Will hold reference to the garbage button
        
        // Initialize state
        this.state = {
            presets: {},
        };
        
        this.init();
    }
    
    init() {
        // Add event listener to save button
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => this.promptAndSaveState());
        }
        
        // Load saved presets from localStorage
        this.loadPresetsFromStorage();
        
        // Check if we have previously saved presets and create buttons
        this.checkForSavedPresets();
        
        // Create garbage button at the end
        this.createGarbageButton();
    }
    
    /**
     * Create a preset button dynamically
     */
    createPresetButton(presetName, timestamp) {
        if (!this.cidronBox) {
            console.error("Cidron box not found, cannot add preset button.");
            return; // Exit if cidronBox isn't found
        }

        // Remove existing button for this preset if it exists
        const existingBtnId = `preset-${presetName.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
        const existingBtn = document.getElementById(existingBtnId);
        if (existingBtn) {
            console.log(`Removing existing button for preset: ${presetName}`);
            existingBtn.remove();
        }
        
        // Create the button element
        const presetBtn = document.createElement('button');
        presetBtn.id = existingBtnId; // Use sanitized ID
        presetBtn.className = 'btn btn-preset';
        
        // Format date without seconds (using options for date formatting)
        const dateObj = new Date(timestamp);
        const dateOptions = { 
            year: 'numeric', 
            month: 'numeric', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // Use 24-hour format instead of AM/PM
        };
        const formattedDate = dateObj.toLocaleString(undefined, dateOptions);
        
        // Use the preset name as the button content instead of an icon
        presetBtn.innerHTML = presetName;
        
        // Add styles specific to this button instance
        presetBtn.style.position = 'static'; 
        presetBtn.style.transform = 'none'; 
        presetBtn.style.padding = '5px 10px';
        presetBtn.style.minWidth = '60px';
        presetBtn.style.textAlign = 'center';
        
        // Add event listener
        presetBtn.addEventListener('click', () => this.loadPreset(presetName));
        
        presetBtn.addEventListener('contextmenu', (event) => {
             event.preventDefault();
             if (confirm(`Delete preset "${presetName}"?`)) {
                 this.removePreset(presetName);
             }
        });

        // Append directly to cidron-box, before the garbage button if it exists
        if (this.garbageBtn && this.cidronBox.contains(this.garbageBtn)) {
            this.cidronBox.insertBefore(presetBtn, this.garbageBtn);
        } else {
            this.cidronBox.appendChild(presetBtn);
        }
        
        return presetBtn;
    }
    
    /**
     * Load presets from localStorage
     */
    loadPresetsFromStorage() {
        try {
            const savedPresets = localStorage.getItem('fileToMarkdownPresets');
            if (savedPresets) {
                this.state.presets = JSON.parse(savedPresets);
            }
        } catch (error) {
            console.error('Error loading presets from storage:', error);
            this.state.presets = {};
        }
    }
    
    /**
     * Save presets to localStorage
     */
    savePresetsToStorage() {
        try {
            const presetString = JSON.stringify(this.state.presets);
            localStorage.setItem('fileToMarkdownPresets', presetString);
            
            // Log size for debugging
            const sizeInKB = (presetString.length / 1024).toFixed(2);
            console.log(`Saved presets to localStorage (${sizeInKB}KB)`);
            
            if (presetString.length > 5 * 1024 * 1024) {
                console.warn('WARNING: Preset storage exceeds 5MB, may fail in some browsers');
            }
        } catch (error) {
            console.error('Error saving presets to storage:', error);
            if (error.name === 'QuotaExceededError') {
                this.showNotification('error', 'Storage quota exceeded. Try removing some presets or reducing file content.');
            } else {
                this.showNotification('error', `Error saving presets: ${error.message}`);
            }
        }
    }
    
    /**
     * Prompt user for preset name and save state
     */
    async promptAndSaveState() {
        // Get user input for preset name
        const presetName = prompt('Enter a name for this preset:', `Preset ${Object.keys(this.state.presets).length + 1}`);
        
        if (!presetName) return; // User cancelled
        
        await this.saveState(presetName);
    }
    
    /**
     * Save the current state of files and folders as a preset
     */
    async saveState(presetName) {
        try {
            // Get current state from file manager
            const files = this.fileManager.getFiles();
            const folders = this.fileManager.getFolders();
            
            // Validate the data before saving
            if (!Array.isArray(files) || !Array.isArray(folders)) {
                console.error('Invalid data format: files or folders is not an array', { files, folders });
                this.showSaveError();
                this.showNotification('error', 'Failed to save preset: Invalid data format');
                return false;
            }
            
            // Check if files have content
            const filesWithoutContent = files.filter(file => !file.content);
            if (filesWithoutContent.length > 0) {
                console.warn('Some files are missing content', filesWithoutContent.map(f => f.path));
            }
            
            const currentState = {
                timestamp: new Date().toISOString(),
                files: files,
                folders: folders
            };
            
            // Log size (localStorage has ~5MB limit)
            const stateSize = JSON.stringify(currentState).length;
            console.log(`Preset size: ${(stateSize / 1024 / 1024).toFixed(2)}MB`);
            
            if (stateSize > 4 * 1024 * 1024) {
                console.warn('Preset size is approaching localStorage limit (4MB+)');
                this.showNotification('warning', 'Preset size is large and may not be storable');
            }
            
            // Add to presets
            this.state.presets[presetName] = currentState;
            
            // Save to localStorage
            this.savePresetsToStorage();
            
            // Create the preset button
            this.createPresetButton(presetName, currentState.timestamp);
            
            // Visual feedback for successful save
            this.showSaveSuccess();
            this.showNotification('success', `Preset "${presetName}" saved with ${files.length} files`);
            
            return true;
        } catch (error) {
            console.error('Error saving state:', error);
            this.showSaveError();
            this.showNotification('error', `Failed to save preset: ${error.message}`);
            return false;
        }
    }
    
    /**
     * Load a specific preset
     */
    async loadPreset(presetName) {
        try {
            const preset = this.state.presets[presetName];
            
            if (!preset) {
                console.warn(`Preset "${presetName}" not found`);
                this.showNotification('error', `Preset "${presetName}" not found`);
                return false;
            }
            
            // Show loading notification
            this.showNotification('info', `Loading preset: ${presetName}...`);
            
            // Validate preset data
            if (!preset.files || !Array.isArray(preset.files)) {
                console.error('Invalid preset data: files is missing or not an array', preset);
                this.showNotification('error', `Invalid preset data: missing files`);
                return false;
            }
            
            if (!preset.folders || !Array.isArray(preset.folders)) {
                console.error('Invalid preset data: folders is missing or not an array', preset);
                this.showNotification('error', `Invalid preset data: missing folders`);
                return false;
            }
            
            console.log(`Attempting to restore preset with ${preset.files.length} files and ${preset.folders.length} folders`);
            
            // Ensure files have the required properties
            const validFiles = preset.files.filter(file => 
                file && file.path && typeof file.path === 'string');
                
            if (validFiles.length < preset.files.length) {
                console.warn(`Some files (${preset.files.length - validFiles.length}) are missing required properties`);
            }
            
            // Apply saved state to file manager
            try {
                const success = await this.fileManager.restoreState(preset.files, preset.folders);
                
                if (success) {
                    // Ensure the first file is selected and shown in the content area
                    if (this.fileManager.files.length > 0) {
                        this.fileManager.setCurrentFile(0);
                        
                        // Dispatch an event to trigger content display
                        window.dispatchEvent(new CustomEvent('fileSelected', { 
                            detail: { index: 0, file: this.fileManager.files[0] }
                        }));
                    }
                    
                    // Visual feedback for successful load
                    this.showLoadSuccess(presetName);
                    this.showNotification('success', `Preset "${presetName}" loaded successfully with ${preset.files.length} files`);
                    
                    return true;
                } else {
                    this.showNotification('error', `Failed to load preset "${presetName}": FileManager could not restore state`);
                    return false;
                }
            } catch (restoreError) {
                console.error(`Error in fileManager.restoreState:`, restoreError);
                this.showNotification('error', `Error restoring files: ${restoreError.message}`);
                return false;
            }
        } catch (error) {
            console.error(`Error loading preset "${presetName}":`, error);
            this.showLoadError(presetName);
            this.showNotification('error', `Error loading preset "${presetName}": ${error.message}`);
            return false;
        }
    }
    
    /**
     * Check if there are previously saved presets and create buttons if needed
     */
    checkForSavedPresets() {
        if (Object.keys(this.state.presets).length > 0) {
            // Create buttons for each preset
            for (const [presetName, preset] of Object.entries(this.state.presets)) {
                this.createPresetButton(presetName, preset.timestamp);
            }
        }
    }
    
    /**
     * Show success notification for save operation
     */
    showSaveSuccess() {
        this.saveBtn.classList.add('saved');
        
        setTimeout(() => {
            this.saveBtn.classList.remove('saved');
        }, 2000);
    }
    
    /**
     * Show error notification for save operation
     */
    showSaveError() {
        this.saveBtn.classList.add('error');
        
        setTimeout(() => {
            this.saveBtn.classList.remove('error');
        }, 2000);
    }
    
    /**
     * Show success notification for load operation
     */
    showLoadSuccess(presetName) {
        const presetBtn = document.getElementById(`preset-${presetName.replace(/\s+/g, '-').toLowerCase()}`);
        
        if (presetBtn) {
            presetBtn.classList.add('saved');
            
            setTimeout(() => {
                presetBtn.classList.remove('saved');
            }, 2000);
        }
    }
    
    /**
     * Show error notification for load operation
     */
    showLoadError(presetName) {
        const presetBtn = document.getElementById(`preset-${presetName.replace(/\s+/g, '-').toLowerCase()}`);
        
        if (presetBtn) {
            presetBtn.classList.add('error');
            
            setTimeout(() => {
                presetBtn.classList.remove('error');
            }, 2000);
        }
    }
    
    /**
     * Display a notification
     * @param {string} type - 'success', 'error', 'info', or 'warning'
     * @param {string} message - Notification message
     */
    showNotification(type, message) {
        // Check if notification system exists
        if (typeof window.showNotification === 'function') {
            window.showNotification(type, message);
        } else {
            // Fallback to console
            console.log(`[${type.toUpperCase()}] ${message}`);
            
            // Create a simple notification if needed
            const notificationSystem = document.getElementById('notification-system');
            if (!notificationSystem) {
                this.createSimpleNotification(type, message);
            }
        }
    }
    
    /**
     * Create a simple notification if the main notification system isn't available
     */
    createSimpleNotification(type, message) {
        const notification = document.createElement('div');
        notification.className = `simple-notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="close-btn">&times;</button>
            </div>
        `;
        
        // Style the notification
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.style.padding = '10px 15px';
        notification.style.borderRadius = '4px';
        notification.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        notification.style.maxWidth = '300px';
        notification.style.backgroundColor = type === 'success' ? '#f0fff4' : 
                                            type === 'error' ? '#fff5f5' : 
                                            type === 'warning' ? '#fffaf0' : '#e6f7ff';
        notification.style.border = `1px solid ${
            type === 'success' ? '#38a169' : 
            type === 'error' ? '#e53e3e' : 
            type === 'warning' ? '#dd6b20' : '#0366d6'
        }`;
        
        // Add close button functionality
        const closeBtn = notification.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(notification);
        });
        
        // Add to body
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }
    
    /**
     * Diagnose preset loading issues
     * @param {string} presetName - Name of the preset to diagnose 
     */
    diagnosePresetLoading(presetName) {
        try {
            console.group(`Diagnosing preset "${presetName}"`);
            
            // Check if preset exists
            const preset = this.state.presets[presetName];
            if (!preset) {
                console.error(`Preset "${presetName}" not found`);
                console.groupEnd();
                return;
            }
            
            // Check preset structure
            console.log('Preset structure:', Object.keys(preset));
            
            // Check files array
            if (!preset.files || !Array.isArray(preset.files)) {
                console.error('Missing or invalid files array');
            } else {
                console.log(`Files array has ${preset.files.length} items`);
                
                // Check a sample file
                if (preset.files.length > 0) {
                    const sampleFile = preset.files[0];
                    console.log('Sample file structure:', Object.keys(sampleFile));
                    console.log('Sample file properties:', {
                        name: sampleFile.name,
                        path: sampleFile.path,
                        hasContent: !!sampleFile.content,
                        contentLength: sampleFile.content ? sampleFile.content.length : 0,
                        folder: sampleFile.folder
                    });
                }
                
                // Count files without content
                const missingContent = preset.files.filter(f => !f.content).length;
                if (missingContent > 0) {
                    console.warn(`${missingContent} files are missing content`);
                }
            }
            
            // Check folders array
            if (!preset.folders || !Array.isArray(preset.folders)) {
                console.error('Missing or invalid folders array');
            } else {
                console.log(`Folders array has ${preset.folders.length} items`);
                
                // Check a sample folder
                if (preset.folders.length > 0) {
                    const sampleFolder = preset.folders[0];
                    console.log('Sample folder structure:', Object.keys(sampleFolder));
                }
            }
            
            // Check localStorage size
            const totalStorageUsed = JSON.stringify(localStorage).length;
            console.log(`Total localStorage used: ${(totalStorageUsed / 1024 / 1024).toFixed(2)}MB`);
            
            console.groupEnd();
        } catch (error) {
            console.error('Error diagnosing preset:', error);
            console.groupEnd();
        }
    }
    
    /**
     * Remove a preset
     * @param {string} presetName - Name of the preset to remove
     */
    removePreset(presetName) {
        try {
            // Check if preset exists
            if (!this.state.presets[presetName]) {
                console.warn(`Preset "${presetName}" not found for removal`);
                return false;
            }
            
            // Remove preset button from UI
            const presetBtn = document.getElementById(`preset-${presetName.replace(/\s+/g, '-').toLowerCase()}`);
            if (presetBtn && presetBtn.parentNode) {
                presetBtn.parentNode.removeChild(presetBtn);
            }
            
            // Remove from state
            delete this.state.presets[presetName];
            
            // Save updated presets
            this.savePresetsToStorage();
            
            this.showNotification('info', `Preset "${presetName}" removed`);
            
            return true;
        } catch (error) {
            console.error(`Error removing preset "${presetName}":`, error);
            return false;
        }
    }
    
    /**
     * Clear all presets from storage
     */
    clearAllPresets() {
        try {
            // Clear state
            this.state.presets = {};
            
            // Clear localStorage
            localStorage.removeItem('fileToMarkdownPresets');
            
            // Remove all preset buttons from cidron-box
            if (this.cidronBox) {
                this.cidronBox.querySelectorAll('.btn-preset').forEach(btn => btn.remove());
            }
            
            console.log('All presets have been cleared');
            this.showNotification('info', 'All presets have been cleared');
            
            return true;
        } catch (error) {
            console.error('Error clearing presets:', error);
            this.showNotification('error', `Error clearing presets: ${error.message}`);
            return false;
        }
    }

    /**
     * Create and append the garbage button at the bottom of cidron-box
     */
    createGarbageButton() {
        if (this.garbageBtn) return; // Already created

        if (!this.cidronBox) {
           console.error("Cidron box not found, cannot add Garbage button.");
           return;
        }

        this.garbageBtn = document.createElement('button');
        this.garbageBtn.id = 'btn-garbage';
        this.garbageBtn.className = 'btn btn-garbage';
        this.garbageBtn.title = 'Remove All Presets';
        // Trash icon SVG
        this.garbageBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
        `;
        
        // Push garbage button to the right
        this.garbageBtn.style.marginLeft = 'auto';

        // Add event listener for removing all presets
        this.garbageBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to remove ALL saved presets? This cannot be undone.')) {
                this.clearAllPresets();
            }
        });

        // Append to cidron-box
        this.cidronBox.appendChild(this.garbageBtn);
        console.log("Garbage button created and added to the cidron-box.");
    }
}

// Allow for both module and direct browser use
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { StateManager };
} 