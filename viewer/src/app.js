import FileManager from './utils/fileManager';
import BrowserRenderer from './utils/renderer';
import FileList from './components/FileList';
import Header from './components/Header';
import Editor from './components/Editor';
import Preview from './components/Preview';
import { createElementWithAttributes } from './utils/domUtils';

/**
 * Main application class for FileToMarkdown viewer
 */
class FileToMarkdownViewer {
    constructor() {
        this.fileManager = new FileManager();
        this.renderer = new BrowserRenderer();
        this.elements = this.getElements();
        
        this.isEditorMode = false;
        this.originalContent = '';
        this.isPickerActive = false;
        
        // Setup UI components and event listeners
        this.setupComponents();
        this.setupEventListeners();
        this.setupFileChangeListener();
        this.setupEditorElement();
        this.setupFileInput();
        
        // Initialize sidebar-hidden class on body based on initial sidebar state
        document.body.classList.toggle('sidebar-hidden', this.elements.sidebar.classList.contains('hidden'));
        
        // Ensure buttons are properly hidden/shown based on file selection state
        this.updateButtonPositions();
        
        // Add beforeunload event listener to prevent accidental closing with unsaved changes
        window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
        
        // Handle file errors
        window.addEventListener('fileError', (event) => {
            const { message } = event.detail;
            this.showError(message);
        });
        
        // Handle file warnings (non-critical issues)
        window.addEventListener('fileWarning', (event) => {
            const { message } = event.detail;
            this.showWarning(message);
        });
    }

    /**
     * Handle beforeunload event to warn about unsaved changes
     */
    handleBeforeUnload(event) {
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
    }

    /**
     * Get DOM elements references
     */
    getElements() {
        return {
            content: document.getElementById('content'),
            sidebar: document.querySelector('.sidebar'),
            main: document.querySelector('.main-content'),
            fileList: document.getElementById('l'), // Container for FileList component
            dropZone: document.getElementById('z'), // The dropzone element itself
            toggleButton: document.getElementById('b'), // Sidebar toggle button
            editor: null, // Textarea for editing (created dynamically)
            saveButton: null, // Save button (created dynamically)
            editButton: null, // Edit button (created dynamically initially, may be replaced)
            directoryInput: null, // Input for directory selection fallback
            buttonContainer: null, // Container for edit/save buttons (created dynamically)
            editButtonContainer: null, // Container for edit button (created dynamically)
            contentWrapper: null // Added for the new content wrapper
        };
    }
    /**
     * Setup UI components
     */
    setupComponents() {
        // Initialize file list component
        this.fileListComponent = new FileList(this.elements.fileList, this.fileManager);
        this.fileListComponent.on('fileSelect', ({ index }) => this.loadFile(index));
        
        // Create content wrapper inside content container
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'markdown-content';
        
        // Preserve any existing content
        const existingContent = this.elements.content.innerHTML;
        contentWrapper.innerHTML = existingContent;
        
        // Clear content container and add wrapper
        this.elements.content.innerHTML = '';
        this.elements.content.appendChild(contentWrapper);
        
        // Store reference to content wrapper
        this.elements.contentWrapper = contentWrapper;
        
        // Create button container for edit/save buttons
        this.setupButtonContainer();
    }
    
    /**
     * Create button container for edit/save buttons
     */
    setupButtonContainer() {
        // Remove existing containers if present
        const existingContainer = document.querySelector('.button-container');
        if (existingContainer) {
            existingContainer.parentNode.removeChild(existingContainer);
        }
        
        const existingEditContainer = document.querySelector('.edit-button-container');
        if (existingEditContainer) {
            existingEditContainer.parentNode.removeChild(existingEditContainer);
        }
        
        // Create a single buttons container for both edit and save buttons
        const buttonsContainer = createElementWithAttributes('div', {
            className: 'content-buttons',
            style: {
                position: 'absolute',
                top: '10px',
                left: '10px',
                display: 'flex',
                gap: '10px',
                zIndex: '1001',
                display: 'none' // Initially hidden
            }
        });
        
        // Create edit button
        const editButton = createElementWithAttributes('button', {
            id: 'e',
            className: 'btn btn-edit',
            innerHTML: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>',
            onclick: () => this.toggleEditor()
        });
        
        // Create save button next to the edit button
        const saveButton = createElementWithAttributes('button', {
            className: 'btn btn-save',
            id: 's',
            innerHTML: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
            style: { display: 'none' },
            onclick: () => this.saveFile()
        });
        
        // Store references to the buttons
        this.elements.saveButton = saveButton;
        this.elements.editButton = editButton;
        this.elements.buttonContainer = buttonsContainer;
        
        // Add buttons to the container
        buttonsContainer.appendChild(editButton);
        buttonsContainer.appendChild(saveButton);
        
        // Add the buttons container to the content container
        // Make sure the content element exists
        if (this.elements.content) {
            this.elements.content.appendChild(buttonsContainer);
        } else {
            console.error('Content element not found');
        }
    }
    
    /**
     * Setup editor element
     */
    setupEditorElement() {
        this.elements.editor = createElementWithAttributes('textarea', {
            className: 'editor',
            style: {
                display: 'none',
                width: '100%',
                height: '100%',
                boxSizing: 'border-box',
                padding: '50px 20px 20px',
                border: 'none',
                fontFamily: 'monospace',
                fontSize: '16px',
                resize: 'none',
                outline: 'none',
                position: 'relative'
            }
        });
        
        this.elements.main.appendChild(this.elements.editor);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Handle drag events for drop zone
        const dropZone = this.elements.dropZone;
        
        ['dragover', 'dragleave', 'drop'].forEach(event => {
            dropZone.addEventListener(event, e => {
                e.preventDefault();
                e.stopPropagation();
                
                if (event === 'dragover') {
                    dropZone.classList.add('active');
                } else if (event === 'dragleave') {
                    dropZone.classList.remove('active');
                } else if (event === 'drop') {
                    dropZone.classList.remove('active');
                    
                    // Process dropped items using our consolidated handler
                    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
                        this.handleDroppedItems(e.dataTransfer.items);
                    }
                }
            });
        });

        // Handle button clicks and keyboard shortcuts
        this.elements.toggleButton.onclick = () => this.toggleSidebar();
        document.onkeydown = e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.toggleSidebar();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (this.isEditorMode) {
                    this.saveFile();
                }
            }
        };

        // Setup initial events
        this.setupInitialEvents();
    }
    
    /**
     * Setup file change listener
     */
    setupFileChangeListener() {
        // Listen for file changes from the server fallback
        window.addEventListener('fileChanged', (event) => {
            const { fileIndex } = event.detail;
            
            // If the changed file is currently loaded, load it again
            if (fileIndex === this.fileManager.currentFileIndex) {
                // Only refresh if we're not in edit mode
                if (!this.isEditorMode) {
                    console.log('Reloading current file due to external change');
                    this.loadFile(fileIndex);
                } else {
                    // If in edit mode, show a notification
                    const fileInfo = this.fileManager.getFile(fileIndex);
                    this.showFileChangeNotification(fileInfo.name);
                }
            }
        });
        
        // Add file content monitoring for the current open file
        let isCheckingCurrentFile = false;
        
        // Setup file watcher using File System Access API
        this.fileWatchers = new Map();
        
        // Setup directory watchers to track added/deleted files
        this.directoryWatchers = new Map();
        
        // Poll for file changes using the File System Access API - ONLY for the current file
        setInterval(async () => {
            // Only check if we have files loaded
            if (!this.fileManager.files || this.fileManager.files.length === 0) return;
            
            // Get current file
            const currentFile = this.fileManager.getCurrentFile();
            if (!currentFile || !currentFile.file || !currentFile.file.handle) return;
            
            try {
                // Get latest file version from disk
                const fileHandle = currentFile.file.handle;
                const file = await fileHandle.getFile();
                
                // Read file content
                const newContent = await file.text();
                
                // Only update if content has changed
                if (newContent !== currentFile.content) {
                    console.log('File changed externally:', currentFile.path);
                    
                    // Check if we have unsaved changes in the editor
                    if (this.isEditorMode && this.elements.editor.value !== currentFile.content) {
                        // We have a conflict - file changed externally and in the editor
                        this.showConflictDialog(currentFile, newContent);
                    } else {
                        // Update the content in our file manager
                        currentFile.content = newContent;
                        this.originalContent = newContent;
                        
                        // Update the UI 
                        if (this.isEditorMode) {
                            // Update editor content
                            this.elements.editor.value = newContent;
                        } else {
                            // Update preview
                            this.displayFileContent(newContent);
                        }
                        
                        // Show notification
                        this.showFileChangeNotification(currentFile.name);
                    }
                }
            } catch (error) {
                console.error('Error checking file changes:', error);
            }
        }, 2000); // Check every 2 seconds
    }
    
    /**
     * Show conflict dialog when a file has been modified both in the editor and externally
     */
    showConflictDialog(fileInfo, externalContent) {
        // Create a modal dialog for the conflict
        const overlay = createElementWithAttributes('div', {
            className: 'conflict-overlay',
            style: {
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }
        });
        
        const dialog = createElementWithAttributes('div', {
            className: 'conflict-dialog',
            style: {
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                maxWidth: '500px',
                width: '90%'
            }
        });
        
        const header = createElementWithAttributes('h3', {
            textContent: 'File Conflict Detected',
            style: {
                marginTop: 0,
                color: '#e53e3e'
            }
        });
        
        const message = createElementWithAttributes('p', {
            innerHTML: `The file <strong>${fileInfo.name}</strong> has been modified both in the editor and externally. How would you like to proceed?`,
            style: {
                marginBottom: '20px'
            }
        });
        
        const buttonContainer = createElementWithAttributes('div', {
            style: {
                display: 'flex',
                justifyContent: 'space-between'
            }
        });
        
        const keepMineButton = createElementWithAttributes('button', {
            textContent: 'Keep My Changes',
            style: {
                padding: '8px 16px',
                backgroundColor: '#3182ce',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
            },
            onclick: () => {
                // Keep the changes in the editor
                // Just close the dialog and do nothing
                document.body.removeChild(overlay);
            }
        });
        
        const useExternalButton = createElementWithAttributes('button', {
            textContent: 'Use External Changes',
            style: {
                padding: '8px 16px',
                backgroundColor: '#718096',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
            },
            onclick: () => {
                // Use the external changes
                fileInfo.content = externalContent;
                this.originalContent = externalContent;
                this.elements.editor.value = externalContent;
                document.body.removeChild(overlay);
            }
        });
        
        const mergeButton = createElementWithAttributes('button', {
            textContent: 'Merge Changes',
            style: {
                padding: '8px 16px',
                backgroundColor: '#38a169',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
            },
            onclick: () => {
                // This is a simplified merge that just shows both versions
                // A proper merge would use a diff algorithm
                const currentContent = this.elements.editor.value;
                this.elements.editor.value = 
                    `/* YOUR CHANGES */\n\n${currentContent}\n\n` +
                    `/* EXTERNAL CHANGES */\n\n${externalContent}`;
                document.body.removeChild(overlay);
            }
        });
        
        buttonContainer.appendChild(keepMineButton);
        buttonContainer.appendChild(useExternalButton);
        buttonContainer.appendChild(mergeButton);
        
        dialog.appendChild(header);
        dialog.appendChild(message);
        dialog.appendChild(buttonContainer);
        overlay.appendChild(dialog);
        
        document.body.appendChild(overlay);
    }
    
    /**
     * Show a notification when a file is changed externally
     */
    showFileChangeNotification(fileName) {
        const notification = createElementWithAttributes('div', {
            className: 'file-change-notification',
            innerHTML: `<p>${fileName} was modified outside the editor</p>`,
            style: {
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                backgroundColor: '#d1ecf1',
                color: '#0c5460',
                padding: '10px 15px',
                borderRadius: '4px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                zIndex: 9999,
                maxWidth: '300px',
                transition: 'all 0.3s ease'
            }
        });
        
        document.body.appendChild(notification);
        
        // Remove notification after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    /**
     * Setup file input for opening files
     */
    setupFileInput() {
        // Remove any existing directory input to avoid duplicates
        const existingDirInput = document.getElementById('dir-input');
        if (existingDirInput) {
            existingDirInput.parentNode.removeChild(existingDirInput);
        }

        // Create directory input for folders - used as fallback
        const directoryInput = document.createElement('input');
        directoryInput.type = 'file';
        directoryInput.id = 'dir-input'; // Keep ID for potential removal

        // Add directory selection attributes
        directoryInput.setAttribute('webkitdirectory', '');
        directoryInput.setAttribute('directory', '');
        // Note: mozdirectory, msdirectory, odirectory are largely obsolete but harmless

        // Allow selection of multiple files within the directory structure
        directoryInput.multiple = true;

        // Accept attribute is often ignored for directory pickers, but doesn't hurt
        directoryInput.accept = '.md,.markdown,.mdown,text/markdown';

        directoryInput.style.display = 'none';
        directoryInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files.length > 0) {
                // Filter for markdown files (important for legacy input)
                const mdFiles = Array.from(e.target.files).filter(file =>
                    /\.(md|markdown|mdown)$/i.test(file.name) || file.type === 'text/markdown'
                );

                if (mdFiles.length > 0) {
                     // IMPORTANT: Add webkitRelativePath to file objects if missing
                     // This ensures the fileManager can build the structure correctly
                     const filesWithPaths = Array.from(e.target.files).map(file => {
                        if (!file.relativePath && file.webkitRelativePath) {
                            // Create a new File object or modify existing if possible
                            // to standardize path property. For simplicity, let's assume
                            // fileManager handles webkitRelativePath directly for now.
                            // A more robust solution might involve creating FileInfo objects here.
                            console.log(`File ${file.name} has webkitRelativePath: ${file.webkitRelativePath}`)
                        }
                        return file;
                    });
                    this.handleFiles(filesWithPaths.filter(file => // Re-filter after potential modification
                        /\.(md|markdown|mdown)$/i.test(file.name) || file.type === 'text/markdown'
                    ));
                } else {
                    this.showError('No markdown files found in the selected folder(s)');
                }
            }
            // Reset the input for subsequent uses
            e.target.value = '';
        });

        document.body.appendChild(directoryInput);
        this.elements.directoryInput = directoryInput; // Store reference

        // Update the dropzone UI text and click handler
        this.updateDropzoneUI();
    }
    
    /**
     * Update dropzone UI
     */
    updateDropzoneUI() {
        const dropZone = this.elements.dropZone;
        if (!dropZone) return;

        // Clear existing content
        dropZone.innerHTML = '';

        // Always ensure pointer events are enabled
        dropZone.style.pointerEvents = 'auto';

        // Create icon
        const uploadIcon = createElementWithAttributes('div', {
            className: 'dropzone-icon',
            innerHTML: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>'
        });

        // Update instruction text for clarity
        const dropText = createElementWithAttributes('p', {
            className: 'dropzone-text',
            innerHTML: 'Click to select a folder<br>containing markdown files'
        });

        // Add elements to dropzone
        dropZone.appendChild(uploadIcon);
        dropZone.appendChild(dropText);
    }
    
    /**
     * Handle files from drop or file input
     */
    async handleFiles(files) {
        console.log('Handling files:', files.length);
        
        // Update the UI to show loading state
        this.elements.dropZone.innerHTML = '<p>Processing files...</p>';
        
        // Process the files with the file manager
        const processed = await this.fileManager.handleFileUpload(files);
        
        if (processed) {
            console.log('Files processed successfully, loading first file');
            
            // Restore the dropzone UI instead of hiding it
            this.updateDropzoneUI();
            
            // Show the button container
            this.elements.buttonContainer.style.display = 'flex';
            
            // Load the first file
            this.loadFile(this.fileManager.currentFileIndex);
        } else {
            // Update dropzone to show error
            this.showError('Failed to process files');
        }
    }
    
    /**
     * Show a warning notification
     * @param {string} message 
     */
    showWarning(message) {
        console.warn(message);
        
        // Create a warning notification element
        const notification = document.createElement('div');
        notification.className = 'notification warning';
        notification.innerHTML = `
            <div class="notification-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 22h20L12 2z"/>
                    <path d="M12 9v6"/>
                    <path d="M12 18h.01"/>
                </svg>
                <span>${message}</span>
                <button class="close-btn">×</button>
            </div>
        `;
        
        // Add to UI
        document.body.appendChild(notification);
        
        // Add close button functionality
        const closeBtn = notification.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            notification.classList.add('closing');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.add('closing');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 10000);
    }

    /**
     * Show an error notification
     * @param {string} message 
     */
    showError(message) {
        console.error(message);
        
        // Create an error notification element
        const notification = document.createElement('div');
        notification.className = 'notification error';
        notification.innerHTML = `
            <div class="notification-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <span>${message}</span>
                <button class="close-btn">×</button>
            </div>
        `;
        
        // Add to UI
        document.body.appendChild(notification);
        
        // Add close button functionality
        const closeBtn = notification.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            notification.classList.add('closing');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto-dismiss after 8 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.add('closing');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 8000);
    }

    loadFile(index) {
        const fileInfo = this.fileManager.getFile(index);
        if (!fileInfo) {
            console.error('Failed to load file: Invalid index or file not found', index);
            return;
        }

        console.log('Loading file:', fileInfo.path, fileInfo);

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
            console.log('File has cached content, displaying directly');
            this.displayFileContent(fileInfo.content);
            return;
        }
        
        // If we don't have content but have a file object, read it
        if (fileInfo.file) {
            console.log('Reading file content from file object');
            const reader = new FileReader();
            reader.onload = e => {
                const content = e.target.result;
                this.originalContent = content;
                
                // Store content in fileInfo for future use
                fileInfo.content = content;
                
                this.displayFileContent(content);
            };
            reader.onerror = e => {
                this.showError(`Error reading file: ${e.target.error}`);
                console.error('FileReader error:', e.target.error);
            };
            reader.readAsText(fileInfo.file);
        } else {
            this.showError('File content not available');
            console.error('No file content or file object available', fileInfo);
        }
    }
    
    displayFileContent(content) {
        if (!content) {
            console.error('Cannot display empty content');
            return;
        }
        
        console.log('Displaying content length:', content.length);
        this.originalContent = content;
        
        if (this.isEditorMode) {
            // In editor mode, set the textarea value
            this.elements.editor.value = content;
        } else {
            // In view mode, render markdown to HTML
            const renderedHTML = this.renderer.render(content);
            
            // Make sure contentWrapper exists
            if (!this.elements.contentWrapper) {
                console.error('Content wrapper element not found');
                return;
            }
            
            // Set the HTML content
            this.elements.contentWrapper.innerHTML = renderedHTML;
            
            // Apply syntax highlighting
            this.renderer.highlightAll();
            
            // Setup link handlers
            this.setupLinkHandlers();
            
            // Make sure the content is visible
            this.elements.contentWrapper.style.display = 'block';
        }
        
        // Ensure buttons are visible after content is loaded
        this.updateButtonPositions();
    }

    updateButtonPositions() {
        // Get references to our elements
        const buttonsContainer = this.elements.buttonContainer;
        const editButton = this.elements.editButton;
        const saveButton = this.elements.saveButton;
        
        // Safety check - if elements don't exist, don't do anything
        if (!buttonsContainer || !editButton || !saveButton) {
            console.error('Missing button elements');
            return;
        }
        
        // Set base visibility based on whether a file is selected
        const hasSelectedFile = this.fileManager.currentFileIndex !== undefined && this.fileManager.currentFileIndex >= 0;
        
        // Only show buttons if a file is selected
        if (hasSelectedFile) {
            // Show container
            buttonsContainer.style.display = 'flex';
            
            // Update button appearance based on mode
            if (this.isEditorMode) {
                // In edit mode
                editButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>';
                editButton.title = 'Exit Edit Mode';
                // The save button visibility is now controlled by CSS with the edit-mode class
            } else {
                // In view mode
                editButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>';
                editButton.title = 'Edit File';
                // The save button visibility is now controlled by CSS with the edit-mode class
            }
        } else {
            // No file selected, hide the buttons container
            buttonsContainer.style.display = 'none';
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
        const content = this.elements.contentWrapper;
        content.querySelectorAll('a').forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                if (!href) return;

                const currentFile = this.fileManager.getCurrentFile();
                const currentDir = currentFile ? currentFile.folder : '';
                const resolvedPath = this.fileManager.resolvePath(href, currentDir);
                const fileIndex = this.fileManager.findFileByPath(resolvedPath);

                if (fileIndex !== undefined) {
                    this.loadFile(fileIndex);
                } else {
                    console.error('File not found:', resolvedPath);
                }
            };
        });
    }

    toggleEditor() {
        this.isEditorMode = !this.isEditorMode;
        
        // Ensure we have valid references to our UI elements
        if (!this.elements.buttonContainer || !this.elements.saveButton || !this.elements.editButton) {
            console.error('Missing UI elements for editor mode');
            return;
        }
        
        if (this.isEditorMode) {
            // Add edit-mode class to body for styling
            document.body.classList.add('edit-mode');
            
            // Switch to editor mode
            this.elements.editor.style.display = 'block';
            this.elements.contentWrapper.style.display = 'none'; // Hide only the content wrapper
            
            // Load current content into editor
            this.elements.editor.value = this.originalContent;
        } else {
            // Remove edit-mode class from body
            document.body.classList.remove('edit-mode');
            
            // Switch to preview mode
            this.elements.editor.style.display = 'none';
            this.elements.contentWrapper.style.display = 'block'; // Show only the content wrapper
            
            // Render the editor content for preview (without saving)
            this.elements.contentWrapper.innerHTML = this.renderer.render(this.elements.editor.value);
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
            
            // Save the file using the file manager
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
            }
        } catch (error) {
            // Reset save button state
            this.elements.saveButton.classList.remove('saving');
            this.elements.saveButton.classList.remove('saved');
            this.elements.saveButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>';
            
            // Error is already handled by the file manager
            console.error('Error in saveFile:', error);
        }
    }

    toggleSidebar() {
        this.elements.sidebar.classList.toggle('hidden');
        this.elements.main.classList.toggle('expanded');
        
        // Add/remove sidebar-hidden class to body for button positioning
        document.body.classList.toggle('sidebar-hidden', this.elements.sidebar.classList.contains('hidden'));
        
        // Re-position the buttons after sidebar toggle
        setTimeout(() => this.updateButtonPositions(), 300); // Wait for transition to complete
    }

    /**
     * Handle drag and drop of files and directories
     */
    async handleDroppedItems(items) {
        try {
            // Update UI to show processing state
            this.elements.dropZone.innerHTML = '<p>Processing dropped files...</p>';
            
            // Extract directory handles from the dropped items
            for (const item of items) {
                if (item.kind === 'file') {
                    // If we get a handle for a directory, process it
                    try {
                        const handle = await item.getAsFileSystemHandle();
                        if (handle && handle.kind === 'directory') {
                            await this.processDirectory(handle);
                            return; // We found a directory, process it and stop
                        }
                    } catch (error) {
                        console.warn('Could not get file system handle:', error);
                        // Continue to try other items
                    }
                }
            }
            
            // If we reach here, no directory was found
            this.showWarning('Please drop a folder containing markdown files.');
            this.updateDropzoneUI();
        } catch (error) {
            console.error('Error processing dropped items:', error);
            this.showError('Error processing dropped items: ' + error.message);
            this.updateDropzoneUI();
        }
    }

    // Single consolidated method to process a directory
    async processDirectory(dirHandle) {
        if (!dirHandle) return;
        
        try {
            const files = [];
            const processedCount = { value: 0 };
            const markdownExtensions = ['.md', '.markdown', '.mdown', '.txt'];
            
            // Store parent directory handle for watching
            const dirPath = dirHandle.name;
            this.fileManager.addDirectoryHandle(dirPath, dirHandle);
            
            // Add a log to debug directory selection
            console.log(`Processing directory: ${dirPath}`, dirHandle);
            
            // Update progress function
            const updateProgress = (count) => {
                this.elements.dropZone.innerHTML = `<p>Processing files... (${count} found)</p>`;
            };
            
            // Process the directory recursively
            await this.processDirectoryRecursively(dirHandle, dirPath, files, processedCount, updateProgress, markdownExtensions);
            
            // Process all collected files
            if (files.length > 0) {
                console.log(`Processing ${files.length} markdown files`);
                await this.fileManager.processFiles(files);
                
                // Load the first file - this is key to show file content
                if (this.fileManager.currentFileIndex >= 0) {
                    this.loadFile(this.fileManager.currentFileIndex);
                    
                    // Make sure the file list selection is updated
                    this.updateFileListSelection(this.fileManager.currentFileIndex);
                    
                    // Expand parent folders in the file tree
                    const currentFile = this.fileManager.getCurrentFile();
                    if (currentFile && currentFile.folder) {
                        this.expandParentFolders(currentFile.folder);
                    }
                }
                
                // Set up monitoring for file system changes
                this.setupFileSystemMonitoring();
                
                // Show success message
                this.showSuccess(`Loaded ${files.length} markdown files from "${dirHandle.name}"`);
            } else {
                this.showWarning(`No markdown files found in "${dirHandle.name}"`);
            }
            
            // Restore the dropzone UI
            this.updateDropzoneUI();
        } catch (error) {
            console.error('Error processing directory:', error);
            this.showError('Error processing directory: ' + error.message);
            this.updateDropzoneUI();
        }
    }

    // Helper method to recursively process a directory
    async processDirectoryRecursively(handle, parentPath, files, processedCount, updateProgress, markdownExtensions, depth = 0) {
        // Don't process too deeply nested directories
        if (depth > 10) return;
        
        console.log(`Processing directory: ${parentPath || handle.name} (depth ${depth})`);
        
        try {
            // Process all entries in the directory
            for await (const entry of handle.values()) {
                // Build the entry path
                const entryPath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
                
                if (entry.kind === 'file') {
                    // Check if it's a markdown file
                    const extension = '.' + entry.name.split('.').pop().toLowerCase();
                    if (markdownExtensions.includes(extension)) {
                        try {
                            // Get the file and its metadata
                            const file = await entry.getFile();
                            file.handle = entry;  // Store handle for direct saving
                            file.relativePath = entryPath;
                            
                            // Add parent folder reference for better structure
                            file.parentFolder = parentPath;
                            console.log(`Added file: ${entry.name} with parent: ${parentPath}`);
                            
                            // Add to our collection
                            files.push(file);
                            
                            // Update progress
                            processedCount.value++;
                            if (processedCount.value % 5 === 0) {
                                updateProgress(processedCount.value);
                            }
                        } catch (fileError) {
                            console.warn(`Could not access file ${entryPath}:`, fileError);
                        }
                    }
                } else if (entry.kind === 'directory') {
                    try {
                        // Register the directory for watching including parent path
                        console.log(`Registering directory: ${entryPath}`);
                        this.fileManager.addDirectoryHandle(entryPath, entry);
                        
                        // Recursively process subdirectory
                        await this.processDirectoryRecursively(
                            entry, entryPath, files, processedCount, 
                            updateProgress, markdownExtensions, depth + 1
                        );
                    } catch (dirError) {
                        console.warn(`Could not access directory ${entryPath}:`, dirError);
                    }
                }
            }
        } catch (error) {
            console.error(`Error reading directory contents:`, error);
        }
    }

    /**
     * Set up monitoring for file system changes
     */
    async setupFileSystemMonitoring() {
        if (!this.fileManager || !this.fileManager.directoryHandles || this.fileManager.directoryHandles.size === 0) {
            console.log('No directory handles to monitor');
            return;
        }

        // Stop any existing monitoring
        this.stopFileSystemMonitoring();

        // Create a flag to track if monitoring is active
        this._monitoringActive = true;
        
        console.log(`Setting up file system monitoring for ${this.fileManager.directoryHandles.size} directories`);
        
        // Store the watcher IDs to allow stopping later
        this._fileSystemWatchers = [];
        
        // For each directory handle, set up monitoring
        for (const [path, handle] of this.fileManager.directoryHandles.entries()) {
            try {
                // Make sure handle has proper methods
                if (handle && typeof handle.values === 'function') {
                    this.monitorDirectory(path, handle);
                }
            } catch (error) {
                console.error(`Error setting up monitoring for ${path}:`, error);
            }
        }
    }

    /**
     * Monitor a specific directory for changes
     */
    async monitorDirectory(path, handle) {
        if (!this._monitoringActive) return;
        
        console.log(`Monitoring directory: ${path}`);
        
        try {
            // Use FileSystemDirectoryHandle.values() to get directory entries
            const currentEntries = new Map();
            
            // Read current entries
            for await (const entry of handle.values()) {
                currentEntries.set(entry.name, {
                    kind: entry.kind,
                    name: entry.name
                });
            }
            
            // Store snapshot of entries for comparison
            const previousSnapshot = this._directorySnapshots?.get(path) || new Map();
            this._directorySnapshots = this._directorySnapshots || new Map();
            this._directorySnapshots.set(path, currentEntries);
            
            // Compare with previous snapshot if it exists
            if (previousSnapshot.size > 0) {
                let hasChanges = false;
                
                // Check for new or modified entries
                for (const [name, entry] of currentEntries.entries()) {
                    if (!previousSnapshot.has(name)) {
                        console.log(`New entry detected: ${name} (${entry.kind})`);
                        hasChanges = true;
                    }
                }
                
                // Check for deleted entries
                for (const [name, entry] of previousSnapshot.entries()) {
                    if (!currentEntries.has(name)) {
                        console.log(`Entry deleted: ${name} (${entry.kind})`);
                        hasChanges = true;
                    }
                }
                
                // If changes detected, refresh the file structure
                if (hasChanges) {
                    console.log(`Changes detected in ${path}, refreshing file structure`);
                    this.refreshFilesFromWatchedDirectories();
                }
            }
            
            // Schedule next check
            if (this._monitoringActive) {
                const watcherId = setTimeout(() => this.monitorDirectory(path, handle), 2000);
                this._fileSystemWatchers.push(watcherId);
            }
        } catch (error) {
            console.error(`Error monitoring directory ${path}:`, error);
            
            // Try again after a delay
            if (this._monitoringActive) {
                const watcherId = setTimeout(() => this.monitorDirectory(path, handle), 5000);
                this._fileSystemWatchers.push(watcherId);
            }
        }
    }

    /**
     * Stop file system monitoring
     */
    stopFileSystemMonitoring() {
        this._monitoringActive = false;
        
        // Clear any existing watchers
        if (this._fileSystemWatchers) {
            this._fileSystemWatchers.forEach(id => clearTimeout(id));
            this._fileSystemWatchers = [];
        }
        
        console.log('File system monitoring stopped');
    }

    /**
     * Refresh files from watched directories when changes are detected
     */
    async refreshFilesFromWatchedDirectories() {
        console.log('Refreshing files from watched directories');
        
        try {
            // First, remember which file was active
            const currentFilePath = this.fileManager.getCurrentFile()?.path;
            
            // Get all directory handles
            const handles = this.fileManager.getDirectoryHandles();
            if (handles.size === 0) {
                console.log('No directory handles to refresh');
                return;
            }
            
            // Process the root directory handle (first one added)
            const rootDirEntry = handles.entries().next().value;
            if (!rootDirEntry) {
                console.log('No root directory handle found');
                return;
            }
            
            const [rootPath, rootHandle] = rootDirEntry;
            
            // Re-process the directory
            await this.processDirectory(rootHandle);
            
            // If we had a current file, try to restore it
            if (currentFilePath) {
                const fileIndex = this.fileManager.findFileByPath(currentFilePath);
                if (fileIndex !== undefined) {
                    this.loadFile(fileIndex);
                }
            }
            
            // Show a notification about the refresh
            this.showSuccess('File list refreshed due to file system changes');
        } catch (error) {
            console.error('Error refreshing file list:', error);
        }
    }

    /**
     * Setup initial events
     * This gets called when the app is first initialized 
     * and should not clear existing files or state
     */
    setupInitialEvents() {
        // Only set up if not already done to prevent duplicate handlers
        if (this._initialEventsSetup) return;
        this._initialEventsSetup = true;
        
        console.log('Setting up initial events including dropzone click handler');
        
        // Setup file drop zone with a single, clear approach
        // First remove any existing click handlers just to be safe
        const dropZone = this.elements.dropZone;
        const newDropZone = dropZone.cloneNode(true);
        dropZone.parentNode.replaceChild(newDropZone, dropZone);
        this.elements.dropZone = newDropZone;
        
        // Now add the click handler
        this.elements.dropZone.addEventListener('click', (e) => {
            console.log('Dropzone clicked, opening directory picker');
            e.preventDefault();
            e.stopPropagation();
            this.openDirectoryPicker();
        });
        
        // Force the drop zone to be clickable
        this.elements.dropZone.style.pointerEvents = 'auto';
        this.elements.dropZone.style.cursor = 'pointer';
        
        // Setup drag and drop handler with the same consolidated approach
        const dropArea = document.body;
        
        // Prevent default behavior to enable drop
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            }, false);
        });
        
        // Highlight drop area when dragging over it
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.add('highlight');
            }, false);
        });
        
        // Remove highlight when leaving or after drop
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.remove('highlight');
            }, false);
        });
        
        // Handle actual drop - always use directory API if available
        dropArea.addEventListener('drop', (e) => {
            if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
                this.handleDroppedItems(e.dataTransfer.items);
            }
        }, false);
    }

    /**
     * Single, consolidated method to open the directory picker
     */
    async openDirectoryPicker() {
        // Global static flag to prevent multiple pickers across the entire application
        if (window._directoryPickerActive === true) {
            console.log('Directory picker already active (global flag), ignoring request');
            return;
        }
        
        // Instance flag check
        if (this.isPickerActive) {
            console.log('Directory picker already active (instance flag), ignoring request');
            return;
        }
        
        // Check browser support
        if (!window.showDirectoryPicker) {
            this.showError('Your browser doesn\'t support the File System API. Please use a modern browser like Chrome or Edge.');
            this.elements.dropZone.style.pointerEvents = 'auto'; // Ensure dropzone is clickable
            return;
        }
        
        try {
            // Set both flags to prevent multiple pickers
            this.isPickerActive = true;
            window._directoryPickerActive = true;
            
            // Ensure UI reflects the active picker state
            this.elements.dropZone.innerHTML = '<p>Select a directory with markdown files...</p>';
            this.elements.dropZone.style.pointerEvents = 'none'; // Disable clicking
            
            // Allow time for the UI to update before showing picker
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Use the directory picker - this is the ONLY method we'll use
            const dirHandle = await window.showDirectoryPicker().catch(error => {
                // Immediately reset flags on picker error
                this.isPickerActive = false;
                window._directoryPickerActive = false;
                this.elements.dropZone.style.pointerEvents = 'auto';
                throw error; // Re-throw for the outer catch
            });
            
            // Reset flags after picker completes
            this.isPickerActive = false;
            window._directoryPickerActive = false;
            this.elements.dropZone.style.pointerEvents = 'auto';
            
            if (!dirHandle) {
                this.updateDropzoneUI();
                return;
            }
            
            // Update UI to show processing state
            this.elements.dropZone.innerHTML = '<p>Processing files...</p>';
            
            // Process the directory
            await this.processDirectory(dirHandle);
        } catch (error) {
            // Extra safeguard: Reset flags in all error cases
            this.isPickerActive = false;
            window._directoryPickerActive = false;
            this.elements.dropZone.style.pointerEvents = 'auto';
            
            // Don't show errors for user canceling
            if (error.name !== 'AbortError') {
                console.error('Error opening directory:', error);
                this.showError('Error selecting directory: ' + error.message);
            }
            
            // Always restore the UI
            this.updateDropzoneUI();
        } finally {
            // Triple safety measure: ensure flags are reset even if there's an error in processDirectory
            setTimeout(() => {
                this.isPickerActive = false;
                window._directoryPickerActive = false;
                this.elements.dropZone.style.pointerEvents = 'auto';
                
                // One more failsafe - after a delay, check if we need to repair the UI
                setTimeout(() => {
                    if (!this.elements.dropZone.innerHTML || 
                        this.elements.dropZone.style.pointerEvents === 'none') {
                        console.log('Repairing dropzone UI after delay...');
                        this.updateDropzoneUI();
                    }
                }, 1000);
            }, 500);
        }
    }

    /**
     * Handle drag and drop of files and directories
     */
    async handleDragAndDrop(items) {
        // Redirect to our consolidated method
        if (items && items.length > 0) {
            await this.handleDroppedItems(items);
        }
    }

    /**
     * Initialize the application after DOM is loaded
     */
    init() {
        // Prevent double initialization
        if (this._initialized) {
            console.warn('App already initialized, skipping initialization');
            return;
        }
        this._initialized = true;
        
        // Only get elements and set up components if not already done
        if (!this.elements.content) {
            this.getElements();
        }
        
        // These should only be done once
        if (!this._componentsSetup) {
            this._componentsSetup = true;
            this.setupComponents();
            this.setupButtonContainer();
            this.setupEditorElement();
        }
        
        // Set up event listeners
        this.setupEventListeners();
        this.setupFileChangeListener();
        this.setupLinkHandlers();
        this.setupInitialEvents();
        
        // Show welcome message
        console.log('FileToMarkdown Viewer initialized');
    }

    /**
     * Show a success notification
     * @param {string} message 
     */
    showSuccess(message) {
        console.log(message);
        
        // Create a success notification element
        const notification = document.createElement('div');
        notification.className = 'notification success';
        notification.innerHTML = `
            <div class="notification-content">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span>${message}</span>
                <button class="close-btn">×</button>
            </div>
        `;
        
        // Add to UI
        document.body.appendChild(notification);
        
        // Add close button functionality
        const closeBtn = notification.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            notification.classList.add('closing');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.add('closing');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
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