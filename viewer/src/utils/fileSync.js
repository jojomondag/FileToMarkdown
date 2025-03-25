/**
 * Utility class for syncing files between the browser and the local file system
 */
class FileSync {
    constructor() {
        // No-op constructor
        console.log('FileSync disabled - running in static mode');
    }

    /**
     * Initialize the WebSocket connection - disabled for simple HTTP server
     */
    connect() {
        // No-op
        return;
    }

    /**
     * Watch a file for changes - no-op in HTTP mode
     */
    watchFile() {
        // No-op
        return;
    }

    /**
     * Stop watching a file - no-op in HTTP mode
     */
    unwatchFile() {
        // No-op
        return;
    }

    /**
     * Send a message to watch file paths - no-op in HTTP mode
     */
    sendWatchMessage() {
        // No-op
        return;
    }

    /**
     * Save content to a file
     * @returns {Promise<boolean>} - Always returns false in HTTP mode
     */
    async saveFile() {
        console.log('File saving not supported in static mode');
        return false;
    }

    /**
     * Load content from a file
     * @returns {Promise<string|null>} - Always returns null in HTTP mode
     */
    async loadFile() {
        console.log('File loading not supported in static mode');
        return null;
    }
}

export default FileSync; 