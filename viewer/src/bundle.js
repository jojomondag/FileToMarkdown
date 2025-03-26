// FileToMarkdown Viewer Bundle - 2025-03-26T06:18:42.793Z

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
 * Utility class for syncing files between the browser and the local file system using File System Access API
 */
class FileSync {
    constructor() {
        this.fileHandles = new Map(); // Store file handles
        this.fileWatchers = new Map(); // Store watchers by file path
        this.socketConnected = false;
        this.ws = null;
        this.supportsFileSystem = 'showOpenFilePicker' in window;
        
        if (!this.supportsFileSystem) {
            console.warn('FileSync: File System Access API not supported in this browser');
        } else {
            console.log('FileSync: File System Access API available');
        }
    }

    /**
     * Initialize the WebSocket connection for file watching
     */
    connect() {
        if (!this.socketConnected && location.protocol !== 'file:') {
            try {
                const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
                const wsUrl = `${protocol}//${location.host}`;
                
                this.ws = new WebSocket(wsUrl);
                
                this.ws.onopen = () => {
                    console.log('WebSocket connected for file watching');
                    this.socketConnected = true;
                    
                    // Send watch messages for any files already being watched
                    if (this.fileWatchers.size > 0) {
                        const paths = Array.from(this.fileWatchers.keys());
                        this.sendWatchMessage(paths);
                    }
                };
                
                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        
                        if (data.type === 'fileChange') {
                            this.handleFileChange(data.path, data.content);
                        }
                    } catch (error) {
                        console.error('Error handling WebSocket message:', error);
                    }
                };
                
                this.ws.onclose = () => {
                    console.log('WebSocket connection closed');
                    this.socketConnected = false;
                    
                    // Attempt to reconnect after a delay
                    setTimeout(() => this.connect(), 5000);
                };
            } catch (error) {
                console.error('Error connecting to WebSocket:', error);
            }
        }
    }

    /**
     * Watch a file for changes
     * @param {string} filePath - The path to the file
     * @param {function} callback - Function to call when file changes
     */
    watchFile(filePath, callback) {
        this.fileWatchers.set(filePath, callback);
        
        if (this.socketConnected) {
            this.sendWatchMessage([filePath]);
        }
    }

    /**
     * Stop watching a file
     * @param {string} filePath - The path to the file
     */
    unwatchFile(filePath) {
        this.fileWatchers.delete(filePath);
    }

    /**
     * Send a message to watch file paths
     * @param {string[]} paths - Array of file paths to watch
     */
    sendWatchMessage(paths) {
        if (this.socketConnected && this.ws) {
            this.ws.send(JSON.stringify({
                type: 'watch',
                paths: paths
            }));
        }
    }

    /**
     * Handle a file change notification
     * @param {string} filePath - The path to the file
     * @param {string} content - The new content
     */
    handleFileChange(filePath, content) {
        const callback = this.fileWatchers.get(filePath);
        if (callback) {
            callback(content);
        }
    }

    /**
     * Save content to a file using File System Access API
     * @param {string} filePath - The path to the file or null if using a file handle
     * @param {string} content - The content to save
     * @param {FileSystemFileHandle} [fileHandle] - Optional file handle to use
     * @returns {Promise<boolean>} - Whether the save was successful
     */
    async saveFile(filePath, content, fileHandle = null) {
        // If File System API is not supported, fall back to server method
        if (!this.supportsFileSystem) {
            return this.saveFileToServer(filePath, content);
        }
        
        try {
            // Use provided handle or get from cache
            const handle = fileHandle || this.fileHandles.get(filePath);
            
            if (!handle) {
                console.error('No file handle available for:', filePath);
                return false;
            }
            
            // Check if we have write permission
            if ((await handle.queryPermission({ mode: 'readwrite' })) !== 'granted') {
                // Request permission
                if ((await handle.requestPermission({ mode: 'readwrite' })) !== 'granted') {
                    console.error('Write permission denied for file:', filePath);
                    return false;
                }
            }
            
            // Create a writable stream
            const writable = await handle.createWritable();
            
            // Write the content
            await writable.write(content);
            
            // Close the stream
            await writable.close();
            
            console.log('File saved successfully:', filePath);
            return true;
        } catch (error) {
            console.error('Error saving file:', error);
            
            // Try server fallback
            return this.saveFileToServer(filePath, content);
        }
    }

    /**
     * Fallback method to save to server
     * @param {string} filePath - The path to the file
     * @param {string} content - The content to save
     * @returns {Promise<boolean>} - Whether the save was successful
     */
    async saveFileToServer(filePath, content) {
        try {
            const response = await fetch('/api/file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    path: filePath,
                    content: content
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('File saved via server:', filePath);
                return true;
            } else {
                console.error('Server error saving file:', result.error);
                return false;
            }
        } catch (error) {
            console.error('Error saving file to server:', error);
            return false;
        }
    }

    /**
     * Load content from a file using File System Access API
     * @param {string} filePath - The path to the file or null if using file handle
     * @param {FileSystemFileHandle} [fileHandle] - Optional file handle to use
     * @returns {Promise<string|null>} - The file content or null if failed
     */
    async loadFile(filePath, fileHandle = null) {
        // If File System API is not supported, fall back to server method
        if (!this.supportsFileSystem) {
            return this.loadFileFromServer(filePath);
        }
        
        try {
            // Use provided handle or get from cache
            const handle = fileHandle || this.fileHandles.get(filePath);
            
            if (!handle) {
                console.error('No file handle available for:', filePath);
                return null;
            }
            
            // Check if we have read permission
            if ((await handle.queryPermission({ mode: 'read' })) !== 'granted') {
                // Request permission
                if ((await handle.requestPermission({ mode: 'read' })) !== 'granted') {
                    console.error('Read permission denied for file:', filePath);
                    return null;
                }
            }
            
            // Get the file
            const file = await handle.getFile();
            
            // Read the text content
            const content = await file.text();
            
            console.log('File loaded successfully:', filePath);
            return content;
        } catch (error) {
            console.error('Error loading file:', error);
            
            // Try server fallback
            return this.loadFileFromServer(filePath);
        }
    }

    /**
     * Fallback method to load from server
     * @param {string} filePath - The path to the file
     * @returns {Promise<string|null>} - The file content or null if failed
     */
    async loadFileFromServer(filePath) {
        try {
            const response = await fetch(`/api/file?path=${encodeURIComponent(filePath)}`);
            const result = await response.json();
            
            if (result.content !== undefined) {
                console.log('File loaded via server:', filePath);
                return result.content;
            } else {
                console.error('Server error loading file:', result.error);
                return null;
            }
        } catch (error) {
            console.error('Error loading file from server:', error);
            return null;
        }
    }
    
    /**
     * Open files using the File System Access API
     * @param {object} options - Options for file picker
     * @returns {Promise<Array<object>>} - Array of objects with file handles and file info
     */
    async openFiles(options = {}) {
        if (!this.supportsFileSystem) {
            console.error('File System Access API not supported');
            return [];
        }
        
        try {
            // Configure options for the file picker
            const pickerOptions = {
                types: [
                    {
                        description: 'Markdown Files',
                        accept: {
                            'text/markdown': ['.md', '.markdown']
                        }
                    }
                ],
                excludeAcceptAllOption: false,
                multiple: true,
                ...options
            };
            
            // Show the file picker
            const fileHandles = await window.showOpenFilePicker(pickerOptions);
            
            // Process each file handle
            const files = await Promise.all(fileHandles.map(async (handle) => {
                try {
                    // Get the file from the handle
                    const file = await handle.getFile();
                    
                    // Get the path (this will be user-visible name only)
                    const filePath = file.name;
                    
                    // Store the handle for future use
                    this.fileHandles.set(filePath, handle);
                    
                    return {
                        file,
                        handle,
                        path: filePath,
                        name: file.name
                    };
                } catch (error) {
                    console.error('Error processing file handle:', error);
                    return null;
                }
            }));
            
            // Filter out any nulls
            return files.filter(f => f !== null);
        } catch (error) {
            // User canceled or other error
            console.log('File picker canceled or error:', error);
            return [];
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
                    realPath: file.path || null, // Store the real file path if available
                    handle: file.handle || null // Store the file handle if available
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

    // Process files from the File System Access API
    async processFilesFromFileSystemAPI() {
        try {
            // Use the FileSync class to open files with the File System Access API
            const files = await this.fileSync.openFiles();
            
            if (files.length === 0) {
                return false;
            }
            
            // Clear existing files
            this.clearFiles();
            
            // Process the files
            const markdownFiles = [];
            
            for (const fileInfo of files) {
                if (fileInfo.name.toLowerCase().endsWith(FILE_EXTENSIONS.MARKDOWN)) {
                    const fileData = {
                        file: fileInfo.file,
                        path: fileInfo.path,
                        name: fileInfo.name,
                        folder: '',  // Files opened directly are at root level
                        depth: 0,
                        isRoot: true,
                        handle: fileInfo.handle  // Store the file handle
                    };
                    
                    markdownFiles.push(fileData);
                }
            }
            
            if (markdownFiles.length) {
                this.files = markdownFiles;
                this.updateFileMap();
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error processing files from File System API:', error);
            return false;
        }
    }

    // Process files from the file system using server API (fallback)
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
        
        // If we have a file handle, use it
        if (fileInfo.handle) {
            return await this.fileSync.saveFile(fileInfo.path, content, fileInfo.handle);
        }
        
        // Otherwise try using the real path if available
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

    // Load content for the current file (refresh from disk)
    async refreshCurrentFile() {
        const fileInfo = this.getCurrentFile();
        if (!fileInfo) return false;
        
        let content;
        
        // If we have a file handle, use it
        if (fileInfo.handle) {
            content = await this.fileSync.loadFile(null, fileInfo.handle);
        } else {
            // Otherwise try using the real path if available
            const realPath = this.syncedFiles.get(fileInfo.path);
            if (!realPath) return false;
            
            content = await this.fileSync.loadFile(realPath);
        }
        
        if (content !== null) {
            // Update our local file object
            const newFile = new File([content], fileInfo.name, { type: 'text/markdown' });
            fileInfo.file = newFile;
            return true;
        }
        
        return false;
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
            if (parts.length === 0) return href.slice(3);
            
            const parentDir = parts.slice(0, -1).join('/');
            return parentDir ? `${parentDir}/${href.slice(3)}` : href.slice(3);
        }
        
        return currentDir ? `${currentDir}/${href}` : href;
    }
    
    getRealPath(fileIndex) {
        const fileInfo = this.getFile(fileIndex);
        if (!fileInfo) return null;
        
        return this.syncedFiles.get(fileInfo.path) || null;
    }
    
    getFileHandle(fileIndex) {
        const fileInfo = this.getFile(fileIndex);
        if (!fileInfo) return null;
        
        return fileInfo.handle || null;
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

    handleFiles(fileList) {
        if (fileList.length > 0 && this.fileManager.processFiles(fileList)) {
            this.loadFile(0);
        } else {
            this.showError('No valid markdown files found');
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
