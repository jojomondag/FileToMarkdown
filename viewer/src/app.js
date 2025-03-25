import FileManager from './utils/fileManager';
import BrowserRenderer from './utils/renderer';
import FileList from './components/FileList';

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
        this.restoreSidebarState();
        this.setupFileChangeListener();
        this.setupEditorElement();
        this.isEditorMode = false;
        this.originalContent = '';
    }

    getElements() {
        return {
            content: document.getElementById('c'),
            sidebar: document.querySelector('.p'),
            main: document.querySelector('.m'),
            fileList: document.getElementById('l'),
            dropZone: document.getElementById('z'),
            toggleButton: document.getElementById('b'),
            controls: document.querySelector('.controls'),
            editor: null, // Will be created later
            saveButton: null, // Will be created later
            editButton: document.getElementById('e') // Try to get existing button
        };
    }

    setupComponents() {
        this.fileListComponent = new FileList(this.elements.fileList, this.fileManager);
        this.fileListComponent.on('fileSelect', ({ index }) => this.loadFile(index));
        
        // Create save button
        this.elements.saveButton = document.createElement('button');
        this.elements.saveButton.textContent = 'Save';
        this.elements.saveButton.className = 'save-btn';
        this.elements.saveButton.id = 's'; // Add ID for styling
        this.elements.saveButton.style.display = 'none';
        this.elements.saveButton.onclick = () => this.saveFile();
        document.body.appendChild(this.elements.saveButton); // Add to body for absolute positioning
        
        // Create pencil edit button (floating in content window) if it doesn't exist
        if (!this.elements.editButton) {
            this.elements.editButton = document.createElement('button');
            this.elements.editButton.id = 'e'; // Add ID for future reference
            this.elements.editButton.className = 'e'; // Using short class name like the hamburger button
            this.elements.editButton.style.display = 'none'; // Hide button initially
            this.elements.editButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>';
            this.elements.editButton.onclick = () => this.toggleEditor();
            document.body.appendChild(this.elements.editButton);
        } else {
            // Configure existing button
            this.elements.editButton.style.display = 'none';
            this.elements.editButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>';
            this.elements.editButton.onclick = () => this.toggleEditor();
        }
    }
    
    setupEditorElement() {
        // Create the editor textarea
        this.elements.editor = document.createElement('textarea');
        this.elements.editor.className = 'editor';
        this.elements.editor.style.display = 'none';
        this.elements.editor.style.width = '100%';
        this.elements.editor.style.height = '100%';
        this.elements.editor.style.boxSizing = 'border-box';
        this.elements.editor.style.padding = '20px';
        this.elements.editor.style.border = 'none';
        this.elements.editor.style.fontFamily = 'monospace';
        this.elements.editor.style.fontSize = '16px';
        this.elements.editor.style.resize = 'none';
        this.elements.editor.style.outline = 'none';
        this.elements.main.appendChild(this.elements.editor);
    }

    setupEventListeners() {
        this.elements.dropZone.addEventListener('click', () => this.createAndClickFileInput());
        
        ['dragover', 'dragleave', 'drop'].forEach(event => {
            this.elements.dropZone.addEventListener(event, e => {
                e.preventDefault();
                e.stopPropagation();
                this.elements.dropZone.classList.toggle('d', event === 'dragover');
                if (event === 'drop') this.handleFiles(Array.from(e.dataTransfer.files));
            });
        });

        ['dragover', 'drop'].forEach(event => {
            document.addEventListener(event, e => {
                e.preventDefault();
                e.stopPropagation();
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
    
    createAndClickFileInput() {
        const oldInput = document.getElementById('temp-file-input');
        if (oldInput) document.body.removeChild(oldInput);
        
        const tempInput = document.createElement('input');
        Object.assign(tempInput, {
            type: 'file',
            id: 'temp-file-input',
            accept: '.md',
            multiple: true,
            webkitdirectory: true,
            directory: true,
            style: 'display:none'
        });
        
        tempInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
            document.body.removeChild(tempInput);
        });
        
        document.body.appendChild(tempInput);
        tempInput.click();
    }
    
    async openFileDialog() {
        // Use the browser's file picker API
        try {
            const options = {
                types: [
                    {
                        description: 'Markdown Files',
                        accept: {
                            'text/markdown': ['.md']
                        }
                    }
                ],
                multiple: true
            };
            
            const fileHandles = await window.showOpenFilePicker(options);
            if (!fileHandles || fileHandles.length === 0) return;
            
            const filePaths = [];
            for (const handle of fileHandles) {
                // Get the file object
                const file = await handle.getFile();
                // Store the path for later use
                filePaths.push(file.path || file.name);
            }
            
            if (filePaths.length > 0) {
                // Process the files through FileManager
                const success = await this.fileManager.processFileSystem(filePaths);
                
                if (success) {
                    this.fileListComponent.render();
                    if (this.fileManager.files.length > 0) {
                        this.loadFile(0);
                    }
                } else {
                    this.showError('No markdown (.md) files found in the selected files.');
                }
            }
        } catch (error) {
            console.error('Error opening files:', error);
            this.showError('Error opening files: ' + error.message);
        }
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
        // Hide the edit button when showing an error
        this.elements.editButton.style.display = 'none';
        this.elements.saveButton.style.display = 'none';
    }

    loadFile(index) {
        const fileInfo = this.fileManager.getFile(index);
        if (!fileInfo) return;

        this.fileManager.setCurrentFile(index);
        this.updateFileListSelection(index);

        // Position the edit button in the top right of the content
        this.updateButtonPositions();
        
        // Show edit button when a file is loaded
        this.elements.editButton.style.display = 'flex';

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
        };
        reader.onerror = e => this.showError(`Error reading file: ${e.target.error}`);
        reader.readAsText(fileInfo.file);
    }
    
    updateButtonPositions() {
        // Get the position of the content element
        const contentRect = this.elements.content.getBoundingClientRect();
        
        // Position the edit button in the top right of the content area
        this.elements.editButton.style.position = 'fixed';
        this.elements.editButton.style.top = `${contentRect.top + 10}px`;
        this.elements.editButton.style.right = `${window.innerWidth - contentRect.right + 10}px`;
        this.elements.editButton.style.zIndex = '1000';
        
        // Position the save button to the left of the edit button
        this.elements.saveButton.style.position = 'fixed';
        this.elements.saveButton.style.top = `${contentRect.top + 10}px`;
        this.elements.saveButton.style.right = `${window.innerWidth - contentRect.right + 60}px`; // 60px to leave space for edit button
        this.elements.saveButton.style.zIndex = '1000';
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
        
        if (this.isEditorMode) {
            // Switch to editor mode
            this.elements.editor.style.display = 'block';
            this.elements.content.style.display = 'none';
            this.elements.saveButton.style.display = 'flex';
            this.elements.editButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>';
            
            // Update button positions
            this.updateButtonPositions();
            
            // Load current content into editor
            this.elements.editor.value = this.originalContent;
        } else {
            // Switch to preview mode
            this.elements.editor.style.display = 'none';
            this.elements.content.style.display = 'block';
            this.elements.saveButton.style.display = 'none';
            this.elements.editButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>';
            
            // Render the editor content for preview (without saving)
            this.elements.content.innerHTML = this.renderer.render(this.elements.editor.value);
            this.renderer.highlightAll();
            this.setupLinkHandlers();
        }
    }
    
    async saveFile() {
        if (!this.isEditorMode) return;
        
        const content = this.elements.editor.value;
        
        // Check if there's a current file
        if (this.fileManager.currentFileIndex === -1) {
            this.showError('No file selected to save');
            return;
        }
        
        // Save to disk if it's a file from the file system
        const success = await this.fileManager.saveCurrentFile(content);
        
        if (success) {
            // Update original content
            this.originalContent = content;
            
            // Update the view
            if (!this.isEditorMode) {
                this.elements.content.innerHTML = this.renderer.render(content);
                this.renderer.highlightAll();
                this.setupLinkHandlers();
            }
            
            console.log('File saved successfully');
        } else {
            this.showError('Error saving file');
        }
    }

    toggleSidebar() {
        this.elements.sidebar.classList.toggle('hidden');
        this.elements.main.classList.toggle('expanded');
        this.elements.toggleButton.classList.toggle('n');
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