// FileToMarkdown Viewer Bundle - 2025-03-26T16:28:30.524Z

// File: utils/constants.js
/**
 * Application constants
 */

// CSS Classes
const CSS_CLASSES = {
    COLLAPSED: 'collapsed',
    FOLDER_CONTENT: 'folder-content',
    ACTIVE: 'active',
    SELECTED: 'selected',
    ERROR: 'error'
};

// UI Icons
const ICONS = {
    FILE: '📄',
    FOLDER_OPEN: '📂',
    FOLDER_CLOSED: '📁',
    MARKDOWN: '📝'
};

// DOM Attributes
const DOM_ATTRIBUTES = {
    DATA_FOLDER: 'data-folder',
    DATA_PATH: 'data-path',
    DATA_INDEX: 'data-index'
};

// File extensions and their MIME types
const FILE_EXTENSIONS = {
    'md': 'text/markdown',
    'markdown': 'text/markdown',
    'txt': 'text/plain',
    'html': 'text/html',
    'htm': 'text/html',
    'css': 'text/css',
    'js': 'text/javascript',
    'json': 'application/json',
    'xml': 'application/xml',
    'yaml': 'text/yaml',
    'yml': 'text/yaml',
    'csv': 'text/csv'
};

// Language mappings for syntax highlighting
const LANGUAGE_MAPPINGS = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'php': 'php',
    'html': 'markup',
    'vue': 'markup',
    'svelte': 'markup',
    'shell': 'bash',
    'sh': 'bash',
    'bat': 'batch',
    'cs': 'csharp',
    'csharp': 'csharp',
    'java': 'java',
    'go': 'go',
    'rust': 'rust',
    'rs': 'rust',
    'c': 'c',
    'cpp': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'md': 'markdown',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'sql': 'sql',
    'graphql': 'graphql',
    'xml': 'xml'
};

// API Endpoints
const API_ENDPOINTS = {
    FILE: '/api/file'
};

// Event types
const EVENTS = {
    FILE_CHANGE: 'fileChanged',
    FILE_LIST_CHANGE: 'fileListChanged',
    FILE_SELECT: 'fileSelect'
}; 

// File: utils/domUtils.js


class DOMUtils {
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
        if (content) element.innerHTML = content;
        return element;
    }

    static toggleClass(element, className) { element.classList.toggle(className); }
    static addClass(element, className) { element.classList.add(className); }
    static removeClass(element, className) { element.classList.remove(className); }
    static hasClass(element, className) { return element.classList.contains(className); }
    static getFolderId(path) { return `folder-${path}`.replace(/[^a-z0-9]/gi, '-'); }
    static getIndentation(level) { return '&nbsp;'.repeat(level * 2); }
    static isElementCollapsed(element) { return element.classList.contains(CSS_CLASSES.COLLAPSED); }

    static setCollapsed(element, isCollapsed) {
        if (isCollapsed) element.classList.add(CSS_CLASSES.COLLAPSED);
        else element.classList.remove(CSS_CLASSES.COLLAPSED);
    }

    static clearElement(element) {
        element.innerHTML = '';
    }

    static replaceChildren(element, newChild) {
        element.replaceChildren(newChild);
    }

    static appendChild(element, child) {
        element.appendChild(child);
    }

    static removeElement(element) {
        element.parentNode?.removeChild(element);
    }

    static setDisplay(element, display) {
        element.style.display = display;
    }

    static setVisibility(element, visible) {
        element.style.display = visible ? 'block' : 'none';
    }
}

/**
 * DOM utility functions for creating and manipulating elements
 */

/**
 * Create an element with attributes and styles
 * @param {string} tag - The HTML tag name
 * @param {Object} options - Element configuration options
 * @param {string} [options.id] - Element ID
 * @param {string} [options.className] - Element class name
 * @param {Object} [options.style] - Style object with camelCased properties
 * @param {string} [options.innerHTML] - Inner HTML content
 * @param {Object} [options.dataset] - Dataset attributes
 * @param {Function} [options.onclick] - Click event handler
 * @param {Function} [options.onchange] - Change event handler
 * @param {Object} [options.attributes] - Additional attributes to set
 * @returns {HTMLElement} The created element
 */
function createElementWithAttributes(tag, options = {}) {
    const element = document.createElement(tag);
    
    // Apply ID if specified
    if (options.id) element.id = options.id;
    
    // Apply classes if specified
    if (options.className) element.className = options.className;
    
    // Apply styles if specified
    if (options.style && typeof options.style === 'object') {
        Object.entries(options.style).forEach(([prop, value]) => {
            element.style[prop] = value;
        });
    }
    
    // Set innerHTML if specified
    if (options.innerHTML !== undefined) element.innerHTML = options.innerHTML;
    
    // Set text content if specified
    if (options.textContent !== undefined) element.textContent = options.textContent;
    
    // Add data attributes if specified
    if (options.dataset && typeof options.dataset === 'object') {
        Object.entries(options.dataset).forEach(([key, value]) => {
            element.dataset[key] = value;
        });
    }
    
    // Add event handlers
    if (options.onclick) element.onclick = options.onclick;
    if (options.onchange) element.onchange = options.onchange;
    
    // Add additional attributes
    if (options.attributes && typeof options.attributes === 'object') {
        Object.entries(options.attributes).forEach(([attr, value]) => {
            element.setAttribute(attr, value);
        });
    }
    
    return element;
}

/**
 * Sanitize text to prevent XSS attacks
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
function sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Find all elements matching a selector and apply a callback function
 * @param {string} selector - CSS selector
 * @param {Function} callback - Function to apply to each element
 */
function applyToElements(selector, callback) {
    document.querySelectorAll(selector).forEach(callback);
}

/**
 * Create a document fragment from HTML string
 * @param {string} html - HTML string
 * @returns {DocumentFragment} Document fragment
 */
function createFragmentFromHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content;
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
        DOMUtils.clearElement(this.container);
    }
}

// export BaseComponent; 

// File: utils/fileManager.js
class FileManager {
    constructor() {
        this.files = [];
        this.fileMap = new Map();
        this.folderStructure = new Map();
        this.currentFileIndex = -1;
        this.supportsFileSystem = 'showOpenFilePicker' in window;
        this.fileTypes = [{ 
            description: 'Markdown Files', 
            accept: { 'text/markdown': ['.md'], 'text/plain': ['.txt'] } 
        }];
        // Add a map to store directory handles for file system monitoring
        this.directoryHandles = new Map();
    }

    // Clear all loaded files and folder structure
    clearFiles() {
        this.files = [];
        this.fileMap.clear();
        this.folderStructure.clear();
        this.currentFileIndex = -1;
    }

    // Process files from File System Access API
    async processFilesFromFileSystemAPI() {
        if (!this.supportsFileSystem) return false;
        
        try {
            const handles = await window.showOpenFilePicker({
                multiple: true,
                types: this.fileTypes
            });
            
            if (!handles || handles.length === 0) return false;
            
            const files = await Promise.all(handles.map(async handle => {
                const file = await handle.getFile();
                // Store the file handle for later saving
                file.handle = handle;
                return file;
            }));
            
            // Process the files through the normal flow
            const processed = await this.processFiles(files);
            return processed > 0;
        } catch (error) {
            console.error('Error opening files with File System API:', error);
            return false;
        }
    }

    // Process files from a file list
    async processFiles(fileList) {
        console.log('Processing', fileList.length, 'files');
        let baseIndex = this.files.length;
        const newFiles = [];
        
        // Process each file
        for (const file of fileList) {
            const fileInfo = {
                name: file.name,
                path: file.name,
                size: file.size,
                type: file.type || this.getFileTypeFromName(file.name),
                lastModified: file.lastModified,
                file: file,
                content: null,
                isRoot: true,
                depth: 0,
                // If file has a handle (from FileSystem API), store it
                handle: file.handle || null
            };
            
            if (file.webkitRelativePath) {
                // For directory uploads
                fileInfo.path = file.webkitRelativePath;
                fileInfo.isRoot = false;
                
                // Extract folder path from the relative path
                const parts = file.webkitRelativePath.split('/');
                if (parts.length > 1) {
                    parts.pop(); // Remove the filename
                    fileInfo.folder = parts.join('/');
                    fileInfo.depth = parts.length;
                }
            } else if (file.relativePath) {
                // For files with a specified relative path (used in our system)
                fileInfo.path = file.relativePath;
                fileInfo.isRoot = !file.relativePath.includes('/');
                
                // Extract folder path
                const lastSlash = file.relativePath.lastIndexOf('/');
                if (lastSlash !== -1) {
                    fileInfo.folder = file.relativePath.substring(0, lastSlash);
                    fileInfo.depth = fileInfo.folder.split('/').length;
                }
            }
            
            // Add to files array
            newFiles.push(fileInfo);
        }
        
        // Add all files at once
        this.files = this.files.concat(newFiles);
        
        // Reconstruct folder structure
        this.reconstructFolderStructure();
        
        // Update the file map
        this.updateFileMap();
        
        // If this is the first file(s) being loaded, set the first one as current
        if (this.currentFileIndex === -1 && this.files.length > 0) {
            this.currentFileIndex = 0;
        }
        
        // Load initial content for all files
        await Promise.all(newFiles.map(async (fileInfo, i) => {
            try {
                // Read the file content
                const content = await this.readFileContent(fileInfo.file);
                this.files[baseIndex + i].content = content;
            } catch (error) {
                console.error('Error reading file content:', error);
            }
        }));
        
        // Notify listeners about the file list change
        this.notifyFileListChanged();
        
        return newFiles.length;
    }

    // Handle uploaded files from a standard file input or drop
    async handleFileUpload(fileList) {
        // Exit early if no files
        if (!fileList || fileList.length === 0) {
            console.log('No files provided to handleFileUpload');
            return false;
        }
        
        try {
            // Process files
            const processed = await this.processFiles(fileList);
            
            if (processed) {
                console.log(`Processed ${this.files.length} files`);
                return true;
            } else {
                console.log('No files were processed successfully');
                return false;
            }
        } catch (error) {
            console.error('Error handling file upload:', error);
            return false;
        }
    }

    // Helper to read file content
    async readFileContent(file) {
        if (!file) return null;
        
        // If it's a string already, return it
        if (typeof file === 'string') return file;
        
        // Helper function to read file as text
        const readAsText = (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsText(file);
            });
        };
        
        try {
            // If it's a File object
            if (file instanceof File) {
                return await readAsText(file);
            }
            
            // If it's a file-like object with a text() method (Response)
            if (file.text && typeof file.text === 'function') {
                return await file.text();
            }
            
            // If it has content directly
            if (file.content) {
                return file.content;
            }
            
            console.error('Unable to read content from file:', file);
            return null;
        } catch (error) {
            console.error('Error reading file content:', error);
            return null;
        }
    }

    // Save content to a file using File System Access API if available, falls back to server API
    async saveFile(fileInfo, content) {
        if (!fileInfo) return { success: false, message: 'No file info provided' };
        
        try {
            // If we have a handle from File System API, use it
            if (this.supportsFileSystem && fileInfo.handle) {
                try {
                    const writable = await fileInfo.handle.createWritable();
                    await writable.write(content);
                    await writable.close();
                    
                    // Update the content in our data structure
                    fileInfo.content = content;
                    
                    return { success: true };
                } catch (error) {
                    console.error('Error saving with File System API:', error);
                    // Fall back to server API
                }
            }
            
            // Fall back to server API if File System API failed or isn't supported
            const response = await fetch('/api/file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path: fileInfo.path, content })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Update the content in our data structure
                fileInfo.content = content;
                return { success: true };
            } else {
                return { success: false, message: result.error || 'Unknown error' };
            }
        } catch (error) {
            return { success: false, message: error.message || 'Error saving file' };
        }
    }

    // Notify listeners that the file list has changed
    notifyFileListChanged() {
        // Dispatch a custom event
        window.dispatchEvent(new CustomEvent('fileListChanged'));
    }

    /**
     * Save the current file with new content
     */
    async saveCurrentFile(content) {
        const fileInfo = this.getCurrentFile();
        if (!fileInfo) return false;
        
        // Store the content in the file info
        fileInfo.content = content;
        
        try {
            // Method 1: Use the File System Access API if available
            if (fileInfo.file && fileInfo.file.handle) {
                const handle = fileInfo.file.handle;
                
                // Always check for permission first to avoid errors
                const options = { mode: 'readwrite' };
                if ((await handle.queryPermission(options)) !== 'granted') {
                    const permission = await handle.requestPermission(options);
                    if (permission !== 'granted') {
                        console.error('Permission to write to file was denied');
                        return false;
                    }
                }
                
                // Get a writable stream
                const writable = await handle.createWritable();
                
                // Write the content
                await writable.write(content);
                
                // Close the file
                await writable.close();
                
                console.log('File saved successfully using File System Access API');
                return true;
            }
            
            // Method 2: Use the server API as a fallback
            if (fileInfo.path) {
                // Use the server API to save the file
                const response = await fetch('/api/file', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        path: fileInfo.path,
                        content
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`Server returned ${response.status} ${response.statusText}`);
                }
                
                console.log('File saved successfully using server API');
                return true;
            }
        } catch (error) {
            console.error('Error saving file:', error);
            throw error;
        }
        
        return false;
    }

    // Get file type from name
    getFileTypeFromName(name) {
        const ext = name.split('.').pop().toLowerCase();
        return FILE_EXTENSIONS[ext] || 'text/plain';
    }

    // Get folder info
    getFolderInfo(path) {
        return this.folderStructure.get(path);
    }

    // Get files in folder
    getFilesInFolder(folderPath) {
        const folder = this.folderStructure.get(folderPath);
        return folder ? Array.from(folder.files).map(path => this.fileMap.get(path.toLowerCase())) : [];
    }

    // Get subfolders
    getSubfolders(folderPath) {
        const folder = this.folderStructure.get(folderPath);
        return folder ? Array.from(folder.children).map(path => this.folderStructure.get(path)) : [];
    }

    // Update file map
    updateFileMap() {
        this.fileMap.clear();
        this.files.forEach((fileInfo, index) => {
            this.fileMap.set(fileInfo.path.toLowerCase(), index);
        });
    }

    // Get file by index
    getFile(index) {
        return this.files[index];
    }

    // Get current file
    getCurrentFile() {
        return this.files[this.currentFileIndex];
    }

    // Set current file
    setCurrentFile(index) {
        this.currentFileIndex = index;
    }

    // Find file by path
    findFileByPath(path) {
        // First try direct match
        let fileIndex = this.fileMap.get(path.toLowerCase());
        
        // If not found and it doesn't have a root directory, try with various folders
        if (fileIndex === undefined && !path.includes('/')) {
            // Just try to find a file with this name anywhere
            for (let i = 0; i < this.files.length; i++) {
                const file = this.files[i];
                if (file.name.toLowerCase() === path.toLowerCase()) {
                    return i;
                }
            }
        }
        
        return fileIndex;
    }

    // Resolve a relative path to an absolute path
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
                for (let i = 0; i < this.files.length; i++) {
                    const file = this.files[i];
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

    // Register the FileList component for state tracking
    registerFileListComponent(fileListComponent) {
        this.fileListComponent = fileListComponent;
    }

    // Reconstruct folder structure from file paths
    reconstructFolderStructure() {
        this.folderStructure.clear();
        
        // First pass: create folders
        for (const fileInfo of this.files) {
            if (!fileInfo.folder) continue;
            
            const pathParts = fileInfo.folder.split('/');
            let currentPath = '';
            
            pathParts.forEach((part, index) => {
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
                
                if (parentPath && this.folderStructure.has(parentPath)) {
                    this.folderStructure.get(parentPath).children.add(currentPath);
                }
            });
        }
        
        // Second pass: add files to folders
        for (const fileInfo of this.files) {
            if (fileInfo.folder && this.folderStructure.has(fileInfo.folder)) {
                this.folderStructure.get(fileInfo.folder).files.add(fileInfo.path);
            }
        }
    }

    // Process files from a directory picker
    async processDirectoryFromFileSystemAPI() {
        if (!this.supportsFileSystem) return false;
        
        try {
            const dirHandle = await window.showDirectoryPicker();
            if (!dirHandle) return false;
            
            // Store the directory handle for later watching
            const dirPath = dirHandle.name;
            this.directoryHandles.set(dirPath, dirHandle);
            
            // Get all markdown files from the directory
            const files = await this.getFilesFromDirectoryHandle(dirHandle, dirPath);
            
            // Process the files
            if (files.length > 0) {
                const processed = await this.processFiles(files);
                return processed > 0;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error opening directory with File System API:', error);
            return false;
        }
    }

    // Get all directory handles
    getDirectoryHandles() {
        return this.directoryHandles;
    }

    // Add a directory handle
    addDirectoryHandle(path, handle) {
        this.directoryHandles.set(path, handle);
    }

    // Remove a directory handle
    removeDirectoryHandle(path) {
        this.directoryHandles.delete(path);
    }
}

// export FileManager; 

// File: components/FileList.js


class FileList extends BaseComponent {
    constructor(container, fileManager) {
        super(container);
        this.fileManager = fileManager;
        
        // Register this component with the file manager
        this.fileManager.registerFileListComponent(this);
        
        // Set initial state
        this.state = {
            selectedIndex: this.fileManager.currentFileIndex || -1,
            expandedFolders: new Set()
        };
        
        // Ensure file list is rerendered when files are added
        window.addEventListener('fileListChanged', () => {
            console.log('FileList component received fileListChanged event');
            
            // Update selected index to match file manager's current file
            this.setState({ 
                selectedIndex: this.fileManager.currentFileIndex || -1,
                // Keep expanded folders state
                expandedFolders: this.state.expandedFolders
            });
            
            // Force render
            this.render();
        });
        
        // Also render whenever session is restored
        if (this.fileManager.files.length > 0) {
            console.log('Files already present in FileList construction, rendering...');
            setTimeout(() => this.render(), 0);
        }
    }

    // Update the setState method
    setState(newState) {
        super.setState(newState);
    }

    // Called when the component is mounted to the DOM
    mount() {
        this.render();
        
        // Add a delayed re-render to ensure file tree is shown after page refresh
        setTimeout(() => {
            if (this.fileManager.files.length > 0) {
                console.log('Delayed re-render of file list after mount');
                this.render();
            }
        }, 200);
    }

    createFileItem(fileInfo, index) {
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
            class: `file-item ${index === this.state.selectedIndex ? 'selected' : ''}`,
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

        this.fileManager.getSubfolders(folderPath)
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(subfolder => container.appendChild(this.createFolderItem(subfolder)));

        this.fileManager.getFilesInFolder(folderPath)
            .forEach(fileIndex => {
                const fileInfo = this.fileManager.getFile(fileIndex);
                container.appendChild(this.createFileItem(fileInfo, fileIndex));
            });
    }

    render() {
        console.log('FileList: Rendering with state:', this.state);
        
        const rootList = this.createElement('ul', {class: 'file-tree'});
        
        // Create "Add Directory" button at the top
        const addDirItem = this.createElement('li', {class: 'add-directory-item'});
        const addDirButton = this.createElement('button', {
            class: 'add-directory-button',
            title: 'Add directory to watch'
        }, '+ Add Directory');
        
        addDirButton.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                // Attempt to add a directory using the File System API
                const result = await this.fileManager.processDirectoryFromFileSystemAPI();
                if (!result) {
                    console.warn('No directory was selected or it contained no markdown files');
                }
            } catch (error) {
                console.error('Error adding directory:', error);
            }
        });
        
        addDirItem.appendChild(addDirButton);
        rootList.appendChild(addDirItem);
        
        // Get files and folders to display
        const rootFolders = Array.from(this.fileManager.folderStructure.values())
            .filter(f => f.isRoot)
            .sort((a, b) => a.name.localeCompare(b.name));

        const rootFiles = this.fileManager.files
            .filter(f => f.isRoot)
            .sort((a, b) => a.name.localeCompare(b.name));
        
        // If we have files or folders to show, display them
        if (rootFolders.length > 0 || rootFiles.length > 0) {
            // Create a "Current Project" header
            const projectHeader = this.createElement('li', {class: 'project-header'});
            projectHeader.appendChild(this.createElement('span', {}, 'Current Project'));
            rootList.appendChild(projectHeader);
            
            // Add folders and files
            rootFolders.forEach(folder => {
                rootList.appendChild(this.createFolderItem(folder));
            });

            rootFiles.forEach((fileInfo, index) => {
                const fileIndex = this.fileManager.fileMap.get(fileInfo.path.toLowerCase());
                rootList.appendChild(this.createFileItem(fileInfo, fileIndex));
            });
        } else {
            // If there are no files, show a message
            const emptyMessage = this.createElement('li', {class: 'empty-message'});
            emptyMessage.appendChild(this.createElement('span', {}, 'No files opened'));
            rootList.appendChild(emptyMessage);
        }

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
        marked.setOptions({
            highlight: (code, lang) => {
                try {
                    const language = LANGUAGE_MAPPINGS[lang] || lang;
                    return Prism.languages[language] 
                        ? Prism.highlight(code, Prism.languages[language], language)
                        : code;
                } catch { return code; }
            },
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
        
        this.isEditorMode = false;
        this.originalContent = '';
        
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
                    
                    // Check if dragged items include directories
                    // Note: Most browsers don't support directory drop directly
                    // So we'll just process all dropped files and filter for markdown
                    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
                        this.handleDragAndDrop(e.dataTransfer.items);
                    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                        this.handleFiles(Array.from(e.dataTransfer.files));
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
    }
    
    /**
     * Setup file change listener
     */
    setupFileChangeListener() {
        // Listen for file changes from the server fallback
        window.addEventListener('fileChanged', (event) => {
            const { fileIndex } = event.detail;
            if (fileIndex === this.fileManager.currentFileIndex && !this.isEditorMode) {
                this.loadFile(fileIndex);
            }
        });

        // Setup file watcher using File System Access API
        this.fileWatchers = new Map();
        
        // Setup directory watchers to track added/deleted files
        this.directoryWatchers = new Map();
        
        // Poll for file changes using the File System Access API
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
        
        // Check for directory changes (added/deleted files)
        setInterval(async () => {
            // Only continue if we have directory handles to watch
            if (!this.fileManager.directoryHandles || this.fileManager.directoryHandles.size === 0) return;
            
            try {
                for (const [dirPath, dirHandle] of this.fileManager.directoryHandles) {
                    // Create a map of current files to compare against
                    const currentFiles = new Map();
                    const markdownFiles = [];
                    
                    // Get all markdown files in the directory
                    for await (const entry of dirHandle.values()) {
                        if (entry.kind === 'file' && /\.(md|markdown|mdown)$/i.test(entry.name)) {
                            const entryPath = `${dirPath}/${entry.name}`;
                            currentFiles.set(entryPath.toLowerCase(), true);
                            markdownFiles.push({ name: entry.name, path: entryPath, entry, dirHandle });
                        } else if (entry.kind === 'directory') {
                            // In the future, we could add recursive directory watching here
                        }
                    }
                    
                    // Check for removed files
                    const removedFiles = [];
                    for (const file of this.fileManager.files) {
                        if (file.path.startsWith(dirPath) && !currentFiles.has(file.path.toLowerCase())) {
                            removedFiles.push(file.path);
                        }
                    }
                    
                    // Check for new files
                    const newFiles = [];
                    for (const { name, path, entry, dirHandle } of markdownFiles) {
                        if (!this.fileManager.fileMap.has(path.toLowerCase())) {
                            try {
                                const fileHandle = await dirHandle.getFileHandle(name);
                                const file = await fileHandle.getFile();
                                
                                // Add custom properties to the File object
                                file.relativePath = path;
                                file.handle = fileHandle;
                                
                                // Pre-load the file content
                                file.content = await file.text();
                                
                                newFiles.push(file);
                            } catch (error) {
                                console.error(`Error processing new file ${path}:`, error);
                            }
                        }
                    }
                    
                    // Process changes
                    let hasChanges = false;
                    
                    // Handle removed files
                    if (removedFiles.length > 0) {
                        console.log(`Detected ${removedFiles.length} removed files`, removedFiles);
                        
                        // Remove files from the file manager
                        for (const filePath of removedFiles) {
                            const fileIndex = this.fileManager.findFileByPath(filePath);
                            if (fileIndex !== -1) {
                                // Adjust current file index if deleted file is active
                                if (fileIndex === this.fileManager.currentFileIndex) {
                                    this.fileManager.setCurrentFile(Math.max(0, fileIndex - 1));
                                }
                                
                                // Remove the file from files array
                                this.fileManager.files.splice(fileIndex, 1);
                                hasChanges = true;
                            }
                        }
                    }
                    
                    // Handle new files
                    if (newFiles.length > 0) {
                        console.log(`Detected ${newFiles.length} new files`);
                        await this.fileManager.processFiles(newFiles);
                        hasChanges = true;
                    }
                    
                    // Update file manager state if changes were detected
                    if (hasChanges) {
                        // Update file map
                        this.fileManager.updateFileMap();
                        
                        // Rebuild folder structure
                        this.fileManager.reconstructFolderStructure();
                        
                        // Notify about file list changes
                        this.fileManager.notifyFileListChanged();
                    }
                }
            } catch (error) {
                console.error('Error checking directory changes:', error);
            }
        }, 5000); // Check directory changes every 5 seconds
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

        // Create icon
        const uploadIcon = createElementWithAttributes('div', {
            className: 'dropzone-icon',
            innerHTML: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>' // Upload icon still okay
        });

        // Update instruction text for clarity
        const dropText = createElementWithAttributes('p', {
            className: 'dropzone-text',
            innerHTML: 'Click to select a folder<br>containing markdown files' // Updated text
        });

        // Add elements to dropzone
        dropZone.appendChild(uploadIcon);
        dropZone.appendChild(dropText);

        // Ensure the click handler is set
        dropZone.onclick = this.handleDropzoneClick.bind(this);
    }
    
    /**
     * Handle click on the dropzone
     * This either triggers the file picker or directory picker based on user preference
     */
    async handleDropzoneClick(e) {
        e.preventDefault();
        
        // Don't do anything if a click happens on a button inside the dropzone
        if (e.target.tagName === 'BUTTON') {
            return;
        }
        
        try {
            let processed = false;
            
            // First, try to use the File System Access API which supports both files and directories
            if (this.fileManager.supportsFileSystem) {
                // Ask user if they want to select files or a directory
                const selectType = confirm('Do you want to select a directory? Click OK for directory or Cancel for files.');
                
                if (selectType) {
                    // User wants to select a directory
                    processed = await this.fileManager.processDirectoryFromFileSystemAPI();
                } else {
                    // User wants to select files
                    processed = await this.fileManager.processFilesFromFileSystemAPI();
                }
            }
            
            // Fall back to standard file input if File System API is not supported or failed
            if (!processed) {
                this.elements.directoryInput.click();
            }
            
            // Update the dropzone UI immediately (will be updated again when files are processed)
            this.updateDropzoneUI();
            
        } catch (error) {
            console.error('Error handling dropzone click:', error);
            this.showError(error.message || 'Error selecting files');
        }
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
     * Show error message in dropzone
     */
    showError(message) {
        this.elements.dropZone.innerHTML = `<p class="error">${message}</p>`;
        
        // Reset the dropzone after a delay
        setTimeout(() => this.updateDropzoneUI(), 3000);
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
            this.elements.contentWrapper.innerHTML = this.renderer.render(content);
            this.renderer.highlightAll();
            this.setupLinkHandlers();
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
        
        // Add/remove sidebar-hidden class to body for button positioning
        document.body.classList.toggle('sidebar-hidden', this.elements.sidebar.classList.contains('hidden'));
        
        // Re-position the buttons after sidebar toggle
        setTimeout(() => this.updateButtonPositions(), 300); // Wait for transition to complete
    }

    /**
     * Get all markdown files from a directory handle recursively
     */
    async getFilesFromDirectoryHandle(directoryHandle, path = '') {
        const files = [];

        try {
            // Store the directory handle for change monitoring
            if (path) {
                this.fileManager.addDirectoryHandle(path, directoryHandle);
            }

            for await (const entry of directoryHandle.values()) {
                const entryPath = path ? `${path}/${entry.name}` : entry.name;

                if (entry.kind === 'file') {
                     // Check if it's potentially a markdown file BEFORE getting the handle/file
                     if (/\.(md|markdown|mdown)$/i.test(entry.name)) {
                        try {
                            const fileHandle = await directoryHandle.getFileHandle(entry.name);
                            const file = await fileHandle.getFile();

                            // IMPORTANT: Add custom properties directly to the File object
                            // These are used by FileManager and for saving
                            file.relativePath = entryPath; // Use a consistent property name
                            file.handle = fileHandle; // Store the handle for saving and file watching!
                            
                            // Pre-load the file content for change detection
                            file.content = await file.text();

                            files.push(file);
                        } catch (error) {
                            console.error(`Error processing file ${entryPath}:`, error);
                            // Optionally notify the user about specific file errors
                        }
                    }
                } else if (entry.kind === 'directory') {
                    try {
                        // Get subdirectory handle
                        const subDirHandle = await directoryHandle.getDirectoryHandle(entry.name);
                        
                        // Store the subdirectory handle for change monitoring
                        this.fileManager.addDirectoryHandle(entryPath, subDirHandle);
                        
                        // Process the subdirectory recursively
                        const subDirFiles = await this.getFilesFromDirectoryHandle(subDirHandle, entryPath);
                        files.push(...subDirFiles);
                    } catch (error) {
                        console.error(`Error processing subdirectory ${entryPath}:`, error);
                    }
                }
            }
            
            return files;
        } catch (error) {
            console.error(`Error reading directory ${path}:`, error);
            return files;
        }
    }

    /**
     * Handle drag and drop of files and directories
     */
    async handleDragAndDrop(items) {
        try {
            const files = [];
            const promises = [];
            const directoryHandles = [];
            
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                
                // Handle file system entry
                if (item.kind === 'file' && item.webkitGetAsEntry) {
                    const entry = item.webkitGetAsEntry();
                    
                    if (entry) {
                        // Handle directory
                        if (entry.isDirectory) {
                            const dirPromise = this.readDirectoryEntry(entry);
                            promises.push(dirPromise);
                        }
                        // Handle file
                        else if (entry.isFile) {
                            const filePromise = new Promise(resolve => {
                                entry.file(file => {
                                    // Only include if it's potentially a markdown file
                                    if (/\.(md|markdown|mdown)$/i.test(file.name)) {
                                        // Add path info to the file object for relative path handling
                                        file.relativePath = file.name;
                                        files.push(file);
                                    }
                                    resolve();
                                }, resolve); // Resolve even if file access fails
                            });
                            
                            promises.push(filePromise);
                        }
                    }
                }
                // Handle file
                else if (item.kind === 'file' && item.getAsFile) {
                    const file = item.getAsFile();
                    
                    if (file && /\.(md|markdown|mdown)$/i.test(file.name)) {
                        file.relativePath = file.name;
                        files.push(file);
                    }
                }
                // Handle if it's a directory using File System Access API
                else if (this.fileManager.supportsFileSystem && typeof item.getAsFileSystemHandle === 'function') {
                    try {
                        const handle = await item.getAsFileSystemHandle();
                        
                        if (handle.kind === 'directory') {
                            directoryHandles.push(handle);
                        } else if (handle.kind === 'file' && /\.(md|markdown|mdown)$/i.test(handle.name)) {
                            const file = await handle.getFile();
                            file.relativePath = handle.name;
                            file.handle = handle; // Store handle for saving
                            files.push(file);
                        }
                    } catch (error) {
                        console.error('Error getting file system handle:', error);
                    }
                }
            }
            
            // Wait for all directory reading operations to complete
            await Promise.all(promises);
            
            // Process all directory handles collected using File System Access API
            for (const dirHandle of directoryHandles) {
                const dirPath = dirHandle.name;
                
                // Store the directory handle for watching
                this.fileManager.addDirectoryHandle(dirPath, dirHandle);
                
                // Get all markdown files from this directory
                const dirFiles = await this.getFilesFromDirectoryHandle(dirHandle, dirPath);
                files.push(...dirFiles);
            }
            
            // Process all collected files
            if (files.length > 0) {
                console.log(`Processing ${files.length} files from drag and drop`);
                await this.fileManager.processFiles(files);
                
                // Update dropzone UI
                this.updateDropzoneUI();
            } else {
                console.log('No supported files found in the dropped items');
                // Optionally show a message to the user
            }
        } catch (error) {
            console.error('Error handling drag and drop:', error);
            this.showError(error.message || 'Error processing dropped files');
        }
    }
    
    /**
     * Read directory entry recursively to get all files
     */
    async readDirectoryEntry(directoryEntry, path = '') {
        const files = [];
        const dirReader = directoryEntry.createReader();
        
        // Read directory entries in batches
        const readEntries = () => {
            return new Promise((resolve, reject) => {
                dirReader.readEntries(entries => {
                    resolve(entries);
                }, error => {
                    reject(error);
                });
            });
        };
        
        let entries = [];
        let batch;
        
        // Directory readers return results in batches
        do {
            batch = await readEntries();
            entries = entries.concat(Array.from(batch));
        } while (batch.length > 0);
        
        // Process all entries
        for (const entry of entries) {
            const entryPath = path ? `${path}/${entry.name}` : entry.name;
            
            if (entry.isFile) {
                try {
                    const file = await new Promise(resolve => {
                        entry.file(file => resolve(file));
                    });
                    
                    // Only add markdown files
                    if (file.name.toLowerCase().endsWith('.md') || 
                        file.name.toLowerCase().endsWith('.markdown') ||
                        file.name.toLowerCase().endsWith('.mdown') ||
                        file.type === 'text/markdown') {
                        
                        // Add path info for file manager
                        file.path = entryPath;
                        files.push(file);
                    }
                } catch (error) {
                    console.error(`Error reading file ${entryPath}:`, error);
                }
            } else if (entry.isDirectory) {
                // Recursively read subdirectories
                const subFiles = await this.readDirectoryEntry(entry, entryPath);
                files.push(...subFiles);
            }
        }
        
        return files;
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

// export FileToMarkdownViewer; 


// Export all modules for global use
window.FileManager = FileManager;
window.FileList = FileList;
window.createElementWithAttributes = createElementWithAttributes;
window.sanitizeText = sanitizeText;
window.applyToElements = applyToElements;
window.createFragmentFromHTML = createFragmentFromHTML;
window.BrowserRenderer = BrowserRenderer;
window.FileToMarkdownViewer = FileToMarkdownViewer;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FileToMarkdownViewer();
});
