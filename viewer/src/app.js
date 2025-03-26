import FileManager from './utils/fileManager';
import BrowserRenderer from './utils/renderer';
import FileList from './components/FileList';
import Database from './utils/database';
import Header from './components/Header';
import Editor from './components/Editor';
import Preview from './components/Preview';

/**
 * Main application class for FileToMarkdown viewer
 */
class FileToMarkdownViewer {
    constructor() {
        this.fileManager = new FileManager();
        this.renderer = new BrowserRenderer();
        this.elements = this.getElements();
        
        // Debug localStorage contents
        console.log('========= DEBUG LOCALSTORAGE =========');
        console.log('Available localStorage keys:');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            console.log(`Key: ${key}, Size: ${localStorage.getItem(key).length} bytes`);
        }
        
        // Check for our specific keys
        console.log('Our localStorage keys:');
        console.log('LOADED_FILES_KEY:', localStorage.getItem('fileToMarkdown_loadedFiles') ? 'exists' : 'not found');
        console.log('LOADED_FILES_FOLDERS_KEY:', localStorage.getItem('fileToMarkdown_loadedFiles_folders') ? 'exists' : 'not found');
        console.log('LOADED_FILES_CURRENT_INDEX:', localStorage.getItem('fileToMarkdown_loadedFiles_currentIndex') ? 'exists' : 'not found');
        console.log('======================================');
        
        this.setupComponents();
        this.setupEventListeners();
        this.restoreSidebarState();
        this.setupFileChangeListener();
        this.setupEditorElement();
        this.isEditorMode = false;
        this.originalContent = '';
        this.setupFileInput(); // Set up persistent file input
        
        // Try to restore the previously opened files when the page loads
        this.restoreFilesOnLoad();
        
        // Set up beforeunload event to save files to localStorage
        window.addEventListener('beforeunload', () => {
            // Save current files to localStorage
            if (this.fileManager.files && this.fileManager.files.length > 0) {
                this.fileManager.saveFilesToLocalStorage();
                
                // If we're in editor mode, save the current file content
                if (this.isEditorMode && this.elements.editor.value) {
                    const fileInfo = this.fileManager.getCurrentFile();
                    if (fileInfo) {
                        fileInfo.content = this.elements.editor.value;
                        this.fileManager.saveFilesToLocalStorage();
                    }
                }
            }
        });
    }

    getElements() {
        return {
            content: document.getElementById('content'),
            sidebar: document.querySelector('.sidebar'),
            main: document.querySelector('.main-content'),
            fileList: document.getElementById('l'),
            dropZone: document.getElementById('z'),
            toggleButton: document.getElementById('b'),
            editor: null, // Will be created later
            saveButton: null, // Will be created later
            editButton: document.getElementById('e'), // Try to get existing button
            fileInput: null, // Will be set up in setupFileInput
            buttonContainer: null // Will be set up in setupComponents
        };
    }

    setupComponents() {
        this.fileListComponent = new FileList(this.elements.fileList, this.fileManager);
        this.fileListComponent.on('fileSelect', ({ index }) => this.loadFile(index));
        
        // Remove any existing buttons from previous instances
        const existingContainer = document.querySelector('.button-container');
        if (existingContainer) {
            existingContainer.parentNode.removeChild(existingContainer);
        }
        
        // Create a fixed container for both buttons that will stay in position
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        buttonContainer.id = 'button-container';
        // Use fixed positioning with specific coordinates
        buttonContainer.style.position = 'fixed';
        buttonContainer.style.top = '10px';
        buttonContainer.style.right = '10px';
        buttonContainer.style.zIndex = '2000';
        buttonContainer.style.display = 'none'; // Hidden by default
        buttonContainer.style.gap = '10px';
        
        // Create edit button
        const editButton = document.createElement('button');
        editButton.id = 'e';
        editButton.className = 'btn btn-edit';
        editButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>';
        editButton.onclick = () => this.toggleEditor();
        
        // Create save button
        const saveButton = document.createElement('button');
        saveButton.className = 'btn btn-save';
        saveButton.id = 's';
        saveButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>';
        saveButton.style.display = 'none'; // Hidden initially
        saveButton.onclick = () => this.saveFile();
        
        // Store references to our elements
        this.elements.saveButton = saveButton;
        this.elements.editButton = editButton;
        this.elements.buttonContainer = buttonContainer;
        
        // Add buttons to the container
        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(saveButton);
        
        // Add container to the document body
        document.body.appendChild(buttonContainer);
    }
    
    setupEditorElement() {
        // Create the editor textarea
        this.elements.editor = document.createElement('textarea');
        this.elements.editor.className = 'editor';
        this.elements.editor.style.display = 'none';
        this.elements.editor.style.width = '100%';
        this.elements.editor.style.height = '100%';
        this.elements.editor.style.boxSizing = 'border-box';
        this.elements.editor.style.padding = '50px 20px 20px'; // Extra top padding for buttons
        this.elements.editor.style.border = 'none';
        this.elements.editor.style.fontFamily = 'monospace';
        this.elements.editor.style.fontSize = '16px';
        this.elements.editor.style.resize = 'none';
        this.elements.editor.style.outline = 'none';
        this.elements.editor.style.position = 'relative'; // Important for absolute positioning of buttons
        this.elements.main.appendChild(this.elements.editor);
    }

    setupEventListeners() {
        // Only handle drag events for the dropzone, clicks are handled separately
        const dropZone = this.elements.dropZone;
        
        // Handle drag and drop events
        ['dragover', 'dragleave', 'drop'].forEach(event => {
            dropZone.addEventListener(event, e => {
                e.preventDefault();
                e.stopPropagation();
                dropZone.classList.toggle('active', event === 'dragover');
                if (event === 'drop') this.handleFiles(Array.from(e.dataTransfer.files));
            });
        });

        this.elements.toggleButton.onclick = () => this.toggleSidebar();
        document.onkeydown = e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.toggleSidebar();
            } else if ((e.ctrlY || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (this.isEditorMode) {
                    this.saveFile();
                }
            }
        };
    }
    
    setupFileChangeListener() {
        // Listen for file changes from the file system
        window.addEventListener('fileChanged', (event) => {
            const { fileIndex } = event.detail;
            
            // If this is the current file and we're not in editor mode, reload it
            if (fileIndex === this.fileManager.currentFileIndex && !this.isEditorMode) {
                this.loadFile(fileIndex);
            }
        });
    }
    
    setupFileInput() {
        // Remove any existing file inputs to avoid duplicates
        const existingInput = document.getElementById('file-input');
        if (existingInput) {
            existingInput.parentNode.removeChild(existingInput);
        }
        
        // Create a single input for files and directories
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'file-input';
        fileInput.accept = '.md';
        fileInput.multiple = true;
        fileInput.style.display = 'none';
        
        // Change event listener for the unified input
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                this.handleFiles(Array.from(e.target.files));
            }
            
            // Reset the input to ensure it works correctly on subsequent clicks
            e.target.value = '';
        });
        
        document.body.appendChild(fileInput);
        
        // Store input in elements
        this.elements.fileInput = fileInput;
        
        // Update the dropzone UI
        this.updateDropzoneUI();
    }
    
    updateDropzoneUI() {
        const dropZone = this.elements.dropZone;
        if (!dropZone) return;
        
        // Clear existing content
        dropZone.innerHTML = '';
        
        // Create a simple icon and text for a cleaner UI
        const uploadIcon = document.createElement('div');
        uploadIcon.className = 'dropzone-icon';
        uploadIcon.innerHTML = '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>';
        
        // Add instruction text
        const dropText = document.createElement('p');
        dropText.className = 'dropzone-text';
        dropText.innerHTML = 'Click to select files or folders<br>or drop markdown files here';
        
        // Add elements to dropzone
        dropZone.appendChild(uploadIcon);
        dropZone.appendChild(dropText);
        
        // Check if we have recent files
        const recentFiles = this.fileManager.getRecentFiles();
        if (recentFiles.length > 0) {
            // Add recent files section
            const recentSection = document.createElement('div');
            recentSection.className = 'recent-files-section';
            
            const recentTitle = document.createElement('h3');
            recentTitle.className = 'recent-title';
            recentTitle.textContent = 'Recent Files';
            recentSection.appendChild(recentTitle);
            
            // Add recent files list (show up to 5 most recent)
            const recentList = document.createElement('ul');
            recentList.className = 'recent-list';
            
            recentFiles.slice(0, 5).forEach((recent) => {
                const item = document.createElement('li');
                const link = document.createElement('a');
                link.href = '#';
                link.textContent = recent.name;
                link.title = recent.path;
                
                // Add click handler to open recent file
                link.addEventListener('click', async (e) => {
                    e.preventDefault();
                    const success = await this.fileManager.openRecentFile(recent);
                    if (success) {
                        this.loadFile(0);
                    }
                });
                
                item.appendChild(link);
                recentList.appendChild(item);
            });
            
            recentSection.appendChild(recentList);
            dropZone.appendChild(recentSection);
        }
        
        // Add click handler
        dropZone.onclick = async (e) => {
            // Only trigger file selector if clicking on the dropzone itself or its icon/text
            if (e.target.closest('.recent-files-section')) {
                return; // Skip if clicking on recent files section
            }
            
            e.preventDefault();
            e.stopPropagation();
            
            // First try to use File System Access API if supported
            if ('showOpenFilePicker' in window) {
                try {
                    // Use the FileManager to handle files from File System API
                    const success = await this.fileManager.processFilesFromFileSystemAPI();
                    
                    if (success) {
                        // Display the first file by default
                        this.loadFile(0);
                        return;
                    }
                } catch (error) {
                    console.error('Error opening files with File System API:', error);
                }
            }
            
            // Fall back to standard file input if File System API failed or is not supported
            this.elements.fileInput.click();
        };
    }

    async handleFiles(files) {
        console.log('Handling files:', files.length);
        
        // Update the UI to show loading state
        this.elements.dropZone.innerHTML = '<p>Processing files...</p>';
        
        // Process the files with the file manager
        const processed = await this.fileManager.handleFileUpload(files);
        
        if (processed) {
            console.log('Files processed successfully, loading first file');
            
            // Hide the drop zone
            this.elements.dropZone.style.display = 'none';
            
            // Show the button container
            this.elements.buttonContainer.style.display = 'flex';
            
            // Load the first file
            this.loadFile(this.fileManager.currentFileIndex);
            
            // Make sure files are saved to localStorage
            this.fileManager.saveFilesToLocalStorage();
            
            return true;
        } else {
            console.log('No files processed');
            
            // Reset the dropzone UI
            this.updateDropzoneUI();
            return false;
        }
    }

    showError(message) {
        this.elements.content.innerHTML = `<p style="color:red">${message}</p>`;
        
        // Hide the button container when showing an error
        if (this.elements.buttonContainer) {
            this.elements.buttonContainer.style.display = 'none';
        }
    }

    loadFile(index) {
        const fileInfo = this.fileManager.getFile(index);
        if (!fileInfo) return;

        // Reset edit mode to false when loading a file
        this.isEditorMode = false;
        
        this.fileManager.setCurrentFile(index);
        this.updateFileListSelection(index);

        // Show button container when a file is loaded
        if (this.elements.buttonContainer) {
            this.elements.buttonContainer.style.display = 'flex';
        }
        
        // Update button positions
        this.updateButtonPositions();
        
        // Force an immediate update of button positions to ensure they're visible
        setTimeout(() => this.updateButtonPositions(), 100);

        // Use content directly if available or read from file object
        if (fileInfo.content) {
            this.displayFileContent(fileInfo.content);
            return;
        }
        
        // If we don't have content but have a file object, read it
        if (fileInfo.file) {
            const reader = new FileReader();
            reader.onload = e => {
                const content = e.target.result;
                this.originalContent = content;
                
                // Store content in fileInfo for future use
                fileInfo.content = content;
                
                this.displayFileContent(content);
            };
            reader.onerror = e => this.showError(`Error reading file: ${e.target.error}`);
            reader.readAsText(fileInfo.file);
        } else {
            this.showError('File content not available');
        }
    }
    
    displayFileContent(content) {
        this.originalContent = content;
        
        if (this.isEditorMode) {
            this.elements.editor.value = content;
        } else {
            this.elements.content.innerHTML = this.renderer.render(content);
            this.renderer.highlightAll();
            this.setupLinkHandlers();
        }
        
        // Ensure buttons are visible after content is loaded
        this.updateButtonPositions();
    }

    updateButtonPositions() {
        // Get references to our elements
        const buttonContainer = this.elements.buttonContainer;
        const editButton = this.elements.editButton;
        const saveButton = this.elements.saveButton;
        
        // Safety check - if elements don't exist, don't do anything
        if (!buttonContainer || !editButton || !saveButton) {
            console.error('Missing button elements');
            return;
        }
        
        // Set base visibility
        buttonContainer.style.display = 'flex';
        editButton.style.display = 'flex';
        
        // Update container classes and button appearance based on mode
        if (this.isEditorMode) {
            buttonContainer.classList.add('edit-mode');
            buttonContainer.classList.remove('view-mode');
            editButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>';
            saveButton.style.display = 'flex';
        } else {
            buttonContainer.classList.remove('edit-mode');
            buttonContainer.classList.add('view-mode');
            editButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>';
            saveButton.style.display = 'none';
        }
    }

    updateFileListSelection(index) {
        // Update FileList component selection state
        this.fileListComponent.setState({ selectedIndex: index });
        
        // Ensure parent folders are expanded to show the selected file
        const fileInfo = this.fileManager.getFile(index);
        if (fileInfo && fileInfo.folder) {
            this.expandParentFolders(fileInfo.folder);
        }
    }

    expandParentFolders(folderPath) {
        if (!folderPath) return;
        
        const expandedFolders = new Set(this.fileListComponent.state.expandedFolders);
        let currentPath = folderPath;
        
        // Add this folder and all parent folders to the expanded set
        while (currentPath) {
            expandedFolders.add(currentPath);
            const folderInfo = this.fileManager.getFolderInfo(currentPath);
            currentPath = folderInfo?.parent;
        }
        
        this.fileListComponent.setState({ expandedFolders });
    }

    setupLinkHandlers() {
        const links = this.elements.content.getElementsByTagName('a');
        Array.from(links).forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.endsWith('.md')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleInternalLink(href);
                });
            }
        });
    }

    handleInternalLink(href) {
        const currentFile = this.fileManager.getCurrentFile();
        if (!currentFile) return;
        
        const currentDir = currentFile.folder || '';
        const targetPath = this.resolvePath(href, currentDir);
        
        // Try to find the file by path
        let fileIndex = this.findFileByPath(targetPath);
        
        if (fileIndex !== undefined) {
            this.loadFile(fileIndex);
        } else {
            // If not found, try case-insensitive search
            this.showError(`Could not find linked file: ${href}`);
        }
    }
    
    findFileByPath(targetPath) {
        // First try direct match
        let fileIndex = this.fileManager.fileMap.get(targetPath.toLowerCase());
        
        // If not found and it doesn't have a root directory, try with various folders
        if (fileIndex === undefined && !targetPath.includes('/')) {
            // Just try to find a file with this name anywhere
            for (let i = 0; i < this.fileManager.files.length; i++) {
                const file = this.fileManager.files[i];
                if (file.name.toLowerCase() === targetPath.toLowerCase()) {
                    return i;
                }
            }
        }
        
        return fileIndex;
    }

    resolvePath(href, currentDir) {
        // Clean up path parts
        href = href.replace(/\\/g, '/');
        currentDir = currentDir.replace(/\\/g, '/');
        
        // Handle various path types
        if (href.startsWith('/')) {
            // Absolute path from root
            return href.slice(1);
        } else if (href.startsWith('./')) {
            // Relative path from current directory
            return currentDir ? `${currentDir}/${href.slice(2)}` : href.slice(2);
        } else if (href.startsWith('../')) {
            // Going up in the directory tree
            const parts = currentDir.split('/');
            if (parts.length <= 1) {
                return href.slice(3);
            }
            const parentDir = parts.slice(0, -1).join('/');
            return this.resolvePath(href.slice(3), parentDir);
        } else {
            // Treating it as a relative path from current directory
            // If path has no directory, check if it's a file directly in current directory
            if (!href.includes('/')) {
                for (let i = 0; i < this.fileManager.files.length; i++) {
                    const file = this.fileManager.files[i];
                    if (file.name.toLowerCase() === href.toLowerCase() && 
                        file.folder.toLowerCase() === currentDir.toLowerCase()) {
                        return file.path;
                    }
                }
            }
            
            // Otherwise join with current directory
            return currentDir ? `${currentDir}/${href}` : href;
        }
    }
    
    toggleEditor() {
        this.isEditorMode = !this.isEditorMode;
        
        // Ensure we have valid references to our UI elements
        if (!this.elements.buttonContainer || !this.elements.saveButton || !this.elements.editButton) {
            console.error('Missing UI elements for editor mode');
            return;
        }
        
        // Immediately set the save button visibility based on the new mode
        this.elements.saveButton.style.display = this.isEditorMode ? 'flex' : 'none';
        
        if (this.isEditorMode) {
            // Add edit-mode class to body for styling
            document.body.classList.add('edit-mode');
            
            // Switch to editor mode
            this.elements.editor.style.display = 'block';
            this.elements.content.style.display = 'none';
            
            // Load current content into editor
            this.elements.editor.value = this.originalContent;
        } else {
            // Remove edit-mode class from body
            document.body.classList.remove('edit-mode');
            
            // Switch to preview mode
            this.elements.editor.style.display = 'none';
            this.elements.content.style.display = 'block';
            
            // Render the editor content for preview (without saving)
            this.elements.content.innerHTML = this.renderer.render(this.elements.editor.value);
            this.renderer.highlightAll();
            this.setupLinkHandlers();
        }
        
        // Always update button positions/state after mode change
        this.updateButtonPositions();
    }
    
    async saveFile() {
        const fileInfo = this.fileManager.getCurrentFile();
        if (!fileInfo) return;
        
        const content = this.elements.editor.value;
        this.originalContent = content; // Update the original content
        
        try {
            // Show save indicator
            this.elements.saveButton.classList.add('saving');
            this.elements.saveButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>';
            
            const success = await this.fileManager.saveCurrentFile(content);
            
            if (success) {
                // Update the displayed file when switching back to view mode
                if (!this.isEditorMode) {
                    this.loadFile(this.fileManager.currentFileIndex);
                }
                
                // Show success indicator
                this.elements.saveButton.classList.remove('saving');
                this.elements.saveButton.classList.add('saved');
                this.elements.saveButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                
                // Reset to save icon after a delay
                setTimeout(() => {
                    this.elements.saveButton.classList.remove('saved');
                    this.elements.saveButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>';
                }, 2000);
            } else {
                // Show error indicator
                this.elements.saveButton.classList.remove('saving');
                this.elements.saveButton.classList.add('error');
                this.elements.saveButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
                
                this.showError('Failed to save file');
                
                // Reset to save icon after a delay
                setTimeout(() => {
                    this.elements.saveButton.classList.remove('error');
                    this.elements.saveButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>';
                }, 2000);
            }
        } catch (error) {
            console.error('Error saving file:', error);
            this.showError('Error saving file: ' + error.message);
            
            // Reset button state
            this.elements.saveButton.classList.remove('saving');
            this.elements.saveButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>';
        }
    }

    toggleSidebar() {
        this.elements.sidebar.classList.toggle('hidden');
        this.elements.main.classList.toggle('expanded');
        this.elements.toggleButton.classList.toggle('shifted');
        localStorage.setItem('sidebarCollapsed', this.elements.sidebar.classList.contains('hidden'));
        
        // Re-position the buttons after sidebar toggle
        setTimeout(() => this.updateButtonPositions(), 300); // Wait for transition to complete
    }

    restoreSidebarState() {
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebarCollapsed) this.toggleSidebar();
    }

    /**
     * Try to restore files from the previous session when the page loads
     */
    async restoreFilesOnLoad() {
        console.log('Attempting to restore files on load');
        
        // First, try to see if the fileManager already restored a session
        if (this.fileManager.sessionRestored || this.fileManager.files.length > 0) {
            console.log('Files already restored by fileManager, loading current file');
            if (this.fileManager.currentFileIndex >= 0) {
                this.loadFile(this.fileManager.currentFileIndex);
                
                // Show the button container since we have a file loaded
                if (this.elements.buttonContainer) {
                    this.elements.buttonContainer.style.display = 'flex';
                }
                
                // Hide the drop zone
                if (this.elements.dropZone) {
                    this.elements.dropZone.style.display = 'none';
                }
                
                // Show the main content area
                this.elements.main.style.display = 'block';
                
                return true;
            }
        }
        
        // Check if we have files in localStorage
        try {
            const filesLoaded = this.fileManager.loadFilesFromLocalStorage();
            if (filesLoaded && this.fileManager.files.length > 0) {
                console.log('Files loaded from localStorage, loading current file');
                if (this.fileManager.currentFileIndex >= 0) {
                    this.loadFile(this.fileManager.currentFileIndex);
                    
                    // Show the button container
                    if (this.elements.buttonContainer) {
                        this.elements.buttonContainer.style.display = 'flex';
                    }
                    
                    // Hide the drop zone
                    if (this.elements.dropZone) {
                        this.elements.dropZone.style.display = 'none';
                    }
                    
                    // Show the main content area
                    this.elements.main.style.display = 'block';
                    
                    // Force re-render of the file tree
                    this.fileListComponent.render();
                    
                    return true;
                }
            }
        } catch (error) {
            console.error('Error restoring files from localStorage:', error);
        }
        
        // No files were restored, show the drop zone
        if (this.elements.dropZone) {
            this.elements.dropZone.style.display = 'block';
        }
        return false;
    }
}

// Create and initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new FileToMarkdownViewer();
    
    // Expose app to window for debugging
    window.app = app;
    
    console.log('FileToMarkdown Viewer initialized');
}); 