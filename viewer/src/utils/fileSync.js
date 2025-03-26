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
        this.db = null;
        
        if (!this.supportsFileSystem) {
            console.warn('FileSync: File System Access API not supported in this browser');
        } else {
            console.log('FileSync: File System Access API available');
            this.initDb();
        }
    }

    /**
     * Initialize IndexedDB for storing file handles
     */
    async initDb() {
        try {
            // Check if database is already initialized
            if (this.db) {
                return this.db;
            }
            
            console.log('Initializing IndexedDB for file handle storage...');
            
            // Open (or create) the database
            const openRequest = indexedDB.open('FileToMarkdownDB', 1);
            
            // Create object store if needed
            openRequest.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create the fileHandles object store if it doesn't exist
                if (!db.objectStoreNames.contains('fileHandles')) {
                    db.createObjectStore('fileHandles');
                    console.log('Created fileHandles object store');
                }
            };
            
            // Handle success
            this.db = await new Promise((resolve, reject) => {
                openRequest.onsuccess = () => {
                    console.log('IndexedDB opened successfully');
                    resolve(openRequest.result);
                };
                openRequest.onerror = () => {
                    console.error('Failed to open IndexedDB:', openRequest.error);
                    reject(openRequest.error);
                };
            });
            
            console.log('IndexedDB initialized for file handle storage');
            return this.db;
        } catch (error) {
            console.error('Error initializing IndexedDB:', error);
            this.db = null;
            throw error;
        }
    }
    
    /**
     * Ensure the database is initialized
     * @returns {Promise<IDBDatabase>} - The initialized database
     */
    async ensureDbInitialized() {
        if (!this.db) {
            return await this.initDb();
        }
        return this.db;
    }
    
    /**
     * Store a file handle in IndexedDB
     * @param {string} id - Unique ID for the file handle
     * @param {FileSystemFileHandle} handle - The file handle to store
     * @returns {Promise<boolean>} - Whether the operation was successful
     */
    async storeFileHandle(id, handle) {
        try {
            const db = await this.ensureDbInitialized();
            
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(['fileHandles'], 'readwrite');
                const store = transaction.objectStore('fileHandles');
                
                const request = store.put(handle, id);
                
                request.onsuccess = () => {
                    console.log(`File handle stored with ID: ${id}`);
                    resolve(true);
                };
                request.onerror = () => {
                    console.error('Error storing file handle:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Failed to store file handle:', error);
            return false;
        }
    }
    
    /**
     * Retrieve a file handle from IndexedDB
     * @param {string} id - The ID of the file handle to retrieve
     * @returns {Promise<FileSystemFileHandle|null>} - The retrieved file handle or null
     */
    async retrieveFileHandle(id) {
        try {
            const db = await this.ensureDbInitialized();
            
            return new Promise((resolve, reject) => {
                const transaction = db.transaction(['fileHandles'], 'readonly');
                const store = transaction.objectStore('fileHandles');
                
                const request = store.get(id);
                
                request.onsuccess = () => {
                    if (request.result) {
                        console.log(`File handle retrieved with ID: ${id}`);
                    } else {
                        console.warn(`No file handle found with ID: ${id}`);
                    }
                    resolve(request.result || null);
                };
                request.onerror = () => {
                    console.error('Error retrieving file handle:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Failed to retrieve file handle:', error);
            return null;
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

export default FileSync; 