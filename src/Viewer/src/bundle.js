// FileToMarkdown Viewer Bundle - 2025-04-03T20:50:36.986Z

// Ensure global objects exist
if (typeof window.FileToMarkdownViewer === 'undefined') {
    window.FileToMarkdownViewer = null;
}

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
    'mdown': 'text/markdown'
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
// import from ./constants

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

DOMUtils; 

// File: utils/eventEmitter.js
/**
 * Simple event emitter implementation
 * Used for component communication
 */
class EventEmitter {
    constructor() {
        this.events = {};
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     */
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        return this;
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} callback - Event handler to remove
     */
    off(event, callback) {
        if (!this.events[event]) return this;
        
        if (callback) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        } else {
            delete this.events[event];
        }
        return this;
    }

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {any} data - Event data
     */
    emit(event, data) {
        if (!this.events[event]) return;
        
        this.events[event].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        });
        return this;
    }

    /**
     * Subscribe to an event once
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     */
    once(event, callback) {
        const onceCallback = (data) => {
            callback(data);
            this.off(event, onceCallback);
        };
        return this.on(event, onceCallback);
    }
}

EventEmitter; 

// File: components/BaseComponent.js
// import from ../utils/domUtils

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

BaseComponent; 

// File: utils/renderer.js
// import from ./constants

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

BrowserRenderer; 

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
        // Track original file structure for refresh capability
        this.originalFiles = [];
        this.folderHasDeletedContent = new Set();
    }

    // Clear all loaded files and folder structure
    clearFiles() {
        // console.warn('CLEARING ALL FILES - called by:', new Error().stack); // Keep as warning? User can decide.
        this.files = [];
        this.fileMap.clear();
        this.folderStructure.clear();
        this.currentFileIndex = -1;
    }

    // Process files from a file list
    async processFiles(fileList) {
        // console.log('Processing', fileList.length, 'files');
        let baseIndex = this.files.length;
        const newFiles = [];
        
        // Log how many files have File System API handles
        const filesWithHandles = Array.from(fileList).filter(file => file.handle).length;
        // console.log(`Files with File System API handles: ${filesWithHandles}/${fileList.length}`);
        
        // Check permissions for files with handles upfront
        if (filesWithHandles > 0) {
            // console.log('Verifying permissions for files with handles...');
            const permissionPromises = [];
            
            for (const file of fileList) {
                if (file.handle) {
                    // Queue up permission checks (we won't wait for them all, just initiate)
                    const permissionPromise = (async () => {
                        try {
                            const options = { mode: 'readwrite' };
                            if ((await file.handle.queryPermission(options)) !== 'granted') {
                                // console.log(`Requesting write permission for ${file.name}...`);
                                await file.handle.requestPermission(options);
                            }
                        } catch (error) {
                            console.warn(`Could not verify permissions for ${file.name}:`, error);
                        }
                    })();
                    permissionPromises.push(permissionPromise);
                }
            }
            
            // Start permission checks but don't wait for all to complete
            // This primes the browser to show permission dialogs early
            Promise.all(permissionPromises).catch(err => 
                console.warn('Some permission checks failed:', err)
            );
        }
        
        // Create a mapping of existing files by path to avoid duplicates
        const existingFiles = new Map();
        this.files.forEach(file => {
            existingFiles.set(file.path.toLowerCase(), file);
        });
        
        // Process each file
        for (const file of fileList) {
            // Use relativePath if available, otherwise use name
            const filePath = file.relativePath || file.name;
            
            // Skip duplicates - don't add the same file twice
            const lowerPath = filePath.toLowerCase();
            if (existingFiles.has(lowerPath)) {
                // console.log(`Skipping duplicate file: ${lowerPath}`);
                continue;
            }
            
            const fileInfo = {
                name: file.name,
                path: filePath,
                size: file.size,
                type: file.type || this.getFileTypeFromName(file.name),
                lastModified: file.lastModified,
                file: file,
                content: file.content || null, // Use pre-loaded content if available
                isRoot: true,
                depth: 0,
                // If file has a handle, store it
                handle: file.handle || null,
                // Track if this file uses File System API for direct disk access
                usesFileSystemAPI: !!file.handle
            };
            
            // Process directory structure from file path
            if (fileInfo.path.includes('/')) {
                fileInfo.isRoot = false;
                
                // Extract folder path
                const lastSlash = fileInfo.path.lastIndexOf('/');
                if (lastSlash !== -1) {
                    fileInfo.folder = fileInfo.path.substring(0, lastSlash);
                    fileInfo.depth = fileInfo.folder.split('/').length;
                    
                    // Log for debugging
                    // console.log(`File ${fileInfo.name} has folder: ${fileInfo.folder}`);
                }
            } else if (file.parentFolder) {
                // Use parentFolder if provided (from directory picker)
                fileInfo.folder = file.parentFolder;
                fileInfo.isRoot = false;
                fileInfo.depth = fileInfo.folder.split('/').length;
                
                // Update the path to include parent folder
                fileInfo.path = `${file.parentFolder}/${file.name}`;
                
                // Log for debugging
                // console.log(`Using parentFolder for ${fileInfo.name}: ${fileInfo.folder}`);
            }
            
            // Add to files array
            newFiles.push(fileInfo);
            existingFiles.set(lowerPath, fileInfo); // Add to existing map to catch duplicates
        }
        
        // Merge with existing files
        this.files = this.files.concat(newFiles);
        
        // Load initial content for all files that don't have content yet
        await Promise.all(newFiles.map(async (fileInfo, i) => {
            try {
                // Skip if content is already loaded
                if (fileInfo.content !== null) {
                    return;
                }
                
                // Read the file content
                const content = await this.readFileContent(fileInfo.file);
                this.files[baseIndex + i].content = content;
            } catch (error) {
                console.error('Error reading file content:', error);
            }
        }));
        
        // Store a deep copy of the original files AFTER content is loaded
        // Only store if this is the first load (originalFiles is empty)
        if (this.originalFiles.length === 0) {
            // Create a better backup with content preserved
            this.originalFiles = this.files.map(file => {
                // Create a simplified copy that will preserve content
                const backup = {
                    name: file.name,
                    path: file.path,
                    size: file.size,
                    type: file.type,
                    lastModified: file.lastModified,
                    folder: file.folder,
                    isRoot: file.isRoot,
                    depth: file.depth,
                    // Most importantly, preserve the content!
                    content: file.content
                };
                
                console.log(`Backing up original file: ${file.path}, content length: ${file.content ? file.content.length : 'none'}`);
                
                return backup;
            });
            
            console.log(`Backed up ${this.originalFiles.length} original files with content preserved`);
        }
        
        // Reconstruct folder structure
        this.reconstructFolderStructure();
        
        // Update the file map
        this.updateFileMap();
        
        // Auto-expand parent folders
        this.autoExpandParentFolders();
        
        // If this is the first file(s) being loaded, set the first one as current
        if (this.currentFileIndex === -1 && this.files.length > 0) {
            this.currentFileIndex = 0;
        }
        
        // Notify listeners about the file list change
        this.notifyFileListChanged();
        
        return newFiles.length;
    }

    // Handle uploaded files from a standard file input or drop
    async handleFileUpload(fileList) {
        // Exit early if no files
        if (!fileList || fileList.length === 0) {
            // console.log('No files provided to handleFileUpload');
            return false;
        }
        
        try {
            // Process files
            const processed = await this.processFiles(fileList);
            
            if (processed) {
                // console.log(`Processed ${this.files.length} files`);
                return true;
            } else {
                // console.log('No files were processed successfully');
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
                    return { success: false, message: 'Could not save file. File System API error: ' + error.message };
                }
            }
            
            // No handle available - update in memory only
            fileInfo.content = content;
            
            // Display a warning that the file is only saved in memory
            const warningEvent = new CustomEvent('fileWarning', {
                detail: {
                    message: 'This file is only saved in memory. Use the File System API picker when opening files to enable direct file saving.',
                    path: fileInfo.path
                }
            });
            window.dispatchEvent(warningEvent);
            
            return { 
                success: true, 
                message: 'File saved in memory only. Use File System API to save to disk.'
            };
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
            // METHOD 1: Use the File System Access API with file handles
            if (fileInfo.file && fileInfo.file.handle) {
                try {
                    // console.log('Attempting to save file using File System API');
                    const handle = fileInfo.file.handle;
                    
                    // Always check for permission first to avoid errors
                    const options = { mode: 'readwrite' };
                    if ((await handle.queryPermission(options)) !== 'granted') {
                        // console.log('Requesting write permission...');
                        const permission = await handle.requestPermission(options);
                        if (permission !== 'granted') {
                            console.error('Permission to write to file was denied');
                            throw new Error('Permission to write to file was denied');
                        }
                    }
                    
                    // Get a writable stream
                    // console.log('Creating writable stream...');
                    const writable = await handle.createWritable();
                    
                    // Write the content
                    // console.log('Writing content...');
                    await writable.write(content);
                    
                    // Close the file
                    // console.log('Closing file...');
                    await writable.close();
                    
                    // console.log('File saved successfully using File System Access API');
                    return true;
                } catch (fsApiError) {
                    console.error('Error saving with File System API:', fsApiError);
                    
                    // Display an error notification
                    const errorEvent = new CustomEvent('fileError', {
                        detail: {
                            message: `Failed to save file: ${fsApiError.message}`,
                            path: fileInfo.path
                        }
                    });
                    window.dispatchEvent(errorEvent);
                    
                    throw fsApiError;
                }
            } else if (fileInfo.handle) {
                // Direct handle on the fileInfo (added for compatibility)
                try {
                    // console.log('Attempting to save file using direct handle');
                    const handle = fileInfo.handle;
                    
                    // Request permission
                    const options = { mode: 'readwrite' };
                    if ((await handle.queryPermission(options)) !== 'granted') {
                        const permission = await handle.requestPermission(options);
                        if (permission !== 'granted') {
                            throw new Error('Permission to write to file was denied');
                        }
                    }
                    
                    // Create writable, write content, and close
                    const writable = await handle.createWritable();
                    await writable.write(content);
                    await writable.close();
                    
                    // console.log('File saved successfully using direct handle');
                    return true;
                } catch (directHandleError) {
                    console.error('Error saving with direct handle:', directHandleError);
                    
                    // Display an error notification
                    const errorEvent = new CustomEvent('fileError', {
                        detail: {
                            message: `Failed to save file: ${directHandleError.message}`,
                            path: fileInfo.path
                        }
                    });
                    window.dispatchEvent(errorEvent);
                    
                    throw directHandleError;
                }
            } else {
                // No File System API handle - simply keep file in memory
                // console.log('No file handle available - saving in memory only');
                
                // Let user know this was not saved to disk
                const warningEvent = new CustomEvent('fileWarning', {
                    detail: {
                        message: 'File was saved in memory only. To edit original files directly, use the File System API picker when opening files.',
                        path: fileInfo.path
                    }
                });
                window.dispatchEvent(warningEvent);
                
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

    // Get files in folder - with safety checks and debug logging
    getFilesInFolder(folderPath) {
        // console.log(`Getting files in folder: ${folderPath}`);
        
        const folder = this.folderStructure.get(folderPath);
        if (!folder || !folder.files) {
            // console.log(`No folder found or no files for path: ${folderPath}`);
            return [];
        }
        
        try {
            // Debug log folder structure
            // console.log(`Folder ${folderPath} has ${folder.files.size} files:`, Array.from(folder.files));
            
            // Find indices of files in this folder for proper rendering
            const fileIndices = [];
            
            for (const filePath of folder.files) {
                if (!filePath) continue;
                
                const index = this.findFileByPath(filePath);
                if (index !== undefined) {
                    fileIndices.push(index);
                    // console.log(`Found file index ${index} for path: ${filePath}`);
                } else {
                    console.warn(`Could not find index for file path: ${filePath}`);
                }
            }
            
            // console.log(`Returning ${fileIndices.length} file indices for folder: ${folderPath}`);
            return fileIndices;
        } catch (error) {
            console.error(`Error getting files in folder ${folderPath}:`, error);
            return [];
        }
    }

    // Get subfolders - with safety checks
    getSubfolders(folderPath) {
        const folder = this.folderStructure.get(folderPath);
        if (!folder || !folder.children) return [];
        
        try {
            // Safely map subfolders with null check
            return Array.from(folder.children)
                .filter(path => path) // Filter out undefined paths
                .map(path => {
                    if (!path) return null;
                    const subfolder = this.folderStructure.get(path);
                    return subfolder || null;
                })
                .filter(subfolder => subfolder !== null); // Filter out nulls
        } catch (error) {
            console.error(`Error getting subfolders of ${folderPath}:`, error);
            return [];
        }
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

    // Find file by path with improved safety
    findFileByPath(path) {
        if (!path) {
            console.warn('findFileByPath called with undefined path');
            return undefined;
        }
        
        try {
            // First try direct match
            let fileIndex = this.fileMap.get(path.toLowerCase());
            
            // If found, return it
            if (fileIndex !== undefined) {
                return fileIndex;
            }
            
            // If not found and it doesn't have a root directory, try with various folders
            if (!path.includes('/')) {
                // Just try to find a file with this name anywhere
                for (let i = 0; i < this.files.length; i++) {
                    const file = this.files[i];
                    if (file && file.name && file.name.toLowerCase() === path.toLowerCase()) {
                        return i;
                    }
                }
            }
            
            // Not found
            return undefined;
        } catch (error) {
            console.error(`Error finding file by path '${path}':`, error);
            return undefined;
        }
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
        // console.log('Reconstructing folder structure');
        
        try {
            // Keep a backup of the old structure for comparison
            const previousStructure = new Map(this.folderStructure);
            
            // Clear the current structure
            this.folderStructure.clear();
            
            // First pass: create folders
            for (const fileInfo of this.files) {
                if (!fileInfo || !fileInfo.folder) continue;
                
                const pathParts = fileInfo.folder.split('/');
                let currentPath = '';
                
                for (let i = 0; i < pathParts.length; i++) {
                    const part = pathParts[i];
                    if (!part) continue; // Skip empty path segments
                    
                    const parentPath = currentPath;
                    currentPath = currentPath ? `${currentPath}/${part}` : part;
                    
                    if (!this.folderStructure.has(currentPath)) {
                        // Create new folder entry
                        this.folderStructure.set(currentPath, {
                            name: part,
                            path: currentPath,
                            parent: parentPath,
                            children: new Set(),
                            files: new Set(),
                            depth: i,
                            isRoot: i === 0
                        });
                    }
                    
                    if (parentPath && this.folderStructure.has(parentPath)) {
                        this.folderStructure.get(parentPath).children.add(currentPath);
                    }
                }
            }
            
            // Second pass: add files to folders
            for (const fileInfo of this.files) {
                if (!fileInfo || !fileInfo.folder || !fileInfo.path) continue;
                
                if (this.folderStructure.has(fileInfo.folder)) {
                    this.folderStructure.get(fileInfo.folder).files.add(fileInfo.path);
                }
            }
            
            // Log structure changes for debugging
            const oldFolders = Array.from(previousStructure.keys());
            const newFolders = Array.from(this.folderStructure.keys());
            
            const added = newFolders.filter(f => !previousStructure.has(f));
            const removed = oldFolders.filter(f => !this.folderStructure.has(f));
            
            if (added.length > 0 || removed.length > 0) {
                // console.log(`Folder structure changed: +${added.length} -${removed.length} folders`);
            }
            
            // Check for lost files and add them to the root if needed
            this.ensureAllFilesAreAccessible();
            
            // Log the total structure for debugging
            // console.log(`Folder structure has ${this.folderStructure.size} folders`);
            return true;
        } catch (error) {
            console.error('Error reconstructing folder structure:', error);
            return false;
        }
    }

    // Ensure all files are accessible within the folder structure
    ensureAllFilesAreAccessible() {
        // Find files that are not in any folder
        const orphanedFiles = this.files.filter(fileInfo => {
            // Skip files without folder information
            if (!fileInfo.folder) return false;
            
            // Check if the folder exists in structure
            return !this.folderStructure.has(fileInfo.folder);
        });
        
        if (orphanedFiles.length > 0) {
            console.warn(`Found ${orphanedFiles.length} orphaned files - attempting recovery`);
            
            // Try to fix folder paths for orphaned files
            for (const fileInfo of orphanedFiles) {
                // Check if any parent folder exists
                const pathParts = fileInfo.folder.split('/');
                
                // Try progressively shorter paths
                for (let i = pathParts.length - 1; i > 0; i--) {
                    const partialPath = pathParts.slice(0, i).join('/');
                    if (this.folderStructure.has(partialPath)) {
                        // Found a valid parent folder
                        console.log(`Reassigning ${fileInfo.path} to folder ${partialPath}`);
                        fileInfo.folder = partialPath;
                        fileInfo.depth = pathParts.length - 1;
                        
                        // Add to this folder
                        this.folderStructure.get(partialPath).files.add(fileInfo.path);
                        break;
                    }
                }
            }
        }
    }

    // Get all directory handles
    getDirectoryHandles() {
        return this.directoryHandles;
    }

    // Add a directory handle
    addDirectoryHandle(path, handle) {
        // Normalize path for consistency
        path = this.normalizePath(path);
        
        // console.log(`Adding directory handle for: ${path}`);
        this.directoryHandles.set(path, handle);
        
        // Log number of directories being monitored
        // console.log(`Now monitoring ${this.directoryHandles.size} directories`);
    }

    // Remove a directory handle
    removeDirectoryHandle(path) {
        this.directoryHandles.delete(path);
    }

    // Remove files by path with improved safety
    removeFiles(filePaths) {
        if (!filePaths || filePaths.length === 0) return false;
        
        /* // Safety check - don't remove too many files at once
        const maxFilesToRemove = Math.max(5, Math.floor(this.files.length * 0.2));
        if (filePaths.length > maxFilesToRemove) {
            console.warn(`Attempted to remove ${filePaths.length} files at once, exceeding safety threshold of ${maxFilesToRemove}`);
            return false;
        } */
        
        console.log(`FileManager: Removing ${filePaths.length} files`);
        
        // Keep track of removed indices to adjust the currentFileIndex later
        const removedIndices = [];
        let currentFileRemoved = false;
        
        // Track which folders have had content removed
        const affectedFolders = new Set();
        
        // First, find all the file indices to remove and track their folders
        filePaths.forEach(path => {
            const fileIndex = this.findFileByPath(path);
            if (fileIndex !== undefined) {
                const file = this.files[fileIndex];
                if (file && file.folder) {
                    affectedFolders.add(file.folder);
                }
                
                removedIndices.push(fileIndex);
                
                // Check if we're removing the current file
                if (fileIndex === this.currentFileIndex) {
                    currentFileRemoved = true;
                }
            }
        });
        
        // Sort indices in descending order to avoid index shifting problems when removing
        removedIndices.sort((a, b) => b - a);
        
        // Remove files from the array
        removedIndices.forEach(index => {
            this.files.splice(index, 1);
        });
        
        // Update current file index if needed
        if (currentFileRemoved) {
            // Try to set current file to the previous one or first one
            if (this.files.length > 0) {
                this.currentFileIndex = Math.min(this.currentFileIndex, this.files.length - 1);
            } else {
                this.currentFileIndex = -1;
            }
        } else if (this.currentFileIndex !== -1) {
            // Adjust current file index if removed files were before it
            let offset = 0;
            removedIndices.forEach(index => {
                if (index < this.currentFileIndex) {
                    offset++;
                }
            });
            this.currentFileIndex -= offset;
        }
        
        // Mark affected folders as having deleted content
        affectedFolders.forEach(folder => {
            this.folderHasDeletedContent.add(folder);
        });
        
        // Rebuild folder structure and file map
        this.reconstructFolderStructure();
        this.updateFileMap();
        
        // Notify about file list change
        this.notifyFileListChanged();
        
        return true;
    }

    /**
     * Compare two file paths with robust normalization
     * Returns true if paths refer to the same file or if one path contains the other
     */
    comparePaths(path1, path2) {
        if (!path1 || !path2) return false;
        
        // Normalize paths (remove trailing slashes, handle backslashes, ensure consistent casing)
        const normalizedPath1 = this.normalizePath(path1).toLowerCase();
        const normalizedPath2 = this.normalizePath(path2).toLowerCase();
        
        // Direct equality check
        if (normalizedPath1 === normalizedPath2) return true;
        
        // Check if one path is contained within the other (for directory membership)
        // Ensure we check with trailing slash to avoid partial filename matches
        if (normalizedPath1.endsWith('/') || normalizedPath2.endsWith('/')) {
            // One is already a directory path
            return normalizedPath1.startsWith(normalizedPath2) || normalizedPath2.startsWith(normalizedPath1);
        } else {
            // Add slashes for proper directory boundary checking
            return normalizedPath1.startsWith(normalizedPath2 + '/') || 
                   normalizedPath2.startsWith(normalizedPath1 + '/') ||
                   // Handle case where one path might be a file and the other a directory containing it
                   normalizedPath1 === normalizedPath2.split('/').slice(0, -1).join('/') ||
                   normalizedPath2 === normalizedPath1.split('/').slice(0, -1).join('/');
        }
    }
    
    /**
     * Enhanced path normalization 
     */
    normalizePath(path) {
        if (!path) return '';
        
        // Convert backslashes to forward slashes (Windows paths)
        path = path.replace(/\\/g, '/');
        
        // Ensure no double slashes
        while (path.includes('//')) {
            path = path.replace(/\/\//g, '/');
        }
        
        // Handle trailing slash consistently
        if (path.endsWith('/') && path.length > 1) {
            path = path.slice(0, -1);
        }
        
        // Ensure root paths are properly formatted
        if (path === '') {
            return '/';
        }
        
        // console.log(`Normalized path: ${path} -> ${path}`); // Debug log
        return path;
    }

    /**
     * Get all directory handles (for debugging)
     */
    getMonitoredDirectories() {
        return Array.from(this.directoryHandles.keys());
    }

    // Auto-expand all parent folders after loading
    autoExpandParentFolders() {
        if (!this.fileListComponent) return;
        
        console.log('Auto-expanding parent folders');
        
        // Get the current expanded folders
        const expandedFolders = new Set(this.fileListComponent.state.expandedFolders || []);
        
        // Automatically expand all root folders
        for (const [path, folder] of this.folderStructure.entries()) {
            if (folder.isRoot) {
                console.log(`Auto-expanding root folder: ${path}`);
                expandedFolders.add(path);
            }
        }
        
        // Update the file list component state with the expanded folders
        if (this.fileListComponent.setState) {
            this.fileListComponent.setState({ expandedFolders });
            console.log(`Expanded ${expandedFolders.size} folders`);
        }
    }

    /**
     * Get all file paths within a specific folder and its subfolders.
     * @param {string} folderPath - The path of the target folder.
     * @returns {string[]} An array of file paths.
     */
    getAllFilePathsInAndBelowFolder(folderPath) {
        const filePaths = [];
        const folderPrefix = folderPath + '/'; // Check for files starting with folder/
        
        for (const file of this.files) {
            if (file && file.path) {
                // Check if file is directly in the folder OR in a subfolder
                if (file.folder === folderPath || (file.folder && file.folder.startsWith(folderPrefix))) {
                     filePaths.push(file.path);
                }
                // Alternative check using path (might be slightly less robust if folder names can contain special chars)
                // if (file.path === folderPath || file.path.startsWith(folderPrefix)) {
                //     filePaths.push(file.path);
                // }
            }
        }
        console.log(`getAllFilePathsInAndBelowFolder found ${filePaths.length} files under ${folderPath}`);
        return filePaths;
    }

    /**
     * Check if a folder has had any of its original content deleted
     * @param {string} folderPath - Path of the folder to check
     * @returns {boolean} True if folder has deleted content
     */
    folderHasDeletedFiles(folderPath) {
        // Get current files in this folder and subfolders
        const currentFiles = this.getAllFilePathsInAndBelowFolder(folderPath);
        
        // Get original files that should be in this folder
        const originalFolderFiles = this.originalFiles
            .filter(file => file && file.path && 
                    (file.folder === folderPath || 
                    (file.folder && file.folder.startsWith(folderPath + '/'))))
            .map(file => file.path);
        
        // If there are fewer current files than original, something was deleted
        if (currentFiles.length < originalFolderFiles.length) {
            return true;
        }
        
        // Check if any original files are missing from current files
        for (const origPath of originalFolderFiles) {
            if (!currentFiles.includes(origPath)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Restore files that were deleted from a folder
     * @param {string} folderPath - Path of the folder to restore
     * @returns {boolean} True if restoration was successful
     */
    restoreFolderFiles(folderPath) {
        try {
            console.log(`Restoring original files for folder: ${folderPath}`);
            
            // Get original files that belong to this folder
            const filesToRestore = this.originalFiles.filter(file => 
                file && file.path && 
                (file.folder === folderPath || 
                (file.folder && file.folder.startsWith(folderPath + '/'))));
            
            if (filesToRestore.length === 0) {
                console.log(`No original files found for folder: ${folderPath}`);
                return false;
            }
            
            // Create a map of current files by path
            const currentFilePaths = new Map();
            this.files.forEach(file => {
                if (file && file.path) {
                    currentFilePaths.set(file.path, true);
                }
            });
            
            // Find files that need to be restored (not in current files)
            const filesToAdd = filesToRestore.filter(file => 
                !currentFilePaths.has(file.path));
            
            if (filesToAdd.length === 0) {
                console.log(`No files need to be restored for folder: ${folderPath}`);
                return false;
            }
            
            console.log(`Adding ${filesToAdd.length} files back to folder: ${folderPath}`);
            
            // For better debugging
            filesToAdd.forEach(file => {
                console.log(`File to restore: ${file.path}, has content: ${!!file.content}, content type: ${typeof file.content}`);
            });
            
            // Add missing files back to the files array with proper initialization
            const freshFilesToAdd = [];
            
            // Process each file with proper error handling
            for (const file of filesToAdd) {
                try {
                    // Create a shallow copy of basic properties
                    const freshFile = {
                        name: file.name,
                        path: file.path,
                        size: file.size,
                        type: file.type || 'text/plain',
                        lastModified: file.lastModified,
                        folder: file.folder,
                        isRoot: file.isRoot,
                        depth: file.depth,
                        isDeleted: false
                    };
                    
                    // Ensure we have content - prioritize from different sources
                    let content = null;
                    
                    // Try different sources for content:
                    // 1. Direct content property
                    if (file.content) {
                        content = file.content;
                        console.log(`Using direct content for ${file.path}, length: ${content.length}`);
                    } 
                    // 2. If content exists in the original files array
                    else {
                        const originalFile = this.originalFiles.find(f => f.path === file.path && f.content);
                        if (originalFile && originalFile.content) {
                            content = originalFile.content;
                            console.log(`Using original file content for ${file.path}, length: ${content.length}`);
                        }
                        // 3. Create placeholder content as a last resort
                        else {
                            content = `# ${file.name}\n\nThis file was restored but its original content could not be recovered.`;
                            console.log(`Creating placeholder content for ${file.path}`);
                        }
                    }
                    
                    // Ensure content is a string
                    if (content instanceof Blob) {
                        // We'll handle this by creating a readable string later
                        console.log(`Content for ${file.path} is a Blob`);
                    } else if (typeof content !== 'string') {
                        try {
                            content = String(content);
                            console.log(`Converted content for ${file.path} to string`);
                        } catch (e) {
                            console.error(`Error converting content to string for ${file.path}:`, e);
                            content = `# ${file.name}\n\nThis file was restored but its content could not be properly displayed.`;
                        }
                    }
                    
                    // Set the content
                    freshFile.content = content;
                    
                    // Create a Blob for file property
                    try {
                        if (content) {
                            if (content instanceof Blob) {
                                freshFile.file = content;
                            } else {
                                freshFile.file = new Blob([content], { type: freshFile.type });
                            }
                            console.log(`Created Blob for ${file.path}`);
                        }
                    } catch (e) {
                        console.error(`Error creating Blob for ${file.path}:`, e);
                    }
                    
                    // Handle file.handle if it exists
                    if (file.file && file.file.handle) {
                        freshFile.handle = file.file.handle;
                    } else if (file.handle) {
                        freshFile.handle = file.handle;
                    }
                    
                    // Add successfully restored file
                    console.log(`Successfully restored file ${freshFile.path} with content type: ${typeof freshFile.content}`);
                    freshFilesToAdd.push(freshFile);
                } catch (error) {
                    console.error(`Error restoring file ${file.path}:`, error);
                }
            }
            
            // Add the successfully restored files
            if (freshFilesToAdd.length === 0) {
                console.warn(`No files could be successfully restored for folder: ${folderPath}`);
                return false;
            }
            
            console.log(`Successfully prepared ${freshFilesToAdd.length} files to be restored`);
            this.files = this.files.concat(freshFilesToAdd);
            
            // Rebuild folder structure and file map
            this.reconstructFolderStructure();
            this.updateFileMap();
            
            // Remove from deleted folders tracking
            this.folderHasDeletedContent.delete(folderPath);
            
            // Notify about file list change
            this.notifyFileListChanged();
            
            return true;
        } catch (error) {
            console.error(`Error restoring folder ${folderPath}:`, error);
            return false;
        }
    }

    /**
     * Get all files for state saving
     * @returns {Array} Array of file objects with essential information
     */
    getFiles() {
        return this.files.map(file => ({
            name: file.name,
            path: file.path,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            content: file.content,
            folder: file.folder,
            isRoot: file.isRoot,
            depth: file.depth
        }));
    }

    /**
     * Get all folders for state saving
     * @returns {Array} Array of folder objects
     */
    getFolders() {
        const folders = [];
        
        this.folderStructure.forEach((folder, path) => {
            try {
                folders.push({
                    path: path,
                    expanded: folder.expanded,
                    // Convert Set to Array before using map
                    files: Array.from(folder.files || []),
                    // Use children instead of subfolders, which is what reconstructFolderStructure creates
                    children: Array.from(folder.children || [])
                });
            } catch (error) {
                console.error(`Error processing folder ${path} for saving:`, error);
            }
        });
        
        return folders;
    }

    /**
     * Restore state from saved files and folders
     * @param {Array} files - Array of saved file objects
     * @param {Array} folders - Array of saved folder objects
     */
    async restoreState(files, folders) {
        try {
            // Validate input
            if (!files || !Array.isArray(files)) {
                console.error('Invalid files parameter: not an array', files);
                return false;
            }

            // Clear current state
            this.clearFiles();
            
            // Filter out invalid files
            const validFiles = files.filter(file => 
                file && 
                typeof file === 'object' && 
                file.path && 
                typeof file.path === 'string' &&
                file.name && 
                typeof file.name === 'string'
            );
            
            if (validFiles.length < files.length) {
                console.warn(`Filtered out ${files.length - validFiles.length} invalid file entries`);
            }
            
            if (validFiles.length === 0) {
                console.error('No valid files to restore');
                return false;
            }
            
            // Ensure each file has the minimal required properties
            const sanitizedFiles = validFiles.map(file => {
                // Create a new object with default values for missing properties
                return {
                    name: file.name,
                    path: file.path,
                    size: file.size || 0,
                    type: file.type || 'text/plain',
                    lastModified: file.lastModified || Date.now(),
                    content: file.content || `# ${file.name}\n\nFile content could not be restored.`,
                    folder: file.folder || '',
                    isRoot: file.isRoot || false,
                    depth: file.depth || 0
                };
            });
            
            // Restore files
            this.files = sanitizedFiles;
            
            // Reconstruct folder structure
            try {
                this.reconstructFolderStructure();
            } catch (folderError) {
                console.error('Error reconstructing folder structure:', folderError);
                // Continue anyway, as we might still have valid files
            }
            
            // Update the file map
            try {
                this.updateFileMap();
            } catch (mapError) {
                console.error('Error updating file map:', mapError);
                // Continue anyway
            }
            
            // Set first file as current if needed
            if (this.currentFileIndex === -1 && this.files.length > 0) {
                this.currentFileIndex = 0;
            }
            
            // Restore folder expansion states
            if (folders && Array.isArray(folders) && folders.length > 0) {
                folders.forEach(folder => {
                    if (folder && folder.path && this.folderStructure) {
                        const folderInfo = this.folderStructure.get(folder.path);
                        if (folderInfo) {
                            folderInfo.expanded = folder.expanded;
                        }
                    }
                });
            }
            
            // Notify listeners about the file list change
            this.notifyFileListChanged();
            
            // Return success based on whether we restored any files
            return this.files.length > 0;
        } catch (error) {
            console.error('Error restoring state:', error);
            return false;
        }
    }
}

FileManager; 

// File: utils/stateManager.js
/**
 * State Manager for FileToMarkdown Viewer
 * Handles saving and loading the state of files and folders
 */

class StateManager {
    constructor(fileManager) {
        this.fileManager = fileManager;
        this.saveBtn = document.getElementById('btn-save');
        this.presetContainer = null; // Will be created dynamically when needed
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
        
        // Create a spacer element between save button and presets
        this.createSpacerElement();
        
        // Check if we have previously saved presets and create container if needed
        this.checkForSavedPresets();
        
        // Create garbage button at the bottom
        this.createGarbageButton();
    }
    
    /**
     * Create the preset container dynamically
     */
    createPresetContainer() {
        // Don't create if it already exists
        if (this.presetContainer) return;
        
        // Create the container element
        const container = document.createElement('div');
        container.id = 'preset-container';
        container.className = 'preset-container';
        
        // Position the container
        container.style.position = 'absolute';
        container.style.top = '120px'; // Position below the spacer (increased from 110px to 140px)
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.gap = '10px';
        container.style.alignItems = 'center';
        container.style.width = '40px'; // Match the width of other buttons
        
        // Add to cidron-box
        this.cidronBox.appendChild(container);
        
        // Store reference
        this.presetContainer = container;
    }
    
    /**
     * Create a preset button dynamically
     */
    createPresetButton(presetName, timestamp) {
        // Create the preset container if it doesn't exist yet
        this.createPresetContainer();
        if (!this.presetContainer) return; // Exit if container creation failed

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
        // Store tooltip text in data attribute instead of title to avoid browser's built-in tooltip
        presetBtn.dataset.tooltip = `Load: ${presetName} (${new Date(timestamp).toLocaleString()})`;
        // Use a simpler SVG icon without complex paths that might render incorrectly
        presetBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 3v10M7 8l5-5 5 5M21 12v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            </svg>
        `;
        
        // Add styles specific to this button instance
        presetBtn.style.position = 'static'; 
        presetBtn.style.margin = '0'; 
        presetBtn.style.transform = 'none'; 
        presetBtn.style.width = '40px'; 
        presetBtn.style.height = '40px'; 
        
        // Add event listener
        presetBtn.addEventListener('click', () => this.loadPreset(presetName));
        
        presetBtn.addEventListener('contextmenu', (event) => {
             event.preventDefault();
             if (confirm(`Delete preset "${presetName}"?`)) {
                 this.removePreset(presetName);
             }
        });

        // Add to preset container
        if (this.clearBtn && this.presetContainer.contains(this.clearBtn)) {
            this.presetContainer.insertBefore(presetBtn, this.clearBtn);
        } else {
            this.presetContainer.appendChild(presetBtn);
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
            
            // Remove all preset buttons
            if (this.presetContainer) {
                this.presetContainer.innerHTML = '';
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
     * Create and append the "Clear Presets" button
     */
    createClearPresetsButton() {
        if (this.clearBtn) return; // Already created

        if (!this.cidronBox) {
           console.error("Cidron box not found, cannot add Clear button.");
           return;
        }

        this.clearBtn = document.createElement('button');
        this.clearBtn.id = 'btn-clear-presets';
        this.clearBtn.className = 'btn btn-danger'; // Use a danger class for styling? Or just 'btn'
        // Use data-tooltip instead of title for the hover tooltip
        this.clearBtn.dataset.tooltip = 'Clear All Saved Presets';
        // Use a simpler SVG icon for consistency
        this.clearBtn.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2"/>
                <line x1="10" y1="11" x2="10" y2="17"/>
                <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
        `;
        
        // Basic styling consistent with other buttons
        this.clearBtn.style.position = 'static'; 
        this.clearBtn.style.margin = '0'; 
        this.clearBtn.style.transform = 'none'; 
        this.clearBtn.style.width = '40px'; 
        this.clearBtn.style.height = '40px'; 

        // Add event listener
        this.clearBtn.removeEventListener('click', this.handleClearClick); // Ensure no duplicates
        this.clearBtn.addEventListener('click', this.handleClearClick);

        // Append to preset container if it exists, otherwise wait for it
        if (this.presetContainer) {
            this.presetContainer.appendChild(this.clearBtn);
            console.log("Clear Presets button created and added immediately.");
        } else {
            // If container doesn't exist yet, createPresetContainer will add it later
            console.log("Clear Presets button created, will be added when container is ready.");
             // We might need to explicitly add it if loadPresetsFromDB doesn't trigger container creation
             // Let's try adding it directly to cidronBox for now, positioned below presets
             this.clearBtn.style.position = 'absolute';
             this.clearBtn.style.top = '160px'; // Example position below presets, adjust as needed
             this.clearBtn.style.left = '50%';
             this.clearBtn.style.transform = 'translateX(-50%)';
             this.cidronBox.appendChild(this.clearBtn);
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

    /**
     * Create a visual spacer element between save button and presets
     */
    createSpacerElement() {
        if (!this.cidronBox) {
            console.error("Cidron box not found, cannot add spacer element.");
            return;
        }

        // Create spacer div
        const spacer = document.createElement('div');
        spacer.className = 'preset-spacer';
        spacer.style.width = '40px';
        spacer.style.height = '20px'; // Height of spacer
        spacer.style.position = 'absolute';
        spacer.style.top = '110px'; // Position right after save button (60px + 40px height + 10px)
        spacer.style.left = '50%';
        spacer.style.transform = 'translateX(-50%)';
        spacer.style.zIndex = '1001';
        
        // Add to cidron-box
        this.cidronBox.appendChild(spacer);
    }
}

// Allow for both module and direct browser use
if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = { StateManager };
} 

// File: components/FileList.js
// import from ../utils/domUtils
// import from ../utils/eventEmitter

/**
 * FileList component for rendering and interacting with the file tree
 */
class FileList extends EventEmitter {
    constructor(container, fileManager) {
        super();
        this.container = container;
        this.fileManager = fileManager;
        
        // Register this component with the file manager
        this.fileManager.registerFileListComponent(this);
        
        // Set initial state
        this.state = {
            selectedIndex: this.fileManager.currentFileIndex || -1,
            expandedFolders: this.getSavedExpandedFolders() || new Set()
        };
        
        // Listen for file list changes
        window.addEventListener('fileListChanged', () => {
            console.log('FileList: Handling fileListChanged event');
            
            // Update selected index to match file manager's current file
            this.setState({ 
                selectedIndex: this.fileManager.currentFileIndex || -1
            });
            
            this.render();
        });
        
        // Initial render
        this.render();
    }
    
    /**
     * Update component state
     * @param {Object} newState - New state properties to merge
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
    }
    
    /**
     * Get saved expanded folders from localStorage
     */
    getSavedExpandedFolders() {
        try {
            const savedFolders = localStorage.getItem('expandedFolders');
            if (savedFolders) {
                const folderArray = JSON.parse(savedFolders);
                return new Set(folderArray);
            }
        } catch (e) {
            console.error('Error loading expanded folders state:', e);
        }
        return new Set();
    }

    /**
     * Save expanded folders to localStorage
     */
    saveExpandedFolders() {
        try {
            const folderArray = Array.from(this.state.expandedFolders);
            localStorage.setItem('expandedFolders', JSON.stringify(folderArray));
        } catch (e) {
            console.error('Error saving expanded folders state:', e);
        }
    }
    
    /**
     * Render component
     */
    render() {
        console.log('Rendering FileList component');
        
        // Clear container
        this.container.innerHTML = '';
        
        // Check if we have any files
        if (!this.fileManager.files || this.fileManager.files.length === 0) {
            this.renderEmptyState();
            return;
        }
        
        // Create file tree
        const fileTree = createElementWithAttributes('ul', {
            className: 'file-tree'
        });
        
        try {
            // Render root folders
            if (this.fileManager.folderStructure && this.fileManager.folderStructure.size > 0) {
                const rootFolders = Array.from(this.fileManager.folderStructure.values())
                    .filter(folder => folder && folder.isRoot) // Filter out undefined values
                    .sort((a, b) => {
                        if (!a || !a.name) return 1;
                        if (!b || !b.name) return -1;
                        return a.name.localeCompare(b.name);
                    });
                
                console.log(`FileList: Rendering ${rootFolders.length} root folders`);
                
                for (const folder of rootFolders) {
                    if (folder && folder.path) {
                        try {
                            const folderElement = this.renderFolder(folder);
                            fileTree.appendChild(folderElement);
                        } catch (err) {
                            console.error(`Error rendering folder ${folder.path}:`, err);
                        }
                    }
                }
            }
            
            // Render root files (files without folders)
            const rootFiles = this.fileManager.files
                .filter(file => file && file.isRoot) // Filter out undefined values and ensure isRoot
                .sort((a, b) => {
                    if (!a || !a.name) return 1;
                    if (!b || !b.name) return -1;
                    return a.name.localeCompare(b.name);
                });
            
            console.log(`FileList: Rendering ${rootFiles.length} root files`);
            
            for (const file of rootFiles) {
                if (file && file.path) {
                    try {
                        const fileIndex = this.fileManager.findFileByPath(file.path);
                        if (fileIndex !== undefined) {
                            const fileElement = this.renderFileItem(file, fileIndex);
                            fileTree.appendChild(fileElement);
                        }
                    } catch (err) {
                        console.error(`Error rendering file ${file.path}:`, err);
                    }
                }
            }
        } catch (error) {
            console.error('Error rendering file list:', error);
            this.renderEmptyState();
            return;
        }
        
        // Add file tree to container
        this.container.appendChild(fileTree);
    }
    
    /**
     * Render empty state
     */
    renderEmptyState() {
        const emptyMessage = createElementWithAttributes('div', {
            className: 'empty-state',
            style: {
                padding: '20px',
                textAlign: 'center',
                color: '#666'
            },
            innerHTML: '<p>No files loaded</p>'
        });
        
        this.container.appendChild(emptyMessage);
    }
    
    /**
     * Render a folder and its contents
     * @param {Object} folder - Folder info object
     * @returns {HTMLElement} Folder list item
     */
    renderFolder(folder) {
        if (!folder || !folder.path) {
            console.error("Attempted to render invalid folder", folder);
            return document.createElement('li'); // Return empty element
        }

        const isExpanded = this.state.expandedFolders.has(folder.path);
        
        // Create folder item
        const folderItem = createElementWithAttributes('li', {
            className: `folder-item ${isExpanded ? 'expanded' : ''}`,
            'data-path': folder.path,
            'data-depth': folder.depth || 0
        });
        
        // Create folder header
        const folderHeader = createElementWithAttributes('div', {
            className: 'folder-header',
            onclick: (e) => {
                e.preventDefault();
                this.toggleFolder(folder.path);
            }
        });
        
        // Create expand/collapse indicator
        const expandIcon = createElementWithAttributes('span', {
            className: 'expand-icon',
            innerHTML: isExpanded 
                ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>' 
                : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>'
        });
        
        // Create folder icon container
        const folderIconContainer = createElementWithAttributes('div', {
            className: 'folder-icon-container',
        });
        
        // Create folder icon
        const folderIcon = createElementWithAttributes('span', {
            className: 'folder-icon',
            innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>'
        });
        
        // Create delete icon (overlay on folder icon)
        const deleteIcon = createElementWithAttributes('span', {
            className: 'delete-folder-icon',
            innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>', // Trash can icon
            onclick: (e) => {
                e.stopPropagation(); // Prevent folder toggle
                e.preventDefault();
                this.handleDeleteFolderClick(folder.path);
            }
        });
        
        // Create folder name
        const folderName = createElementWithAttributes('span', {
            className: 'folder-name',
            textContent: folder.name || 'Unknown folder'
        });

        // Add icons to container
        folderIconContainer.appendChild(folderIcon);
        folderIconContainer.appendChild(deleteIcon);
        
        // Create refresh button (only visible when folder or any subfolder has deleted content)
        const hasDeletedContent = this.folderOrChildrenHaveDeletedContent(folder.path);
        console.log(`Folder ${folder.path} has deleted content: ${hasDeletedContent}`);
        
        const refreshButton = createElementWithAttributes('button', {
            className: 'btn btn-icon refresh-folder-btn',
            title: `Restore original files in ${folder.name}`,
            style: { 
                padding: '0',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                marginLeft: 'auto'
            },
            innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path></svg>', // Refresh icon
            onclick: (e) => {
                e.stopPropagation(); // Prevent folder toggle
                this.handleRefreshFolderClick(folder.path);
            }
        });
        
        // Apply the display property directly to the element to override CSS !important
        if (hasDeletedContent) {
            refreshButton.style.cssText += '; display: flex !important;';
        }
        
        // Assemble folder header
        folderHeader.appendChild(expandIcon);
        folderHeader.appendChild(folderIconContainer);
        folderHeader.appendChild(folderName);
        folderHeader.appendChild(refreshButton);
        folderItem.appendChild(folderHeader);
        
        // Create folder contents container
        const folderContents = createElementWithAttributes('ul', {
            className: `folder-contents ${isExpanded ? '' : 'collapsed'}`,
            style: {
                display: isExpanded ? 'block' : 'none'
            }
        });
        
        // Only render contents if expanded
        if (isExpanded) {
            try {
                // Render subfolders
                if (folder.path) {
                    const subfolders = this.fileManager.getSubfolders(folder.path)
                        .filter(subfolder => subfolder && subfolder.path) // Filter undefined
                        .sort((a, b) => {
                            if (!a || !a.name) return 1;
                            if (!b || !b.name) return -1;
                            return a.name.localeCompare(b.name);
                        });
                    
                    for (const subfolder of subfolders) {
                        if (subfolder && subfolder.path) {
                            try {
                                const folderElement = this.renderFolder(subfolder);
                                folderContents.appendChild(folderElement);
                            } catch (err) {
                                console.error(`Error rendering subfolder ${subfolder.path}:`, err);
                            }
                        }
                    }
                    
                    // Render files in folder - FIXED to use indices directly
                    console.log(`Rendering files in folder: ${folder.path}`);
                    const fileIndices = this.fileManager.getFilesInFolder(folder.path);
                    console.log(`Got ${fileIndices.length} file indices for folder: ${folder.path}`);
                    
                    for (const fileIndex of fileIndices) {
                        try {
                            const fileInfo = this.fileManager.getFile(fileIndex);
                            if (fileInfo && fileInfo.path) {
                                console.log(`Rendering file: ${fileInfo.name} (${fileInfo.path})`);
                                const fileElement = this.renderFileItem(fileInfo, fileIndex);
                                folderContents.appendChild(fileElement);
                            } else {
                                console.warn(`Missing file info for index: ${fileIndex}`);
                            }
                        } catch (err) {
                            console.error(`Error rendering file at index ${fileIndex}:`, err);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error rendering contents of folder ${folder.path}:`, error);
                // Add error message to folder contents
                const errorElement = createElementWithAttributes('li', {
                    className: 'folder-error',
                    textContent: 'Error loading folder contents'
                });
                folderContents.appendChild(errorElement);
            }
        }
        
        folderItem.appendChild(folderContents);
        return folderItem;
    }
    
    /**
     * Render a file item
     * @param {Object} fileInfo - File info object
     * @param {number} index - Index in file manager
     * @returns {HTMLElement} File list item
     */
    renderFileItem(fileInfo, index) {
        const isSelected = index === this.state.selectedIndex;
        
        // Create file item
        const fileItem = createElementWithAttributes('li', {
            className: `file-item ${isSelected ? 'selected' : ''}`,
            'data-index': index,
            'data-path': fileInfo.path,
            'data-depth': fileInfo.depth || 0
        });
        
        // Create file link
        const fileLink = createElementWithAttributes('a', {
            href: '#',
            title: fileInfo.path,
            onclick: (e) => {
                e.preventDefault();
                this.setState({ selectedIndex: index });
                this.emit('fileSelect', { index, fileInfo });
            }
        });
        
        // Create file icon container
        const fileIconContainer = createElementWithAttributes('div', {
            className: 'file-icon-container',
        });

        // Create file icon based on type
        const fileIcon = createElementWithAttributes('span', {
            className: 'file-icon',
            innerHTML: this.getFileIconSVG(fileInfo.name)
        });
        
        // Create delete icon (overlay on file icon)
        const deleteIcon = createElementWithAttributes('span', {
            className: 'delete-file-icon',
            innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>', // Trash can icon
            onclick: (e) => {
                e.stopPropagation(); // Prevent file selection
                e.preventDefault(); 
                this.handleDeleteFileClick(fileInfo.path, index);
            }
        });
        
        // Create file name
        const fileName = createElementWithAttributes('span', {
            className: 'file-name',
            textContent: fileInfo.name
        });

        // Add icons to container
        fileIconContainer.appendChild(fileIcon);
        fileIconContainer.appendChild(deleteIcon);

        // Assemble file item
        fileLink.appendChild(fileIconContainer);
        fileLink.appendChild(fileName);
        fileItem.appendChild(fileLink);
        
        return fileItem;
    }
    
    /**
     * Toggle folder expansion state
     * @param {string} folderPath - Path of folder to toggle
     */
    toggleFolder(folderPath) {
        console.log(`Toggling folder: ${folderPath}`);
        
        const expandedFolders = new Set(this.state.expandedFolders);
        const isExpanding = !expandedFolders.has(folderPath);
        
        if (isExpanding) {
            // Add this folder to expanded set
            expandedFolders.add(folderPath);
            
            // Make sure all parent folders are expanded too
            let parentPath = this.fileManager.getFolderInfo(folderPath)?.parent;
            while (parentPath) {
                expandedFolders.add(parentPath);
                parentPath = this.fileManager.getFolderInfo(parentPath)?.parent;
            }
        } else {
            // Remove this folder from expanded set
            expandedFolders.delete(folderPath);
            
            // Also collapse all child folders
            Array.from(expandedFolders).forEach(path => {
                if (path.startsWith(folderPath + '/')) {
                    expandedFolders.delete(path);
                }
            });
        }
        
        // Update state and save
        this.setState({ expandedFolders });
        this.saveExpandedFolders();
    }

    /**
     * Get SVG icon for file based on extension
     * @param {string} fileName - Name of file
     * @returns {string} SVG markup
     */
    getFileIconSVG(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        
        // Map of extensions to SVG icons
        const iconMap = {
            md: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 13h2v6M16 13h2M11 13c-.5 2.5-2.5 4-5 4"></path></svg>',
            markdown: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 13h2v6M16 13h2M11 13c-.5 2.5-2.5 4-5 4"></path></svg>',
            mdown: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 13h2v6M16 13h2M11 13c-.5 2.5-2.5 4-5 4"></path></svg>',
            txt: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
        };
        
        return iconMap[extension] || '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>';
    }

    /**
     * Handle click on the delete folder button
     * @param {string} folderPath - Path of the folder to delete
     */
    handleDeleteFolderClick(folderPath) {
        const folderInfo = this.fileManager.getFolderInfo(folderPath);
        if (!folderInfo) {
            console.error(`Could not find folder info for path: ${folderPath}`);
            return;
        }

        console.log(`Deleting folder: ${folderPath}`); // Updated log message
        const filePathsToDelete = this.fileManager.getAllFilePathsInAndBelowFolder(folderPath);
        
        if (filePathsToDelete.length > 0) {
            console.log(`Found ${filePathsToDelete.length} files to delete within and below ${folderPath}`);
            // Call FileManager to remove the files. FileManager will handle
            // updating the structure and notifying about the change.
             try {
                 const success = this.fileManager.removeFiles(filePathsToDelete);
                 if (!success) {
                     this.showError(`Failed to remove files for folder: ${folderPath}`);
                 } else {
                     // Explicitly remove folder from expanded state if it was expanded
                     const expandedFolders = new Set(this.state.expandedFolders);
                     if (expandedFolders.has(folderPath)) {
                         expandedFolders.delete(folderPath);
                         // Also remove children from expanded state
                         Array.from(expandedFolders).forEach(path => {
                             if (path.startsWith(folderPath + '/')) {
                                 expandedFolders.delete(path);
                             }
                         });
                         this.setState({ expandedFolders }); // Trigger re-render without the deleted folder expanded
                         this.saveExpandedFolders();
                     }
                 }
             } catch (error) {
                console.error(`Error during file removal for folder ${folderPath}:`, error);
                 this.showError(`Error removing folder: ${error.message}`);
             }
        } else {
            // If the folder was empty, we still need to remove it from the structure
            // Note: `removeFiles` might already handle empty folders if we pass an empty array,
            // but let's ensure the folder structure is cleaned up.
            // We might need a dedicated `removeEmptyFolder` in FileManager if `removeFiles([])` doesn't suffice.
            // For now, let's assume removeFiles handles the structure update correctly even with an empty list.
            console.log(`Folder ${folderPath} appears to be empty, attempting structure cleanup via removeFiles.`);
            try {
               this.fileManager.removeFiles([]); // Call with empty array to trigger structure update
               // Also remove from expanded state if it was empty and expanded
                const expandedFolders = new Set(this.state.expandedFolders);
                if (expandedFolders.has(folderPath)) {
                    expandedFolders.delete(folderPath);
                    this.setState({ expandedFolders });
                    this.saveExpandedFolders();
                }
            } catch (error) {
               console.error(`Error cleaning up empty folder ${folderPath}:`, error);
            }
        }
    }
    
    /**
     * Handle click on the delete file button
     * @param {string} filePath - Path of the file to delete
     * @param {number} index - Index of the file in the file manager
     */
    handleDeleteFileClick(filePath, index) {
        console.log(`Deleting file: ${filePath} at index ${index}`);

        try {
            const success = this.fileManager.removeFiles([filePath]); // Pass path in an array
            if (!success) {
                this.showError(`Failed to remove file: ${filePath}`);
            }
            // No need to manage expanded state here, removeFiles handles structure update
        } catch (error) {
            console.error(`Error during file removal for ${filePath}:`, error);
            this.showError(`Error removing file: ${error.message}`);
        }
    }
    
    /**
     * Handle click on the refresh folder button
     * @param {string} folderPath - Path of the folder to refresh
     */
    handleRefreshFolderClick(folderPath) {
        console.log(`Refreshing folder: ${folderPath}`);
        
        try {
            // Find all subfolders that need to be refreshed
            const allFoldersToRefresh = [folderPath];
            
            // Add all child folders with deleted content
            for (const path of this.fileManager.folderHasDeletedContent) {
                if (path.startsWith(folderPath + '/')) {
                    allFoldersToRefresh.push(path);
                }
            }
            
            let success = false;
            
            // Refresh each folder
            for (const path of allFoldersToRefresh) {
                if (this.fileManager.restoreFolderFiles(path)) {
                    success = true;
                }
            }
            
            if (!success) {
                this.showError(`Failed to restore files for folder: ${folderPath}`);
            } else {
                // After successful refresh, make sure all the paths are removed from folderHasDeletedContent
                // This ensures the refresh buttons don't stay visible on restored folders
                for (const path of [...this.fileManager.folderHasDeletedContent]) {
                    if (path === folderPath || path.startsWith(folderPath + '/')) {
                        this.fileManager.folderHasDeletedContent.delete(path);
                    }
                }
                
                // Ensure the folder is in expanded state to show restored content
                const expandedFolders = new Set(this.state.expandedFolders);
                expandedFolders.add(folderPath);
                this.setState({ expandedFolders });
                this.saveExpandedFolders();
                
                // Force a complete re-render to update all refresh buttons and attach event handlers
                this.render();
            }
        } catch (error) {
            console.error(`Error during folder refresh for ${folderPath}:`, error);
            this.showError(`Error refreshing folder: ${error.message}`);
        }
    }
    
    // Utility to show error messages (if you have a notification system)
    showError(message) {
        console.error("FileList Error:", message);
        // Replace with your actual notification/alert mechanism
        // alert(message); 
    }

    /**
     * Check if a folder or any of its subfolders has deleted content
     * @param {string} folderPath - Path of the folder to check
     * @returns {boolean} - True if this folder or any subfolders have deleted content
     */
    folderOrChildrenHaveDeletedContent(folderPath) {
        // Check if this folder has deleted content
        if (this.fileManager.folderHasDeletedContent.has(folderPath)) {
            console.log(`Folder ${folderPath} has deleted content`);
            return true;
        }
        
        // Check all tracked folders that are subfolders of this folder
        for (const path of this.fileManager.folderHasDeletedContent) {
            if (path.startsWith(folderPath + '/')) {
                console.log(`Subfolder ${path} of ${folderPath} has deleted content`);
                return true;
            }
        }
        
        console.log(`Folder ${folderPath} does NOT have deleted content`);
        return false;
    }
}

FileList; 

// File: components/Header.js
// import from ./BaseComponent

/**
 * Header component for the application
 */
class Header extends BaseComponent {
    constructor(container) {
        super(container);
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="header">
                <h1>FileToMarkdown Viewer</h1>
            </div>
        `;
    }
}

Header; 

// File: components/Editor.js
// import from ./BaseComponent

/**
 * Editor component for editing markdown files
 */
class Editor extends BaseComponent {
    constructor(container, options = {}) {
        super(container);
        this.options = options;
        this.content = '';
        this.render();
    }

    setContent(content) {
        this.content = content;
        if (this.textarea) {
            this.textarea.value = content;
        }
    }

    getContent() {
        return this.textarea ? this.textarea.value : this.content;
    }

    render() {
        this.container.innerHTML = '';
        
        this.textarea = document.createElement('textarea');
        this.textarea.className = 'markdown-editor';
        this.textarea.value = this.content;
        
        if (this.options.autoFocus) {
            this.textarea.focus();
        }
        
        this.container.appendChild(this.textarea);
    }
}

Editor; 

// File: components/Preview.js
// import from ./BaseComponent

/**
 * Preview component for rendering markdown content
 */
class Preview extends BaseComponent {
    constructor(container, renderer) {
        super(container);
        this.renderer = renderer;
        this.content = '';
        this.render();
    }

    setContent(content) {
        this.content = content;
        this.render();
    }

    render() {
        if (!this.renderer) {
            console.error('No renderer provided to Preview component');
            this.container.innerHTML = '<div class="error">No renderer available</div>';
            return;
        }
        
        try {
            const html = this.renderer.render(this.content || '');
            this.container.innerHTML = html;
            
            // Apply syntax highlighting if the renderer supports it
            if (typeof this.renderer.highlightAll === 'function') {
                this.renderer.highlightAll();
            }
            
            // Setup link handlers if needed
            this.setupLinkHandlers();
        } catch (error) {
            console.error('Error rendering markdown:', error);
            this.container.innerHTML = `<div class="error">Error rendering content: ${error.message}</div>`;
        }
    }
    
    setupLinkHandlers() {
        // This could be overridden or extended with specific link handling logic
        this.container.querySelectorAll('a').forEach(link => {
            // Set target="_blank" for external links
            if (link.getAttribute('href')?.startsWith('http')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }
}

Preview; 

// File: app.js
// import from ./utils/fileManager
// import from ./utils/renderer
// import from ./components/FileList
// import from ./components/Header
// import from ./components/Editor
// import from ./components/Preview
// import from ./utils/domUtils
// import from ./utils/stateManager

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
        
        // Initialize the StateManager
        this.stateManager = new StateManager(this.fileManager);
        
        // Initialize sidebar-hidden class on body based on initial sidebar state
        document.body.classList.toggle('sidebar-hidden', this.elements.sidebar.classList.contains('hidden'));
        
        // Ensure buttons are properly hidden/shown based on file selection state
        this.updateButtonPositions();
        this.updateWelcomeScreen();
        
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
            welcomeScreen: document.getElementById('welcome-screen'),
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
            contentWrapper: null, // Added for the new content wrapper
            cidronSaveButton: document.getElementById('btn-save'), // Save button in cidron-box
            cidronLoadButton: document.getElementById('btn-load')  // Load button in cidron-box
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
                display: 'none', // Initially hidden but will be shown when a file is loaded
                gap: '10px',
                zIndex: '1001',
                visibility: 'visible' // Ensure it's visible when display is set
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
                    // console.log('Reloading current file due to external change');
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
            if (!currentFile) return;
            
            try {
                // Check if we have a valid file handle
                const fileHandle = currentFile.file?.handle || currentFile.handle;
                if (!fileHandle || typeof fileHandle.getFile !== 'function') {
                    // Skip monitoring for files without valid handles
                    return;
                }
                
                // Get latest file version from disk
                const file = await fileHandle.getFile();
                
                // Read file content
                const newContent = await file.text();
                
                // Only update if content has changed
                if (newContent !== currentFile.content) {
                    // console.log('File changed externally:', currentFile.path);
                    
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

        // Add a listener for fileListChanged event to update welcome screen
        window.addEventListener('fileListChanged', () => {
            this.updateWelcomeScreen();
        });
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
        directoryInput.accept = '.md,.markdown,.mdown';

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
                            // console.log(`File ${file.name} has webkitRelativePath: ${file.webkitRelativePath}`)
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
        // console.log('Handling files:', files.length);
        
        // Update the UI to show loading state
        this.elements.dropZone.innerHTML = '<p>Processing files...</p>';
        
        // Process the files with the file manager
        const processed = await this.fileManager.handleFileUpload(files);
        
        if (processed) {
            // console.log('Files processed successfully, loading first file');
            
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
        // console.warn(message);
        
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
        // console.error(message);
        
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

        // Log file loading for debugging
        console.log(`Loading file: ${fileInfo.path}, has content: ${!!fileInfo.content}, has file object: ${!!fileInfo.file}, content type: ${typeof fileInfo.content}`);

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

        // Show the content container and hide welcome screen
        this.updateWelcomeScreen();

        // DIRECTLY show content if it's already available as a string - this is the most reliable method
        if (fileInfo.content && typeof fileInfo.content === 'string') {
            console.log(`Displaying cached content string (${fileInfo.content.length} chars)`);
            this.displayFileContent(fileInfo.content);
            return;
        }
        
        // If we don't have a string content but have content of another type
        if (fileInfo.content && typeof fileInfo.content !== 'string') {
            console.log(`Have content but it's not a string, type: ${typeof fileInfo.content}`);
            try {
                // Try to convert the content to a string
                if (fileInfo.content instanceof Blob) {
                    console.log('Content is a Blob, reading...');
                    const reader = new FileReader();
                    reader.onload = e => {
                        const content = e.target.result;
                        // Store string content for future use
                        fileInfo.content = content;
                        this.displayFileContent(content);
                    };
                    reader.onerror = e => {
                        console.error('FileReader error:', e);
                        this.showFallbackContent(fileInfo);
                    };
                    reader.readAsText(fileInfo.content);
                    return;
                } else {
                    // Try to stringify the content
                    const stringContent = String(fileInfo.content);
                    fileInfo.content = stringContent; // Update for future use
                    this.displayFileContent(stringContent);
                    return;
                }
            } catch (error) {
                console.error('Error converting content to string:', error);
                this.showFallbackContent(fileInfo);
                return;
            }
        }
        
        // If we don't have content but have a file object, read it
        if (fileInfo.file) {
            try {
                // Check if fileInfo.file is a valid Blob object
                if (fileInfo.file instanceof Blob) {
                    console.log('Reading content from Blob object');
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
                        this.showFallbackContent(fileInfo);
                    };
                    reader.readAsText(fileInfo.file);
                } else if (typeof fileInfo.file === 'string') {
                    // If file is a string, use it directly
                    console.log('Using string content from file property');
                    fileInfo.content = fileInfo.file; // Store for future use
                    this.displayFileContent(fileInfo.file);
                } else if (fileInfo.file && typeof fileInfo.file.toString === 'function') {
                    // Try to convert to string if possible
                    try {
                        console.log('Converting file object to string');
                        // Only use toString if it's a primitive value or a simple object
                        // Avoid calling toString on complex objects that would just return "[object Object]"
                        let content;
                        if (Object.prototype.toString.call(fileInfo.file) === '[object Object]') {
                            // Show fallback content instead of [object Object]
                            this.showFallbackContent(fileInfo);
                            return;
                        } else {
                            content = fileInfo.file.toString();
                        }
                        fileInfo.content = content;
                        this.displayFileContent(content);
                    } catch (e) {
                        // Fall back to empty content if toString fails
                        console.error('Error calling toString():', e);
                        this.showFallbackContent(fileInfo);
                    }
                } else {
                    // No valid content source
                    this.showFallbackContent(fileInfo);
                }
            } catch (error) {
                console.error('Error processing file:', error);
                this.showFallbackContent(fileInfo);
            }
        } else {
            // No file property at all
            this.showFallbackContent(fileInfo);
        }
    }
    
    displayFileContent(content) {
        if (!content) {
            console.error('Cannot display empty content');
            // Create a placeholder message instead of showing nothing
            content = '# No Content Available\n\nThis file appears to be empty or could not be loaded properly.';
        }
        
        console.log(`Displaying content (type: ${typeof content}, length: ${content.length})`);
        this.originalContent = content;
        
        // Ensure content is a string
        if (typeof content !== 'string') {
            try {
                if (content instanceof Blob) {
                    // Handle Blob objects
                    const reader = new FileReader();
                    reader.onload = () => {
                        this.displayFileContent(reader.result);
                    };
                    reader.readAsText(content);
                    return;
                } else {
                    // Try to convert to string
                    content = String(content);
                }
            } catch (error) {
                console.error('Error converting content to string:', error);
                content = '# Error Displaying Content\n\nThe content could not be displayed properly.';
            }
        }
        
        if (this.isEditorMode) {
            // In editor mode, set the textarea value
            this.elements.editor.value = content;
        } else {
            // In view mode, render markdown to HTML
            try {
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
            } catch (error) {
                console.error('Error rendering markdown:', error);
                // Display error message in content area
                if (this.elements.contentWrapper) {
                    this.elements.contentWrapper.innerHTML = `
                    <div class="error-message" style="padding: 20px; color: #e53e3e;">
                        <h2>Error Rendering Content</h2>
                        <p>${error.message || 'Unknown error'}</p>
                        <pre>${content.substring(0, 100)}${content.length > 100 ? '...' : ''}</pre>
                    </div>`;
                    this.elements.contentWrapper.style.display = 'block';
                }
            }
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
            // console.error('Missing button elements');
            return;
        }
        
        // Set base visibility based on whether a file is selected
        const hasSelectedFile = this.fileManager.currentFileIndex !== undefined && this.fileManager.currentFileIndex >= 0;
        
        // Only show buttons if a file is selected
        if (hasSelectedFile) {
            // Show container
            buttonsContainer.style.display = 'flex';
            buttonsContainer.style.visibility = 'visible';
            
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
                    // console.error('File not found:', resolvedPath);
                }
            };
        });
    }

    toggleEditor() {
        this.isEditorMode = !this.isEditorMode;
        
        // Ensure we have valid references to our UI elements
        if (!this.elements.buttonContainer || !this.elements.saveButton || !this.elements.editButton) {
            // console.error('Missing UI elements for editor mode');
            return;
        }
        
        if (this.isEditorMode) {
            // Add edit-mode class to body for styling
            document.body.classList.add('edit-mode');
            
            // Create a wrapper div for the editor that matches content-container positioning
            const editorWrapper = document.createElement('div');
            editorWrapper.className = 'editor-wrapper';
            
            // Get the dimensions and position of the content container
            const contentContainer = this.elements.content;
            const containerRect = contentContainer.getBoundingClientRect();
            const containerStyle = window.getComputedStyle(contentContainer);
            
            // Apply the exact dimensions and position
            editorWrapper.style.width = containerRect.width + 'px';
            editorWrapper.style.height = containerRect.height + 'px';
            editorWrapper.style.left = (containerRect.left - this.elements.main.getBoundingClientRect().left) + 'px';
            editorWrapper.style.top = (containerRect.top - this.elements.main.getBoundingClientRect().top) + 'px';
            
            // Move the editor out of its current parent
            if (this.elements.editor.parentNode) {
                this.elements.editor.parentNode.removeChild(this.elements.editor);
            }
            
            // Set the editor to be visible
            this.elements.editor.style.display = 'block';
            
            // Set editor content
            this.elements.editor.value = this.originalContent;
            
            // Add editor to the wrapper
            editorWrapper.appendChild(this.elements.editor);
            
            // Add the wrapper to the main content at the same position as content container
            this.elements.main.appendChild(editorWrapper);
            
            // Hide the content container but keep its space in the layout
            this.elements.content.style.visibility = 'hidden';
            
            // Make sure buttons are visible
            this.elements.buttonContainer.style.display = 'flex';
            
        } else {
            // Remove edit-mode class
            document.body.classList.remove('edit-mode');
            
            // Remove editor wrapper if it exists
            const editorWrapper = document.querySelector('.editor-wrapper');
            if (editorWrapper) {
                // Move editor back to main content
                if (this.elements.editor.parentNode === editorWrapper) {
                    editorWrapper.removeChild(this.elements.editor);
                    this.elements.main.appendChild(this.elements.editor);
                }
                
                // Remove the wrapper
                if (editorWrapper.parentNode) {
                    editorWrapper.parentNode.removeChild(editorWrapper);
                }
            }
            
            // Hide editor
            this.elements.editor.style.display = 'none';
            
            // Show content container
            this.elements.content.style.visibility = 'visible';
            this.elements.contentWrapper.style.display = 'block';
            
            // Update content
            this.elements.contentWrapper.innerHTML = this.renderer.render(this.elements.editor.value);
            this.renderer.highlightAll();
            this.setupLinkHandlers();
        }
        
        // Update button positions/state
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
            // console.error('Error in saveFile:', error);
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
                        // console.warn('Could not get file system handle:', error);
                        // Continue to try other items
                    }
                }
            }
            
            // If we reach here, no directory was found
            this.showWarning('Please drop a folder containing markdown files.');
            this.updateDropzoneUI();
        } catch (error) {
            // console.error('Error processing dropped items:', error);
            this.showError('Error processing dropped items: ' + error.message);
            this.updateDropzoneUI();
        }
    }

    // Single consolidated method to process a directory
    async processDirectory(dirHandle) {
        if (!dirHandle) return;
        
        // console.log(`Processing directory: ${dirHandle.name}`);
        const files = [];
        let processedCount = 0;

        // Function to update progress message
        const updateProgress = (count) => {
            this.elements.dropZone.innerHTML = `<p>Processing files... (${count} found)</p>`;
        };

        // Start recursive processing
        await this.processDirectoryRecursively(dirHandle, dirHandle.name, files, processedCount, updateProgress, ['.md', '.txt'], 0);
        
        // Add the directory handle to the file manager for monitoring
        this.fileManager.addDirectoryHandle(dirHandle.name, dirHandle);
        
        // console.log(`Finished processing directory: ${dirHandle.name}`);
        this.showSuccess(`Processed all files in ${dirHandle.name}`);
        
        // Process the extracted files
        if (files.length > 0) {
            await this.fileManager.processFiles(files);
            
            // Setup file system monitoring after processing files
            await this.setupFileSystemMonitoring();
        }
        
        // Reset the dropzone UI to its initial state
        this.updateDropzoneUI();
    }

    // Recursively process directory contents
    async processDirectoryRecursively(handle, parentPath, files, processedCount, updateProgress, markdownExtensions, depth = 0) {
        if (depth > 10) { // Limit recursion depth
            // console.warn('Maximum recursion depth reached for path:', parentPath);
            return processedCount;
        }

        try {
            // console.log(`Processing entries in: ${parentPath}`);
            
            // Iterate through directory entries
            for await (const entry of handle.values()) {
                // Skip hidden files/folders (like .git)
                if (entry.name.startsWith('.')) {
                    // console.log(`Skipping hidden entry: ${entry.name}`);
                    continue;
                }

                const currentPath = `${parentPath}/${entry.name}`;
                
                if (entry.kind === 'file') {
                    // Check if file type is supported
                    if (markdownExtensions.some(ext => entry.name.toLowerCase().endsWith(ext))) {
                        try {
                            const file = await entry.getFile();
                            // Add FileSystem API handle and relative path to file object
                            file.handle = entry;
                            file.relativePath = currentPath; // Store the full path relative to the root directory
                            file.parentFolder = parentPath; // Store parent folder path
                            
                            // console.log(`Found file: ${currentPath}`);
                            files.push(file);
                            
                            // Update progress count
                            processedCount++;
                            updateProgress(processedCount);
                        } catch (error) {
                            // console.error(`Error getting file handle for ${entry.name}:`, error);
                        }
                    } else {
                        // console.log(`Skipping non-markdown file: ${entry.name}`);
                    }
                } else if (entry.kind === 'directory') {
                    // console.log(`Found directory: ${currentPath}`);
                    // Recursively process subdirectory
                    processedCount = await this.processDirectoryRecursively(entry, currentPath, files, processedCount, updateProgress, markdownExtensions, depth + 1);
                }
            }
            
            // console.log(`Finished processing entries in: ${parentPath}`);
            return processedCount;
        } catch (error) {
            // console.error(`Error processing directory ${parentPath}:`, error);
            this.showError(`Error processing directory ${parentPath}: ${error.message}`);
            return processedCount;
        }
    }

    /**
     * Set up monitoring for file system changes
     */
    async setupFileSystemMonitoring() {
        if (!this.fileManager || !this.fileManager.directoryHandles || this.fileManager.directoryHandles.size === 0) {
            // console.log('No directory handles to monitor');
            return;
        }

        // Stop any existing monitoring
        this.stopFileSystemMonitoring();

        // Create a flag to track if monitoring is active
        this._monitoringActive = true;
        
        // console.log(`Setting up file system monitoring for ${this.fileManager.directoryHandles.size} directories`);
        
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
                // console.error(`Error setting up monitoring for ${path}:`, error);
            }
        }
    }

    // Monitor a specific directory for changes using polling
    async monitorDirectory(path, handle) {
        // console.log(`Starting monitoring for directory: ${path}`);
        
        // Define the polling function
        const poll = async () => {
            // console.log(`Polling directory: ${path}`);
            if (!this._monitoringActive) {
                // console.log(`Monitoring stopped for ${path}. Exiting poll.`);
                return; // Stop polling if monitoring is deactivated
            }

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
                            // console.log(`New entry detected: ${name} (${entry.kind})`);
                            hasChanges = true;
                        }
                    }
                    
                    // Check for deleted entries
                    for (const [name, entry] of previousSnapshot.entries()) {
                        if (!currentEntries.has(name)) {
                            // console.log(`Entry deleted: ${name} (${entry.kind})`);
                            hasChanges = true;
                        }
                    }
                    
                    // If changes detected, refresh the file structure
                    if (hasChanges) {
                        // console.log(`Changes detected in ${path}, refreshing file structure`);
                        await this.refreshFilesFromWatchedDirectories();
                    }
                }

                // Store current state for next comparison
                this._directoryStates.set(path, currentEntries);

            } catch (error) {
                // console.error(`Error polling directory ${path}:`, error);
            }

            // Schedule the next poll if still active
            if (this._monitoringActive) {
                const watcherId = setTimeout(poll, 5000); // Poll every 5 seconds
                this._fileSystemWatchers.push(watcherId);
            }
        };

        // Initial poll after a short delay
        const watcherId = setTimeout(poll, 1000);
        this._fileSystemWatchers.push(watcherId);
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
        
        // console.log('File system monitoring stopped');
    }

    /**
     * Refresh files from watched directories when changes are detected
     */
    async refreshFilesFromWatchedDirectories() {
        // console.log('Refreshing files from watched directories');
        
        try {
            // First, remember which file was active
            const currentFilePath = this.fileManager.getCurrentFile()?.path;
            
            // Get all directory handles
            const handles = this.fileManager.getDirectoryHandles();
            if (handles.size === 0) {
                // console.log('No directory handles to refresh');
                return;
            }
            
            // Process the root directory handle (first one added)
            const rootDirEntry = handles.entries().next().value;
            if (!rootDirEntry) {
                // console.log('No root directory handle found');
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
            // console.error('Error refreshing file list:', error);
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
        
        // console.log('Setting up initial events including dropzone click handler');
        
        // Setup file drop zone with a single, clear approach
        // First remove any existing click handlers just to be safe
        const dropZone = this.elements.dropZone;
        const newDropZone = dropZone.cloneNode(true);
        dropZone.parentNode.replaceChild(newDropZone, dropZone);
        this.elements.dropZone = newDropZone;
        
        // Now add the click handler
        this.elements.dropZone.addEventListener('click', (e) => {
            // console.log('Dropzone clicked, opening directory picker');
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
            // console.log('Directory picker already active (global flag), ignoring request');
            return;
        }
        
        // Instance flag check
        if (this.isPickerActive) {
            // console.log('Directory picker already active (instance flag), ignoring request');
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
                this.updateDropzoneUI(); // Restore the original button state after cancellation
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
            
            // Process the selected directory
            await this.processDirectory(dirHandle);
        } catch (error) {
            // Handle errors (e.g., user cancellation)
            if (error.name === 'AbortError') {
                // console.log('Directory picker was cancelled by the user.');
                this.updateDropzoneUI(); // Restore the original button state after cancellation
            } else {
                // console.error('Error opening directory picker:', error);
                this.showError(`Error opening directory picker: ${error.message}`);
                this.updateDropzoneUI(); // Also restore the UI for other errors
            }
        } finally {
            // console.log('Directory picker finished');
            this.isPickerActive = false; // Reset instance flag
            window._directoryPickerActive = false; // Reset global flag
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
            // console.warn('App already initialized, skipping initialization');
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
        // console.log('FileToMarkdown Viewer initialized');
    }

    /**
     * Show a success notification
     * @param {string} message 
     */
    showSuccess(message) {
        // console.log(message);
        
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

    /**
     * Update welcome screen visibility based on file state
     */
    updateWelcomeScreen() {
        const hasFiles = this.fileManager.files && this.fileManager.files.length > 0;
        
        if (hasFiles) {
            // Hide welcome screen, show content
            if (this.elements.welcomeScreen) this.elements.welcomeScreen.style.display = 'none';
            if (this.elements.content) this.elements.content.style.display = 'block';
        } else {
            // Show welcome screen, hide content
            if (this.elements.welcomeScreen) this.elements.welcomeScreen.style.display = 'flex';
            if (this.elements.content) this.elements.content.style.display = 'none';
        }
    }

    // Helper method to show fallback content for files that can't be loaded
    showFallbackContent(fileInfo) {
        console.log(`Showing fallback content for ${fileInfo.path}`);
        const placeholderContent = `# ${fileInfo.name}\n\nThis file was restored but its content could not be loaded. You can edit it and save to replace the missing content.`;
        fileInfo.content = placeholderContent; // Save for future use
        this.displayFileContent(placeholderContent);
    }
}

// Create and initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // console.log('Initializing FileToMarkdown Viewer...');
    
    // Create app instance
    const app = new FileToMarkdownViewer();
    
    // Expose app and fileManager to window for debugging and manual operations
    window.app = app;
    window.fileManager = app.fileManager;
    
    // Log initialization status
    // console.log('FileToMarkdown Viewer initialized');
    // console.log('FileManager instance available at window.fileManager');
    
    // Dispatch a custom event to notify that the app is ready
    window.dispatchEvent(new CustomEvent('appInitialized', {
        detail: { fileManager: app.fileManager }
    }));
});

FileToMarkdownViewer; 


// Export all modules for global use
window.FileManager = typeof FileManager !== 'undefined' ? FileManager : null;
window.FileList = typeof FileList !== 'undefined' ? FileList : null;
window.EventEmitter = typeof EventEmitter !== 'undefined' ? EventEmitter : null;
window.BrowserRenderer = typeof BrowserRenderer !== 'undefined' ? BrowserRenderer : null;
window.createElementWithAttributes = typeof createElementWithAttributes !== 'undefined' ? createElementWithAttributes : null;
window.FileToMarkdownViewer = typeof FileToMarkdownViewer !== 'undefined' ? FileToMarkdownViewer : null;

// Comment out the duplicate initialization that was causing double event handlers
/* 
// Initialize the application - this initializes the global app instance
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app from bundle');
    if (typeof FileToMarkdownViewer === 'undefined') {
        console.error('FileToMarkdownViewer class not found in bundle!');
    } else {
        window.app = new FileToMarkdownViewer();
    }
});
*/
