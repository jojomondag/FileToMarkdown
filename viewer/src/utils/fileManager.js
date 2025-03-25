import { FILE_EXTENSIONS } from './constants';
import FileSync from './fileSync';

class FileManager {
    constructor() {
        this.files = [];
        this.fileMap = new Map();
        this.folderStructure = new Map();
        this.currentFileIndex = -1;
        this.rootFolder = null;
        this.fileSync = new FileSync();
        this.fileSync.connect();
        this.syncedFiles = new Map(); // Map of file paths to their real paths
    }

    // Clear all loaded files and folder structure
    clearFiles() {
        this.files = [];
        this.fileMap.clear();
        this.folderStructure.clear();
        this.currentFileIndex = -1;
        this.rootFolder = null;
        this.syncedFiles.clear();
    }

    processFiles(fileList) {
        const markdownFiles = [];
        this.folderStructure.clear();
        
        for (const file of fileList) {
            if (file.webkitRelativePath) {
                this.rootFolder = file.webkitRelativePath.split('/')[0];
                break;
            }
        }
        
        for (const file of fileList) {
            if (file.name.toLowerCase().endsWith(FILE_EXTENSIONS.MARKDOWN)) {
                let relativePath = file.webkitRelativePath || file.name;
                const pathParts = relativePath.split('/');
                const fileInfo = {
                    file: file,
                    path: relativePath,
                    name: pathParts[pathParts.length - 1],
                    folder: pathParts.slice(0, -1).join('/'),
                    depth: pathParts.length - 1,
                    isRoot: pathParts.length === 1,
                    realPath: file.path || null // Store the real file path if available
                };
                
                // Store real path mapping if available
                if (fileInfo.realPath) {
                    this.syncedFiles.set(relativePath, fileInfo.realPath);
                }

                let currentPath = '';
                pathParts.slice(0, -1).forEach((part, index) => {
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
                    
                    if (parentPath) {
                        this.folderStructure.get(parentPath).children.add(currentPath);
                    }
                });

                if (fileInfo.folder) {
                    this.folderStructure.get(fileInfo.folder).files.add(relativePath);
                }

                markdownFiles.push(fileInfo);
            }
        }

        if (markdownFiles.length) {
            this.files = markdownFiles;
            this.updateFileMap();
            return true;
        }
        return false;
    }

    // New method to process files from the file system
    async processFileSystem(filePaths) {
        const markdownFiles = [];
        this.folderStructure.clear();
        this.syncedFiles.clear();
        
        for (const filePath of filePaths) {
            if (filePath.toLowerCase().endsWith(FILE_EXTENSIONS.MARKDOWN)) {
                try {
                    // Get the content through the server
                    const content = await this.fileSync.loadFile(filePath);
                    if (content === null) continue;
                    
                    // Create a synthetic file object
                    const fileName = filePath.split(/[\/\\]/).pop();
                    const file = new File([content], fileName, { type: 'text/markdown' });
                    
                    // Create the file info
                    const fileInfo = {
                        file: file,
                        path: fileName, // Use just the filename as the path internally
                        name: fileName,
                        folder: '',
                        depth: 0,
                        isRoot: true,
                        realPath: filePath // Store the real file path
                    };
                    
                    // Map the synthetic path to the real path
                    this.syncedFiles.set(fileName, filePath);
                    
                    markdownFiles.push(fileInfo);
                } catch (error) {
                    console.error(`Error processing file ${filePath}:`, error);
                }
            }
        }
        
        if (markdownFiles.length) {
            this.files = markdownFiles;
            this.updateFileMap();
            this.setupFileWatchers();
            return true;
        }
        return false;
    }
    
    // Set up watchers for synced files
    setupFileWatchers() {
        // Clear any existing watches
        this.syncedFiles.forEach((realPath) => {
            this.fileSync.unwatchFile(realPath);
        });
        
        // Set up new watches
        this.syncedFiles.forEach((realPath, relativePath) => {
            const fileIndex = this.fileMap.get(relativePath.toLowerCase());
            if (fileIndex !== undefined) {
                this.fileSync.watchFile(realPath, (content) => {
                    this.updateFileContent(fileIndex, content);
                });
            }
        });
    }
    
    // Update file content when it changes on disk
    updateFileContent(fileIndex, content) {
        const fileInfo = this.files[fileIndex];
        if (fileInfo) {
            // Create a new File object with the updated content
            const newFile = new File([content], fileInfo.name, { type: 'text/markdown' });
            fileInfo.file = newFile;
            
            // Notify listeners that the file has changed
            this.notifyFileChanged(fileIndex);
        }
    }
    
    // Custom event system for file changes
    notifyFileChanged(fileIndex) {
        // Dispatch a custom event
        window.dispatchEvent(new CustomEvent('fileChanged', {
            detail: { fileIndex }
        }));
    }
    
    // Save the current file back to disk
    async saveCurrentFile(content) {
        const fileInfo = this.getCurrentFile();
        if (!fileInfo) return false;
        
        // Get the real path
        const realPath = this.syncedFiles.get(fileInfo.path);
        if (!realPath) return false;
        
        // Save through the server
        const success = await this.fileSync.saveFile(realPath, content);
        if (success) {
            // Update our local file object
            const newFile = new File([content], fileInfo.name, { type: 'text/markdown' });
            fileInfo.file = newFile;
        }
        
        return success;
    }

    getFolderInfo(path) {
        return this.folderStructure.get(path);
    }

    getFileParentFolder(filePath) {
        const parts = filePath.split('/');
        return parts.length > 1 ? parts.slice(0, -1).join('/') : null;
    }

    getFilesInFolder(folderPath) {
        const folder = this.folderStructure.get(folderPath);
        return folder ? Array.from(folder.files).map(path => this.fileMap.get(path.toLowerCase())) : [];
    }

    getSubfolders(folderPath) {
        const folder = this.folderStructure.get(folderPath);
        return folder ? Array.from(folder.children).map(path => this.folderStructure.get(path)) : [];
    }

    updateFileMap() {
        this.fileMap.clear();
        this.files.forEach((fileInfo, index) => {
            this.fileMap.set(fileInfo.path.toLowerCase(), index);
        });
    }

    getFile(index) {
        return this.files[index];
    }

    getCurrentFile() {
        return this.files[this.currentFileIndex];
    }

    setCurrentFile(index) {
        this.currentFileIndex = index;
    }

    findFileByPath(path) {
        return this.fileMap.get(path.toLowerCase());
    }

    resolveRelativePath(href) {
        const currentFile = this.getCurrentFile();
        if (!currentFile) return href;
        
        const currentDir = currentFile.folder;
        if (href.startsWith('./')) {
            return currentDir ? `${currentDir}/${href.slice(2)}` : href.slice(2);
        } else if (href.startsWith('../')) {
            const parts = currentDir.split('/');
            return parts.length > 1
                ? `${parts.slice(0, -1).join('/')}/${href.slice(3)}`
                : href.slice(3);
        } else if (!href.startsWith('/')) {
            return currentDir ? `${currentDir}/${href}` : href;
        }
        return href.slice(1);
    }
    
    // Get the real file path for a file
    getRealPath(fileIndex) {
        const fileInfo = this.getFile(fileIndex);
        if (!fileInfo) return null;
        
        return this.syncedFiles.get(fileInfo.path) || null;
    }
}

export default FileManager; 