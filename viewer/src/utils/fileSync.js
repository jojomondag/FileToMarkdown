/**
 * Utility class for handling file operations
 */
class FileSync {
    constructor() {
        this.supportsFileSystem = 'showOpenFilePicker' in window;
        this.fileTypes = [{ 
            description: 'Text Files', 
            accept: { 'text/plain': ['.txt', '.md'] } 
        }];
    }

    /**
     * Save content to a file using File System Access API
     * @param {string} filePath - The path to the file
     * @param {string} content - The content to save
     * @returns {Promise<boolean>} - Whether the save was successful
     */
    async saveFile(filePath, content) {
        if (!this.supportsFileSystem) return false;
        
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: filePath.split('/').pop(),
                types: this.fileTypes
            });
            
            const writable = await handle.createWritable();
            await writable.write(content);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Load content from a file using File System Access API
     * @param {string} filePath - The path to the file
     * @returns {Promise<string|null>} - The file content or null if failed
     */
    async loadFile() {
        if (!this.supportsFileSystem) return null;
        
        try {
            const [handle] = await window.showOpenFilePicker({ types: this.fileTypes });
            return await (await handle.getFile()).text();
        } catch {
            return null;
        }
    }

    /**
     * Open multiple files using File System Access API
     * @param {Object} options - Options for file picking
     * @returns {Promise<File[]>} - Array of selected files
     */
    async openFiles() {
        if (!this.supportsFileSystem) return [];
        
        try {
            const handles = await window.showOpenFilePicker({
                multiple: true,
                types: this.fileTypes
            });
            
            return await Promise.all(handles.map(handle => handle.getFile()));
        } catch {
            return [];
        }
    }
}

export default FileSync; 