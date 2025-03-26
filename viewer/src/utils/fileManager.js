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

export default FileManager; 