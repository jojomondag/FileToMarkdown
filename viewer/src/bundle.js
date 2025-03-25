// FileToMarkdown Viewer Bundle - 2025-03-25T06:36:35.113Z

// File: utils/constants.js
const FOLDER_STATES_KEY = 'folderStates';

const CSS_CLASSES = {
    COLLAPSED: 'collapsed',
    FOLDER_CONTENT: 'folder-content'
};

const ICONS = {
    FILE: '📄',
    FOLDER_OPEN: '📂',
    FOLDER_CLOSED: '📁'
};

const DOM_ATTRIBUTES = {
    DATA_FOLDER: 'data-folder'
};

const FILE_EXTENSIONS = {
    MARKDOWN: '.md'
};

const LANGUAGE_MAPPINGS = {
    'js': 'javascript',
    'py': 'python',
    'html': 'markup',
    'vue': 'markup',
    'svelte': 'markup',
    'shell': 'bash',
    'cs': 'csharp',
    'csharp': 'csharp',
    'java': 'java'
}; 
// File: utils/domUtils.js


class DOMUtils {
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        if (content) element.innerHTML = content;
        return element;
    }

    static toggleClass(element, className) {
        element.classList.toggle(className);
    }

    static getAttribute(element, attribute) {
        return element.getAttribute(attribute);
    }

    static dispatchCustomEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }

    static getFolderId(path) {
        return `folder-${path}`.replace(/[^a-z0-9]/gi, '-');
    }

    static getIndentation(level) {
        return '&nbsp;'.repeat(level * 2);
    }

    static isElementCollapsed(element) {
        return element.classList.contains(CSS_CLASSES.COLLAPSED);
    }

    static setCollapsed(element, isCollapsed) {
        if (isCollapsed) {
            element.classList.add(CSS_CLASSES.COLLAPSED);
        } else {
            element.classList.remove(CSS_CLASSES.COLLAPSED);
        }
    }
}

// export DOMUtils; 
// File: components/BaseComponent.js


class BaseComponent {
    constructor(container) {
        this.container = container;
        this.state = {};
        this.events = new Map();
    }

    setState(newState) {
        this.state = {...this.state, ...newState};
        this.render();
    }

    on(eventName, callback) {
        if (!this.events.has(eventName)) this.events.set(eventName, new Set());
        this.events.get(eventName).add(callback);
    }

    emit(eventName, data) {
        if (this.events.has(eventName)) 
            this.events.get(eventName).forEach(callback => callback(data));
    }

    createElement(tag, attributes = {}, content = '') {
        return DOMUtils.createElement(tag, attributes, content);
    }

    render() {
        throw new Error('render() method must be implemented');
    }

    mount() {
        this.render();
    }

    unmount() {
        this.events.clear();
        this.container.innerHTML = '';
    }
}

// export BaseComponent; 
// File: utils/fileSync.js
/**
 * Utility class for syncing files between the browser and the local file system
 */
class FileSync {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.watchedFiles = new Set();
        this.listeners = new Map();
        this.lastSaveTime = 0;
    }

    /**
     * Initialize the WebSocket connection
     */
    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const url = `${protocol}//${window.location.host}`;
        
        this.socket = new WebSocket(url);
        
        this.socket.onopen = () => {
            console.log('Connected to server');
            this.isConnected = true;
            
            // If there are files already being watched, re-register them
            if (this.watchedFiles.size > 0) {
                this.sendWatchMessage(Array.from(this.watchedFiles));
            }
        };
        
        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                
                if (data.type === 'fileChange') {
                    // Get the most recent time a save was performed
                    const timeSinceLastSave = Date.now() - this.lastSaveTime;
                    
                    // Only process external changes if they didn't happen immediately after a save
                    if (timeSinceLastSave > 1000) {
                        const callback = this.listeners.get(data.path);
                        if (callback) {
                            callback(data.content);
                        }
                    }
                }
            } catch (error) {
                console.error('Error processing server message:', error);
            }
        };
        
        this.socket.onclose = () => {
            console.log('Disconnected from server');
            this.isConnected = false;
            
            // Try to reconnect after a delay
            setTimeout(() => this.connect(), 3000);
        };
        
        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.socket.close();
        };
    }

    /**
     * Watch a file for changes
     * @param {string} filePath - The absolute path to the file
     * @param {Function} callback - Function to call when the file changes
     */
    watchFile(filePath, callback) {
        if (!filePath) return;
        
        this.watchedFiles.add(filePath);
        this.listeners.set(filePath, callback);
        
        if (this.isConnected) {
            this.sendWatchMessage([filePath]);
        }
    }

    /**
     * Stop watching a file
     * @param {string} filePath - The absolute path to the file
     */
    unwatchFile(filePath) {
        if (!filePath) return;
        
        this.watchedFiles.delete(filePath);
        this.listeners.delete(filePath);
    }

    /**
     * Send a message to watch file paths
     * @param {Array<string>} paths - Array of file paths to watch
     */
    sendWatchMessage(paths) {
        if (!this.isConnected || !paths.length) return;
        
        this.socket.send(JSON.stringify({
            type: 'watch',
            paths: paths
        }));
    }

    /**
     * Save content to a file
     * @param {string} filePath - The absolute path to the file
     * @param {string} content - The content to save
     * @returns {Promise<boolean>} - Whether the save was successful
     */
    async saveFile(filePath, content) {
        try {
            this.lastSaveTime = Date.now();
            
            const response = await fetch('/api/file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    path: filePath,
                    content
                })
            });
            
            const result = await response.json();
            return result.success === true;
        } catch (error) {
            console.error('Error saving file:', error);
            return false;
        }
    }

    /**
     * Load content from a file
     * @param {string} filePath - The absolute path to the file
     * @returns {Promise<string|null>} - The file content or null if failed
     */
    async loadFile(filePath) {
        try {
            const response = await fetch(`/api/file?path=${encodeURIComponent(filePath)}`);
            const result = await response.json();
            
            if (result.content !== undefined) {
                return result.content;
            }
            return null;
        } catch (error) {
            console.error('Error loading file:', error);
            return null;
        }
    }
}

// export FileSync; 
// File: utils/fileManager.js



class FileManager {
    constructor() {
        this.files = [];
        this.fileMap = new Map();
        this.folderStructure = new Map();
        this.currentFileIndex = -1;
        this.rootFolder = null;
        this.fileSync = new FileSync();
        this.fileSync.connect();
        this.syncedFiles = new Map(); // Map of file paths to their real paths
    }

    // Clear all loaded files and folder structure
    clearFiles() {
        this.files = [];
        this.fileMap.clear();
        this.folderStructure.clear();
        this.currentFileIndex = -1;
        this.rootFolder = null;
        this.syncedFiles.clear();
    }

    processFiles(fileList) {
        const markdownFiles = [];
        this.folderStructure.clear();
        
        for (const file of fileList) {
            if (file.webkitRelativePath) {
                this.rootFolder = file.webkitRelativePath.split('/')[0];
                break;
            }
        }
        
        for (const file of fileList) {
            if (file.name.toLowerCase().endsWith(FILE_EXTENSIONS.MARKDOWN)) {
                let relativePath = file.webkitRelativePath || file.name;
                const pathParts = relativePath.split('/');
                const fileInfo = {
                    file: file,
                    path: relativePath,
                    name: pathParts[pathParts.length - 1],
                    folder: pathParts.slice(0, -1).join('/'),
                    depth: pathParts.length - 1,
                    isRoot: pathParts.length === 1,
                    realPath: file.path || null // Store the real file path if available
                };
                
                // Store real path mapping if available
                if (fileInfo.realPath) {
                    this.syncedFiles.set(relativePath, fileInfo.realPath);
                }

                let currentPath = '';
                pathParts.slice(0, -1).forEach((part, index) => {
                    const parentPath = currentPath;
                    currentPath = currentPath ? `${currentPath}/${part}` : part;
                    
                    if (!this.folderStructure.has(currentPath)) {
                        this.folderStructure.set(currentPath, {
                            name: part,
                            path: currentPath,
                            parent: parentPath,
                            children: new Set(),
                            files: new Set(),
                            depth: index,
                            isRoot: index === 0
                        });
                    }
                    
                    if (parentPath) {
                        this.folderStructure.get(parentPath).children.add(currentPath);
                    }
                });

                if (fileInfo.folder) {
                    this.folderStructure.get(fileInfo.folder).files.add(relativePath);
                }

                markdownFiles.push(fileInfo);
            }
        }

        if (markdownFiles.length) {
            this.files = markdownFiles;
            this.updateFileMap();
            return true;
        }
        return false;
    }

    // New method to process files from the file system
    async processFileSystem(filePaths) {
        const markdownFiles = [];
        this.folderStructure.clear();
        this.syncedFiles.clear();
        
        for (const filePath of filePaths) {
            if (filePath.toLowerCase().endsWith(FILE_EXTENSIONS.MARKDOWN)) {
                try {
                    // Get the content through the server
                    const content = await this.fileSync.loadFile(filePath);
                    if (content === null) continue;
                    
                    // Create a synthetic file object
                    const fileName = filePath.split(/[\/\\]/).pop();
                    const file = new File([content], fileName, { type: 'text/markdown' });
                    
                    // Create the file info
                    const fileInfo = {
                        file: file,
                        path: fileName, // Use just the filename as the path internally
                        name: fileName,
                        folder: '',
                        depth: 0,
                        isRoot: true,
                        realPath: filePath // Store the real file path
                    };
                    
                    // Map the synthetic path to the real path
                    this.syncedFiles.set(fileName, filePath);
                    
                    markdownFiles.push(fileInfo);
                } catch (error) {
                    console.error(`Error processing file ${filePath}:`, error);
                }
            }
        }
        
        if (markdownFiles.length) {
            this.files = markdownFiles;
            this.updateFileMap();
            this.setupFileWatchers();
            return true;
        }
        return false;
    }
    
    // Set up watchers for synced files
    setupFileWatchers() {
        // Clear any existing watches
        this.syncedFiles.forEach((realPath) => {
            this.fileSync.unwatchFile(realPath);
        });
        
        // Set up new watches
        this.syncedFiles.forEach((realPath, relativePath) => {
            const fileIndex = this.fileMap.get(relativePath.toLowerCase());
            if (fileIndex !== undefined) {
                this.fileSync.watchFile(realPath, (content) => {
                    this.updateFileContent(fileIndex, content);
                });
            }
        });
    }
    
    // Update file content when it changes on disk
    updateFileContent(fileIndex, content) {
        const fileInfo = this.files[fileIndex];
        if (fileInfo) {
            // Create a new File object with the updated content
            const newFile = new File([content], fileInfo.name, { type: 'text/markdown' });
            fileInfo.file = newFile;
            
            // Notify listeners that the file has changed
            this.notifyFileChanged(fileIndex);
        }
    }
    
    // Custom event system for file changes
    notifyFileChanged(fileIndex) {
        // Dispatch a custom event
        window.dispatchEvent(new CustomEvent('fileChanged', {
            detail: { fileIndex }
        }));
    }
    
    // Save the current file back to disk
    async saveCurrentFile(content) {
        const fileInfo = this.getCurrentFile();
        if (!fileInfo) return false;
        
        // Get the real path
        const realPath = this.syncedFiles.get(fileInfo.path);
        if (!realPath) return false;
        
        // Save through the server
        const success = await this.fileSync.saveFile(realPath, content);
        if (success) {
            // Update our local file object
            const newFile = new File([content], fileInfo.name, { type: 'text/markdown' });
            fileInfo.file = newFile;
        }
        
        return success;
    }

    getFolderInfo(path) {
        return this.folderStructure.get(path);
    }

    getFileParentFolder(filePath) {
        const parts = filePath.split('/');
        return parts.length > 1 ? parts.slice(0, -1).join('/') : null;
    }

    getFilesInFolder(folderPath) {
        const folder = this.folderStructure.get(folderPath);
        return folder ? Array.from(folder.files).map(path => this.fileMap.get(path.toLowerCase())) : [];
    }

    getSubfolders(folderPath) {
        const folder = this.folderStructure.get(folderPath);
        return folder ? Array.from(folder.children).map(path => this.folderStructure.get(path)) : [];
    }

    updateFileMap() {
        this.fileMap.clear();
        this.files.forEach((fileInfo, index) => {
            this.fileMap.set(fileInfo.path.toLowerCase(), index);
        });
    }

    getFile(index) {
        return this.files[index];
    }

    getCurrentFile() {
        return this.files[this.currentFileIndex];
    }

    setCurrentFile(index) {
        this.currentFileIndex = index;
    }

    findFileByPath(path) {
        return this.fileMap.get(path.toLowerCase());
    }

    resolveRelativePath(href) {
        const currentFile = this.getCurrentFile();
        if (!currentFile) return href;
        
        const currentDir = currentFile.folder;
        if (href.startsWith('./')) {
            return currentDir ? `${currentDir}/${href.slice(2)}` : href.slice(2);
        } else if (href.startsWith('../')) {
            const parts = currentDir.split('/');
            return parts.length > 1
                ? `${parts.slice(0, -1).join('/')}/${href.slice(3)}`
                : href.slice(3);
        } else if (!href.startsWith('/')) {
            return currentDir ? `${currentDir}/${href}` : href;
        }
        return href.slice(1);
    }
    
    // Get the real file path for a file
    getRealPath(fileIndex) {
        const fileInfo = this.getFile(fileIndex);
        if (!fileInfo) return null;
        
        return this.syncedFiles.get(fileInfo.path) || null;
    }
}

// export FileManager; 
// File: components/FileList.js


class FileList extends BaseComponent {
    constructor(container, fileManager) {
        super(container);
        this.fileManager = fileManager;
        this.state = {
            selectedIndex: -1,
            expandedFolders: new Set()
        };
    }

    createFileItem(fileInfo, index) {
        const isSelected = index === this.state.selectedIndex;
        
        const link = this.createElement('a', {
            href: '#',
            title: fileInfo.path
        }, fileInfo.name);

        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.setState({ selectedIndex: index });
            this.emit('fileSelect', { index, fileInfo });
        });

        const li = this.createElement('li', {
            class: `file-item ${isSelected ? 'selected' : ''}`,
            'data-depth': fileInfo.depth
        });
        li.appendChild(link);
        return li;
    }

    createFolderItem(folderInfo) {
        const isExpanded = this.state.expandedFolders.has(folderInfo.path);
        
        const folderLink = this.createElement('a', {
            href: '#',
            'data-folder': folderInfo.path
        }, folderInfo.name);

        folderLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleFolder(folderInfo.path);
        });

        const li = this.createElement('li', {
            class: `folder-item ${isExpanded ? 'expanded' : ''}`,
            'data-depth': folderInfo.depth
        });
        li.appendChild(folderLink);

        const contentsContainer = this.createElement('ul', {
            class: `folder-contents ${isExpanded ? '' : 'collapsed'}`
        });
        li.appendChild(contentsContainer);

        if (isExpanded) this.renderFolderContents(folderInfo.path, contentsContainer);

        return li;
    }

    toggleFolder(folderPath) {
        const expandedFolders = new Set(this.state.expandedFolders);
        const isExpanding = !expandedFolders.has(folderPath);
        
        if (isExpanding) {
            expandedFolders.add(folderPath);
            let currentPath = this.fileManager.getFolderInfo(folderPath)?.parent;
            while (currentPath) {
                expandedFolders.add(currentPath);
                currentPath = this.fileManager.getFolderInfo(currentPath)?.parent;
            }
        } else {
            expandedFolders.delete(folderPath);
            Array.from(expandedFolders).forEach(path => {
                if (path.startsWith(folderPath + '/')) expandedFolders.delete(path);
            });
        }
        
        this.setState({ expandedFolders });
    }

    renderFolderContents(folderPath, container) {
        const folder = this.fileManager.getFolderInfo(folderPath);
        if (!folder) return;

        const subfolders = this.fileManager.getSubfolders(folderPath)
            .sort((a, b) => a.name.localeCompare(b.name));
        
        subfolders.forEach(subfolder => {
            container.appendChild(this.createFolderItem(subfolder));
        });

        const files = this.fileManager.getFilesInFolder(folderPath);
        files.forEach(fileIndex => {
            const fileInfo = this.fileManager.getFile(fileIndex);
            container.appendChild(this.createFileItem(fileInfo, fileIndex));
        });
    }

    render() {
        const rootList = this.createElement('ul', {class: 'file-tree'});

        const rootFolders = Array.from(this.fileManager.folderStructure.values())
            .filter(f => f.isRoot)
            .sort((a, b) => a.name.localeCompare(b.name));

        const rootFiles = this.fileManager.files
            .filter(f => f.isRoot)
            .sort((a, b) => a.name.localeCompare(b.name));

        rootFolders.forEach(folder => {
            rootList.appendChild(this.createFolderItem(folder));
        });

        rootFiles.forEach((fileInfo, index) => {
            rootList.appendChild(this.createFileItem(fileInfo, index));
        });

        this.container.replaceChildren(rootList);
    }
}

// export FileList; 
// File: utils/renderer.js


/**
 * Renderer for markdown content with syntax highlighting
 */
class BrowserRenderer {
    constructor() {
        this.configureMarked();
        if (typeof window !== 'undefined') window.Prism = Prism;
    }

    configureMarked() {
        const highlightCode = (code, lang) => {
            try {
                const language = LANGUAGE_MAPPINGS[lang] || lang;
                return Prism.languages[language] 
                    ? Prism.highlight(code, Prism.languages[language], language)
                    : code;
            } catch {
                return code;
            }
        };

        marked.setOptions({
            highlight: highlightCode,
            langPrefix: 'language-',
            gfm: true,
            breaks: true
        });
    }

    render(content) {
        return marked.parse(content);
    }

    highlightAll() {
        Prism?.highlightAll();
    }
}

// export BrowserRenderer; 
// File: app.js




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

// Export all modules for global use
window.FileManager = FileManager;
window.FileList = FileList;
window.DOMUtils = DOMUtils;
window.BrowserRenderer = BrowserRenderer;
window.FileSync = FileSync;
window.FileToMarkdownViewer = FileToMarkdownViewer;
