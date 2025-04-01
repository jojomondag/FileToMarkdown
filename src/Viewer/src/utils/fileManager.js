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
}

export default FileManager; 