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

export default FileSync; 