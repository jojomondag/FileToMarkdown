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
            // Don't show errors for user canceling the dialog
            if (error.name === 'AbortError') {
                console.log('User canceled file selection dialog');
                return false;
            }
            
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
                        throw new Error('Permission to write to file was denied');
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
                // For paths without a handle, create a workspace-relative path
                let savePath = fileInfo.path;
                
                // If we're using a path from a folder structure, get the full path
                if (fileInfo.folder && fileInfo.name) {
                    const workspace = window.location.pathname.endsWith('/') 
                        ? window.location.pathname.slice(0, -1) 
                        : window.location.pathname;
                    
                    savePath = `${workspace}/${fileInfo.folder}/${fileInfo.name}`;
                    console.log(`Using workspace-relative path: ${savePath}`);
                }
                
                // Use the server API to save the file
                const response = await fetch('/api/file', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        path: savePath,
                        content
                    })
                });
                
                const responseData = await response.json();
                
                if (!response.ok) {
                    throw new Error(responseData.error || `Server returned ${response.status} ${response.statusText}`);
                }
                
                console.log('File saved successfully using server API');
                return true;
            }
        } catch (error) {
            console.error('Error saving file:', error);
            
            // Display an error notification
            const errorEvent = new CustomEvent('fileError', {
                detail: {
                    message: `Failed to save file: ${error.message}`,
                    path: fileInfo.path
                }
            });
            window.dispatchEvent(errorEvent);
            
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
        // Keep a backup of the old structure for comparison
        const previousStructure = new Map(this.folderStructure);
        
        // Clear the current structure
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
                    // Create new folder entry
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
        
        // Log structure changes for debugging
        const oldFolders = Array.from(previousStructure.keys());
        const newFolders = Array.from(this.folderStructure.keys());
        
        const added = newFolders.filter(f => !previousStructure.has(f));
        const removed = oldFolders.filter(f => !this.folderStructure.has(f));
        
        if (added.length > 0 || removed.length > 0) {
            console.log(`Folder structure changed: +${added.length} -${removed.length} folders`);
        }
        
        // Check for lost files and add them to the root if needed
        this.ensureAllFilesAreAccessible();
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
            // Don't show errors for user canceling the dialog
            if (error.name === 'AbortError') {
                console.log('User canceled directory selection dialog');
                return false;
            }
            
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
        // Normalize path for consistency
        path = this.normalizePath(path);
        
        console.log(`Adding directory handle for: ${path}`);
        this.directoryHandles.set(path, handle);
        
        // Log number of directories being monitored
        console.log(`Now monitoring ${this.directoryHandles.size} directories`);
    }

    // Remove a directory handle
    removeDirectoryHandle(path) {
        this.directoryHandles.delete(path);
    }

    // Remove files by path with improved safety
    removeFiles(filePaths) {
        if (!filePaths || filePaths.length === 0) return false;
        
        // Safety check - don't remove too many files at once
        const maxFilesToRemove = Math.max(5, Math.floor(this.files.length * 0.2));
        if (filePaths.length > maxFilesToRemove) {
            console.warn(`Attempted to remove ${filePaths.length} files at once, exceeding safety threshold of ${maxFilesToRemove}`);
            return false;
        }
        
        console.log(`FileManager: Removing ${filePaths.length} files`);
        
        // Keep track of removed indices to adjust the currentFileIndex later
        const removedIndices = [];
        let currentFileRemoved = false;
        
        // First, find all the file indices to remove
        filePaths.forEach(path => {
            const fileIndex = this.findFileByPath(path);
            if (fileIndex !== undefined) {
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
        
        return path;
    }

    /**
     * Get all directory handles (for debugging)
     */
    getMonitoredDirectories() {
        return Array.from(this.directoryHandles.keys());
    }
}

export default FileManager; 