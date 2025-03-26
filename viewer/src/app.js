import FileManager from './utils/fileManager';
import BrowserRenderer from './utils/renderer';
import FileList from './components/FileList';
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
        
        this.setupComponents();
        this.setupEventListeners();
        this.setupFileChangeListener();
        this.setupEditorElement();
        this.isEditorMode = false;
        this.originalContent = '';
        this.setupFileInput();
        
        window.addEventListener('beforeunload', (event) => {
            if (this.fileManager.files && this.fileManager.files.length > 0) {
                if (this.isEditorMode && this.elements.editor.value) {
                    const fileInfo = this.fileManager.getCurrentFile();
                    if (fileInfo) {
                        fileInfo.content = this.elements.editor.value;
                    }
                }
                const message = 'You have unsaved changes. Are you sure you want to leave?';
                event.returnValue = message;
                return message;
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
            editor: null,
            saveButton: null,
            editButton: document.getElementById('e'),
            fileInput: null,
            buttonContainer: null
        };
    }

    setupComponents() {
        this.fileListComponent = new FileList(this.elements.fileList, this.fileManager);
        this.fileListComponent.on('fileSelect', ({ index }) => this.loadFile(index));
        
        const existingContainer = document.querySelector('.button-container');
        if (existingContainer) {
            existingContainer.parentNode.removeChild(existingContainer);
        }
        
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'button-container';
        buttonContainer.id = 'button-container';
        buttonContainer.style.position = 'fixed';
        buttonContainer.style.top = '10px';
        buttonContainer.style.right = '10px';
        buttonContainer.style.zIndex = '2000';
        buttonContainer.style.display = 'none';
        buttonContainer.style.gap = '10px';
        
        const editButton = document.createElement('button');
        editButton.id = 'e';
        editButton.className = 'btn btn-edit';
        editButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>';
        editButton.onclick = () => this.toggleEditor();
        
        const saveButton = document.createElement('button');
        saveButton.className = 'btn btn-save';
        saveButton.id = 's';
        saveButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>';
        saveButton.style.display = 'none';
        saveButton.onclick = () => this.saveFile();
        
        this.elements.saveButton = saveButton;
        this.elements.editButton = editButton;
        this.elements.buttonContainer = buttonContainer;
        
        buttonContainer.appendChild(editButton);
        buttonContainer.appendChild(saveButton);
        document.body.appendChild(buttonContainer);
    }
    
    setupEditorElement() {
        this.elements.editor = document.createElement('textarea');
        this.elements.editor.className = 'editor';
        this.elements.editor.style.display = 'none';
        this.elements.editor.style.width = '100%';
        this.elements.editor.style.height = '100%';
        this.elements.editor.style.boxSizing = 'border-box';
        this.elements.editor.style.padding = '50px 20px 20px';
        this.elements.editor.style.border = 'none';
        this.elements.editor.style.fontFamily = 'monospace';
        this.elements.editor.style.fontSize = '16px';
        this.elements.editor.style.resize = 'none';
        this.elements.editor.style.outline = 'none';
        this.elements.editor.style.position = 'relative';
        this.elements.main.appendChild(this.elements.editor);
    }

    setupEventListeners() {
        // Only handle drag events for the dropzone, clicks are handled separately
        const dropZone = this.elements.dropZone;
        
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
        window.addEventListener('fileChanged', (event) => {
            const { fileIndex } = event.detail;
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
        
        // Add click handler
        dropZone.onclick = async (e) => {
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
            
            return true;
        }
        
        return false;
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
        
        // Re-position the buttons after sidebar toggle
        setTimeout(() => this.updateButtonPositions(), 300); // Wait for transition to complete
    }
}

// Create and initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing FileToMarkdown Viewer...');
    
    // Create app instance
    const app = new FileToMarkdownViewer();
    
    // Expose app and fileManager to window for debugging and manual operations
    window.app = app;
    window.fileManager = app.fileManager;
    
    // Log initialization status
    console.log('FileToMarkdown Viewer initialized');
    console.log('FileManager instance available at window.fileManager');
    
    // Dispatch a custom event to notify that the app is ready
    window.dispatchEvent(new CustomEvent('appInitialized', {
        detail: { fileManager: app.fileManager }
    }));
});

export default FileToMarkdownViewer; 