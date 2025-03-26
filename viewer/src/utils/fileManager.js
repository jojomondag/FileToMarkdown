import { FILE_EXTENSIONS } from './constants';

class FileManager {
    constructor() {
        this.files = [];
        this.fileMap = new Map();
        this.folderStructure = new Map();
        this.currentFileIndex = -1;
    }

    // Clear all loaded files and folder structure
    clearFiles() {
        this.files = [];
        this.fileMap.clear();
        this.folderStructure.clear();
        this.currentFileIndex = -1;
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
                depth: 0
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

    // Notify listeners that the file list has changed
    notifyFileListChanged() {
        // Dispatch a custom event
        window.dispatchEvent(new CustomEvent('fileListChanged'));
    }

    // Save the current file
    async saveCurrentFile(content) {
        if (this.currentFileIndex < 0) return { success: false, message: 'No file selected' };
        
        const fileInfo = this.files[this.currentFileIndex];
        if (!fileInfo) return { success: false, message: 'File not found' };
        
        fileInfo.content = content;
        return { success: true };
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
        return this.fileMap.get(path.toLowerCase());
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
}

export default FileManager; 