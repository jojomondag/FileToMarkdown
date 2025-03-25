import FileManager from './utils/fileManager';
import BrowserRenderer from './utils/renderer';
import FileList from './components/FileList';

/**
 * Main application class for FileToMarkdown viewer
 */
class FileToMarkdownViewer {
    constructor() {
        console.log('FileToMarkdownViewer constructor called');
        this.fileManager = new FileManager();
        this.renderer = new BrowserRenderer();
        this.elements = this.getElements();
        this.setupComponents();
        this.setupEventListeners();
        this.restoreSidebarState();
        this.setupFileChangeListener();
        this.setupEditorElement();
        this.isEditorMode = false;
        this.originalContent = '';
        this.setupFileInput(); // Set up persistent file input
    }

    getElements() {
        return {
            content: document.getElementById('content'),
            sidebar: document.querySelector('.sidebar'),
            main: document.querySelector('.main-content'),
            fileList: document.getElementById('l'),
            dropZone: document.getElementById('z'),
            toggleButton: document.getElementById('b'),
            controls: document.querySelector('.controls'),
            editor: null, // Will be created later
            saveButton: null, // Will be created later
            editButton: document.getElementById('e'), // Try to get existing button
            fileInput: null, // Will be set up in setupFileInput
            dirInput: null, // Will be set up in setupFileInput
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
        console.log('Setting up unified file input');
        
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
            console.log('File input change detected');
            if (e.target.files && e.target.files.length > 0) {
                console.log(`${e.target.files.length} files/folders selected`);
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
        
        console.log('Unified file input setup complete');
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
        
        // Remove ALL existing click event listeners by cloning the node
        const newDropZone = dropZone.cloneNode(true);
        dropZone.parentNode.replaceChild(newDropZone, dropZone);
        
        // Update our reference
        this.elements.dropZone = newDropZone;
        
        // Add a single click event handler
        newDropZone.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Dropzone clicked, opening file dialog');
            
            // Create and show a file dialog that allows directory selection
            const input = this.elements.fileInput;
            input.webkitdirectory = true; // Enable directory selection
            input.directory = true;       // Non-webkit browsers
            input.multiple = true;        // Allow multiple selection
            input.accept = '.md';         // Still filter for markdown files
            input.click();
        });
    }

    handleFiles(fileList) {
        // Clear existing files to prevent duplication
        this.fileManager.clearFiles();
        
        if (this.fileManager.processFiles(fileList)) {
            this.fileListComponent.render();
            if (this.fileManager.files.length > 0) this.loadFile(0);
        } else {
            this.showError('No markdown (.md) files found in the selected files/folders.');
        }
    }

    showError(message) {
        this.elements.content.innerHTML = `<p style="color:red">${message}</p>`;
        
        // Hide the button container and buttons when showing an error
        if (this.elements.buttonContainer) {
            this.elements.buttonContainer.style.display = 'none';
        }
        this.elements.editButton.style.display = 'none';
        this.elements.saveButton.style.display = 'none';
    }

    loadFile(index) {
        const fileInfo = this.fileManager.getFile(index);
        if (!fileInfo) return;

        // Reset edit mode to false when loading a file
        this.isEditorMode = false;
        
        this.fileManager.setCurrentFile(index);
        this.updateFileListSelection(index);

        // Show button container and edit button when a file is loaded
        if (this.elements.buttonContainer) {
            this.elements.buttonContainer.style.display = 'flex';
        }
        
        if (this.elements.editButton) {
            this.elements.editButton.style.display = 'flex';
        }
        
        // Explicitly hide save button when loading a file (we're not in edit mode)
        if (this.elements.saveButton) {
            this.elements.saveButton.style.display = 'none';
        }
        
        // Position the buttons
        this.updateButtonPositions();
        // Force an immediate update of button positions to ensure they're visible
        setTimeout(() => this.updateButtonPositions(), 100);

        const reader = new FileReader();
        reader.onload = e => {
            const content = e.target.result;
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
        };
        reader.onerror = e => this.showError(`Error reading file: ${e.target.error}`);
        reader.readAsText(fileInfo.file);
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
        
        // Control visibility of components based on edit mode
        editButton.style.display = 'flex'; // Edit button always visible when a file is loaded
        
        // STRICT CONTROL: Save button is ONLY visible in editor mode
        saveButton.style.display = this.isEditorMode === true ? 'flex' : 'none';
        
        // Add or remove edit-mode class on the container
        if (this.isEditorMode) {
            buttonContainer.classList.add('edit-mode');
            buttonContainer.classList.remove('view-mode');
            editButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>';
        } else {
            buttonContainer.classList.remove('edit-mode');
            buttonContainer.classList.add('view-mode');
            editButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>';
            
            // Force hide save button outside edit mode
            saveButton.style.display = 'none';
        }
        
        // Make sure the container itself is visible
        buttonContainer.style.display = 'flex';
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
        
        console.log('Resolving link:', {
            href,
            currentDir,
            targetPath
        });
        
        // Try to find the file by path
        let fileIndex = this.findFileByPath(targetPath);
        
        if (fileIndex !== undefined) {
            console.log('File found, loading index:', fileIndex);
            this.loadFile(fileIndex);
        } else {
            // If not found, try case-insensitive search
            console.log('File not found by exact path, trying alternative methods');
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
        if (!this.isEditorMode) return;
        
        console.log('[DEBUG] Save button clicked');
        
        const content = this.elements.editor.value;
        
        // Check if there's a current file
        if (this.fileManager.currentFileIndex === -1) {
            this.showError('No file selected to save');
            return;
        }
        
        try {
            // Force body to have edit-mode class
            document.body.classList.add('edit-mode');
            
            console.log('[DEBUG] Before save - buttonContainer display:', this.elements.buttonContainer.style.display);
            
            // Save to disk if it's a file from the file system
            const success = await this.fileManager.saveCurrentFile(content);
            
            console.log('[DEBUG] After save - buttonContainer display:', this.elements.buttonContainer.style.display);
            
            if (success) {
                // Update original content
                this.originalContent = content;
                
                // Update the view if not in editor mode (shouldn't happen, but just in case)
                if (!this.isEditorMode) {
                    this.elements.content.innerHTML = this.renderer.render(content);
                    this.renderer.highlightAll();
                    this.setupLinkHandlers();
                }
                
                console.log('File saved successfully');
                console.log('[DEBUG] After rendering - buttonContainer display:', this.elements.buttonContainer.style.display);
                
                // Ensure body still has edit-mode class
                document.body.classList.add('edit-mode');
                
                // FORCE BUTTON VISIBILITY IMMEDIATELY
                document.getElementById('button-container').style.display = 'flex';
                
                // Make sure the button container is visible and has the right class
                this.elements.buttonContainer.style.display = 'flex';
                this.elements.buttonContainer.classList.add('edit-mode');
                this.elements.buttonContainer.classList.remove('view-mode');
                
                // Make sure both buttons are visible
                this.elements.editButton.style.display = 'flex'; 
                this.elements.saveButton.style.display = 'flex';
                
                // Set the editor button to X icon
                this.elements.editButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>';
                
                // Force update button positions immediately AND after a delay
                this.updateButtonPositions();
                
                // Schedule multiple checks to make sure buttons stay visible
                setTimeout(() => {
                    console.log('[DEBUG] First timeout - buttonContainer display:', this.elements.buttonContainer.style.display);
                    document.body.classList.add('edit-mode');
                    this.elements.buttonContainer.style.display = 'flex';
                    document.getElementById('button-container').style.display = 'flex';
                    this.updateButtonPositions();
                }, 10);
                
                setTimeout(() => {
                    console.log('[DEBUG] Second timeout - buttonContainer display:', this.elements.buttonContainer.style.display);
                    document.body.classList.add('edit-mode');
                    this.elements.buttonContainer.style.display = 'flex';
                    document.getElementById('button-container').style.display = 'flex';
                    this.updateButtonPositions();
                }, 50);
                
                setTimeout(() => {
                    console.log('[DEBUG] Third timeout - buttonContainer display:', this.elements.buttonContainer.style.display);
                    document.body.classList.add('edit-mode');
                    this.elements.buttonContainer.style.display = 'flex';
                    document.getElementById('button-container').style.display = 'flex';
                    this.updateButtonPositions();
                }, 100);
            } else {
                this.showError('Error saving file');
            }
        } catch (error) {
            console.error('Error in saveFile:', error);
            this.showError(`Error saving file: ${error.message}`);
            
            // Even on error, ensure buttons remain visible
            document.body.classList.add('edit-mode');
            this.elements.buttonContainer.style.display = 'flex';
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
}

// Initialize the application
window.addEventListener('DOMContentLoaded', () => {
    window.app = new FileToMarkdownViewer();
    
    // Add window resize event listener to update button positions
    window.addEventListener('resize', () => {
        if (window.app.fileManager.currentFileIndex !== -1) {
            window.app.updateButtonPositions();
        }
    });
}); 