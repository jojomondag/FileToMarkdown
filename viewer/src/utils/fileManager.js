import { FILE_EXTENSIONS } from './constants';
import FileSync from './fileSync';

// Constants for localStorage keys
const RECENT_FILES_KEY = 'fileToMarkdown_recentFiles';
const EXPANDED_FOLDERS_KEY = 'fileToMarkdown_expandedFolders';
const LOADED_FILES_KEY = 'fileToMarkdown_loadedFiles';
const MAX_RECENT_FILES = 10;

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
        this.recentFiles = this.loadRecentFiles();
        this.sessionRestored = false; // Flag to track if session was restored
        
        // Try to restore previous session if browser supports FileSystem API
        // Note: We can't use async/await in the constructor, so we'll use a promise
        if (this.fileSync.supportsFileSystem) {
            this.restoreLastSession().then(restored => {
                this.sessionRestored = restored;
                if (restored) {
                    console.log('Session restored successfully!');
                    // Notify that files were loaded
                    this.notifyFileListChanged();
                } else {
                    console.log('No session to restore or restoration failed');
                    // If FileSystem API session restore failed, try to load from localStorage
                    this.loadFilesFromLocalStorage();
                }
            }).catch(error => {
                console.error('Error in session restoration:', error);
                // If there was an error, try to load from localStorage as fallback
                this.loadFilesFromLocalStorage();
            });
        } else {
            // FileSystem API not supported, load from localStorage
            this.loadFilesFromLocalStorage();
        }
    }

    // Load recent files from localStorage
    loadRecentFiles() {
        try {
            const recentFiles = localStorage.getItem(RECENT_FILES_KEY);
            return recentFiles ? JSON.parse(recentFiles) : [];
        } catch (e) {
            console.error('Error loading recent files from localStorage:', e);
            return [];
        }
    }

    // Save recent files to localStorage
    saveRecentFiles() {
        try {
            localStorage.setItem(RECENT_FILES_KEY, JSON.stringify(this.recentFiles));
        } catch (e) {
            console.error('Error saving recent files to localStorage:', e);
        }
    }
    
    // Add a file to recent files
    addToRecentFiles(fileInfo) {
        // Only add files with handles or real paths (files we can reopen)
        if (!fileInfo.handle && !fileInfo.realPath) return;
        
        // Create a simplified object for storage
        const recentFile = {
            name: fileInfo.name,
            path: fileInfo.path,
            lastOpened: new Date().toISOString(),
            // We can't store the actual handle in localStorage, but we can keep metadata
            hasHandle: !!fileInfo.handle,
            realPath: fileInfo.realPath || null
        };
        
        // Remove any existing entry for the same file
        this.recentFiles = this.recentFiles.filter(f => 
            f.path !== recentFile.path && 
            (!f.realPath || f.realPath !== recentFile.realPath)
        );
        
        // Add to the beginning of the array
        this.recentFiles.unshift(recentFile);
        
        // Limit the number of recent files
        if (this.recentFiles.length > MAX_RECENT_FILES) {
            this.recentFiles = this.recentFiles.slice(0, MAX_RECENT_FILES);
        }
        
        // Save to localStorage
        this.saveRecentFiles();
    }
    
    // Save the current session state for restoration
    saveSessionState() {
        console.log('FileManager: Saving session state...');
        
        // Save current file index
        if (this.currentFileIndex !== -1) {
            localStorage.setItem('currentFileIndex', this.currentFileIndex.toString());
            console.log(`FileManager: Saved current file index: ${this.currentFileIndex}`);
        }
        
        // Save expanded folders
        if (this.folders && Object.keys(this.folders).length > 0) {
            this.saveExpandedFolders();
            console.log('FileManager: Saved expanded folders state');
        }
        
        // Files are already saved to IndexedDB as we go
        console.log('FileManager: Session state saved');
    }
    
    // Try to restore last session
    async restoreLastSession() {
        if (!this.fileSync.supportsFileSystem) return false;
        
        try {
            const sessionData = localStorage.getItem('fileToMarkdown_session');
            if (!sessionData) return false;
            
            const session = JSON.parse(sessionData);
            
            // Only restore sessions that are less than a day old
            if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
                localStorage.removeItem('fileToMarkdown_session');
                return false;
            }
            
            // Try to restore file handles
            if (session.fileHandles && session.fileHandles.length > 0) {
                const filePromises = session.fileHandles.map(async fileData => {
                    try {
                        const handle = await this.fileSync.retrieveFileHandle(fileData.id);
                        if (handle) {
                            const file = await handle.getFile();
                            
                            // Use the saved path information if available
                            return {
                                file,
                                handle,
                                name: file.name,
                                path: fileData.path || file.name,
                                folder: fileData.folder || '',
                                depth: fileData.depth || 0,
                                isRoot: fileData.isRoot !== undefined ? fileData.isRoot : true
                            };
                        }
                        return null;
                    } catch (e) {
                        console.error('Error restoring file handle:', e);
                        return null;
                    }
                });
                
                const files = (await Promise.all(filePromises)).filter(Boolean);
                
                if (files.length > 0) {
                    this.clearFiles();
                    this.files = files;
                    
                    // Restore folder structure if available
                    if (session.folderStructure) {
                        this.restoreFolderStructure(session.folderStructure);
                    } else {
                        // Fall back to reconstructing from scratch
                        this.reconstructFolderStructure();
                    }
                    
                    this.updateFileMap();
                    if (session.currentFileIndex >= 0 && session.currentFileIndex < files.length) {
                        this.currentFileIndex = session.currentFileIndex;
                    } else {
                        this.currentFileIndex = 0;
                    }
                    
                    // Notify listeners about the file list change
                    this.notifyFileListChanged();
                    
                    console.log('Session restored with', files.length, 'files');
                    return true;
                }
            }
        } catch (e) {
            console.error('Error restoring session:', e);
        }
        
        return false;
    }

    // Restore folder structure from saved session data
    restoreFolderStructure(folderData) {
        try {
            this.folderStructure.clear();
            console.log('Restoring folder structure with', Object.keys(folderData).length, 'folders');
            
            // First pass: create folders with basic structure
            Object.entries(folderData).forEach(([path, folder]) => {
                this.folderStructure.set(path, {
                    name: folder.name,
                    path: folder.path,
                    parent: folder.parent,
                    depth: folder.depth,
                    isRoot: folder.isRoot,
                    children: new Set(folder.children || []),
                    files: new Set(folder.files || [])
                });
                console.log(`Restored folder: ${path} with ${folder.files?.length || 0} files`);
            });
            
            // Second pass: make sure all files are correctly linked
            // This is important because file paths may have changed
            for (const fileInfo of this.files) {
                if (fileInfo.folder) {
                    const folder = this.folderStructure.get(fileInfo.folder);
                    if (folder) {
                        folder.files.add(fileInfo.path);
                        console.log(`Linked file ${fileInfo.path} to folder ${fileInfo.folder}`);
                    } else {
                        // If folder doesn't exist, maybe the folder structure is incomplete
                        // Try to reconstruct the folder structure for this file
                        this.createFolderForFile(fileInfo);
                    }
                }
            }
        } catch (error) {
            console.error('Error restoring folder structure:', error);
            // Fallback to reconstructing from scratch
            this.reconstructFolderStructure();
        }
    }

    // Create folder structure for a single file
    createFolderForFile(fileInfo) {
        if (!fileInfo.folder) return;
        
        console.log(`Creating folder structure for file: ${fileInfo.path}`);
        const pathParts = fileInfo.folder.split('/');
        let currentPath = '';
        
        pathParts.forEach((part, index) => {
            const parentPath = currentPath;
            currentPath = currentPath ? `${currentPath}/${part}` : part;
            
            if (!this.folderStructure.has(currentPath)) {
                console.log(`Creating missing folder: ${currentPath}`);
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
        
        // Add the file to its folder
        if (this.folderStructure.has(fileInfo.folder)) {
            this.folderStructure.get(fileInfo.folder).files.add(fileInfo.path);
        }
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

    // Clear all loaded files and folder structure
    clearFiles() {
        this.files = [];
        this.fileMap.clear();
        this.folderStructure.clear();
        this.currentFileIndex = -1;
        this.rootFolder = null;
        this.syncedFiles.clear();
    }

    // Save expanded folders state
    saveExpandedFolders(expandedFolders) {
        try {
            localStorage.setItem(EXPANDED_FOLDERS_KEY, JSON.stringify(Array.from(expandedFolders)));
        } catch (e) {
            console.error('Error saving expanded folders:', e);
        }
    }
    
    // Load expanded folders state
    loadExpandedFolders() {
        try {
            const expandedFolders = localStorage.getItem(EXPANDED_FOLDERS_KEY);
            return expandedFolders ? new Set(JSON.parse(expandedFolders)) : new Set();
        } catch (e) {
            console.error('Error loading expanded folders:', e);
            return new Set();
        }
    }

    async processFiles(fileList) {
        console.log('Processing', fileList.length, 'files');
        let baseIndex = this.files.length;
        const newFiles = [];
        
        // Process each file
        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];
            const fileInfo = {
                name: file.name,
                path: file.name, // Default path is just the filename
                size: file.size,
                type: file.type || this.getFileTypeFromName(file.name),
                lastModified: file.lastModified,
                file: file,
                content: null,
                isRoot: true, // Default as root until folder structure is determined
                depth: 0 // Default depth
            };
            
            if (file.handle) {
                fileInfo.handle = file.handle;
            }
            
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
        
        // Add recently loaded files to recent files
        newFiles.forEach(fileInfo => {
            this.addToRecentFiles(fileInfo);
        });
        
        // Notify listeners about the file list change
        this.notifyFileListChanged();
        
        // Setup file watchers if supported
        this.setupFileWatchers();
        
        // Save the files to localStorage
        this.saveFilesToLocalStorage();
        
        return newFiles.length;
    }

    // Process files from the File System Access API
    async processFilesFromFileSystemAPI() {
        try {
            // Use the FileSync class to open files with the File System Access API
            const files = await this.fileSync.openFiles();
            
            if (files.length === 0) {
                return false;
            }
            
            // Clear existing files
            this.clearFiles();
            
            // Process the files
            const markdownFiles = [];
            
            for (const fileInfo of files) {
                if (fileInfo.name.toLowerCase().endsWith(FILE_EXTENSIONS.MARKDOWN)) {
                    const fileData = {
                        file: fileInfo.file,
                        path: fileInfo.path,
                        name: fileInfo.name,
                        folder: '',  // Files opened directly are at root level
                        depth: 0,
                        isRoot: true,
                        handle: fileInfo.handle  // Store the file handle
                    };
                    
                    markdownFiles.push(fileData);
                }
            }
            
            if (markdownFiles.length) {
                this.files = markdownFiles;
                this.updateFileMap();
                
                // Add files to recent files
                for (const file of this.files) {
                    this.addToRecentFiles(file);
                }
                
                // Save session state
                this.saveSessionState();
                
                // Notify listeners about the file list change
                this.notifyFileListChanged();
                
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error processing files from File System API:', error);
            return false;
        }
    }

    // Notify listeners that the file list has changed
    notifyFileListChanged() {
        // Dispatch a custom event
        window.dispatchEvent(new CustomEvent('fileListChanged'));
        // When file list changes, save to localStorage
        this.saveFilesToLocalStorage();
    }

    // Get list of recent files
    getRecentFiles() {
        return this.recentFiles;
    }
    
    // Try to open a recent file
    async openRecentFile(recentFile) {
        console.log('Opening recent file:', recentFile);
        
        try {
            // If we have a real path, try to open the file with the File System API
            if (recentFile.realPath && this.fileSync) {
                const fileHandle = await this.fileSync.getFileHandle(recentFile.realPath);
                if (fileHandle) {
                    const file = await fileHandle.getFile();
                    console.log('Retrieved file from real path:', file.name);
                    
                    // Create file info and add to file list
                    const fileInfo = {
                        name: file.name,
                        path: recentFile.path || file.name,
                        size: file.size,
                        type: file.type || this.getFileTypeFromName(file.name),
                        lastModified: file.lastModified,
                        file: file,
                        content: null,
                        handle: fileHandle,
                        realPath: recentFile.realPath,
                        isRoot: true,
                        depth: 0
                    };
                    
                    // Read file content
                    fileInfo.content = await this.readFileContent(file);
                    
                    // Add to file list
                    this.clearFiles(); // Start fresh
                    this.files.push(fileInfo);
                    this.currentFileIndex = 0;
                    this.updateFileMap();
                    
                    // Notify that the file list has changed
                    this.notifyFileListChanged();
                    
                    // Save to localStorage
                    this.saveFilesToLocalStorage();
                    
                    return true;
                }
            }
            
            // If the file has a handle, try to reuse it
            if (recentFile.hasHandle && this.fileSync) {
                // Try to restore handle from IndexedDB
                const fileHandle = await this.fileSync.retrieveFileHandle(recentFile.path);
                if (fileHandle) {
                    const file = await fileHandle.getFile();
                    console.log('Retrieved file from stored handle:', file.name);
                    
                    // Create file info and add to file list
                    const fileInfo = {
                        name: file.name,
                        path: recentFile.path || file.name,
                        size: file.size,
                        type: file.type || this.getFileTypeFromName(file.name),
                        lastModified: file.lastModified,
                        file: file,
                        content: null,
                        handle: fileHandle,
                        isRoot: true,
                        depth: 0
                    };
                    
                    // Read file content
                    fileInfo.content = await this.readFileContent(file);
                    
                    // Add to file list
                    this.clearFiles(); // Start fresh
                    this.files.push(fileInfo);
                    this.currentFileIndex = 0;
                    this.updateFileMap();
                    
                    // Notify that the file list has changed
                    this.notifyFileListChanged();
                    
                    // Save to localStorage
                    this.saveFilesToLocalStorage();
                    
                    return true;
                }
            }
            
            // If we don't have a real path or handle, prompt the user to select the file again
            console.log('No file handle or real path available, prompting user to select file');
            return false;
        } catch (error) {
            console.error('Error opening recent file:', error);
            return false;
        }
    }

    // Process files from the file system using server API (fallback)
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
            
            // Add files to recent files
            for (const file of this.files) {
                this.addToRecentFiles(file);
            }
            
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
        if (fileIndex < 0 || fileIndex >= this.files.length) return;
        
        const file = this.files[fileIndex];
        file.content = content;
        
        // If the file is synchronized with a real file, update local file content
        if (file.handle || file.realPath) {
            this.fileSync.updateFileContent(file, content);
        }
        
        // Save the updated file to localStorage
        this.saveFilesToLocalStorage();
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
        if (this.currentFileIndex < 0) return { success: false, message: 'No file selected' };
        
        const fileInfo = this.files[this.currentFileIndex];
        if (!fileInfo) return { success: false, message: 'File not found' };
        
        // Update the content in our system
        fileInfo.content = content;
        
        try {
            // If we have a file handle or real path, try to save to disk
            if (fileInfo.handle || fileInfo.realPath) {
                await this.fileSync.saveFile(fileInfo, content);
            }
            
            // Save to localStorage (even if real file saving failed)
            this.saveFilesToLocalStorage();
            
            return { success: true };
        } catch (error) {
            console.error('Error saving file:', error);
            // Still update localStorage even if real file saving failed
            this.saveFilesToLocalStorage();
            return { 
                success: false, 
                message: `Error saving file: ${error.message || 'Unknown error'}`,
                localStorageSaved: true
            };
        }
    }

    // Load content for the current file (refresh from disk)
    async refreshCurrentFile() {
        const fileInfo = this.getCurrentFile();
        if (!fileInfo) return false;
        
        let content;
        
        // If we have a file handle, use it
        if (fileInfo.handle) {
            content = await this.fileSync.loadFile(null, fileInfo.handle);
        } else {
            // Otherwise try using the real path if available
            const realPath = this.syncedFiles.get(fileInfo.path);
            if (!realPath) return false;
            
            content = await this.fileSync.loadFile(realPath);
        }
        
        if (content !== null) {
            // Update our local file object
            const newFile = new File([content], fileInfo.name, { type: 'text/markdown' });
            fileInfo.file = newFile;
            return true;
        }
        
        return false;
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
            if (parts.length === 0) return href.slice(3);
            
            const parentDir = parts.slice(0, -1).join('/');
            return parentDir ? `${parentDir}/${href.slice(3)}` : href.slice(3);
        }
        
        return currentDir ? `${currentDir}/${href}` : href;
    }
    
    getRealPath(fileIndex) {
        const fileInfo = this.getFile(fileIndex);
        if (!fileInfo) return null;
        
        return this.syncedFiles.get(fileInfo.path) || null;
    }
    
    getFileHandle(fileIndex) {
        const fileInfo = this.getFile(fileIndex);
        if (!fileInfo) return null;
        
        return fileInfo.handle || null;
    }

    async restoreSession() {
        console.log('FileManager: Restoring session...');
        
        try {
            const storedFiles = await this.db.getFiles();
            if (storedFiles && storedFiles.length) {
                console.log(`FileManager: Found ${storedFiles.length} stored files`);
                this.files = storedFiles;
                
                // Set current file index from storage or default to first file
                const storedIndex = localStorage.getItem('currentFileIndex');
                this.currentFileIndex = storedIndex !== null ? parseInt(storedIndex, 10) : 0;
                
                // Ensure we have a valid index
                if (this.currentFileIndex >= this.files.length) {
                    this.currentFileIndex = this.files.length > 0 ? 0 : -1;
                }
                
                console.log(`FileManager: Current file index set to ${this.currentFileIndex}`);
                
                // Allow UI to update with files before processing folders
                this.notifyFileListChanged();
                
                // Use setTimeout to give browser a chance to render the file list
                setTimeout(() => {
                    // Now restore folder structure
                    this.restoreFolderStructure();
                    
                    // Set current file and notify
                    if (this.currentFileIndex >= 0 && this.files.length > 0) {
                        this.currentFile = this.files[this.currentFileIndex];
                        this.notifyCurrentFileChanged();
                    }
                }, 100);
                
                return true;
            } else {
                console.log('FileManager: No stored files found');
                return false;
            }
        } catch (error) {
            console.error('FileManager: Error restoring session:', error);
            return false;
        }
    }

    // Save current files to localStorage
    saveFilesToLocalStorage() {
        try {
            if (this.files && this.files.length > 0) {
                console.log(`Attempting to save ${this.files.length} files to localStorage`);
                
                // Create a simplified version of files that can be stored in localStorage
                const filesToStore = this.files.map(file => {
                    // Don't store the actual file object since it can't be serialized
                    // Also limit content size to avoid localStorage quota issues
                    const maxContentSize = 50000; // ~50KB per file max to avoid quota issues
                    let content = file.content || '';
                    if (content.length > maxContentSize) {
                        content = content.substring(0, maxContentSize) + '... [content truncated for localStorage]';
                    }
                    
                    return {
                        name: file.name,
                        path: file.path,
                        content: content,
                        folder: file.folder || '',
                        depth: file.depth || 0,
                        isRoot: file.isRoot || false
                    };
                });
                
                // Calculate approximate size before storing
                const dataString = JSON.stringify(filesToStore);
                const estimatedSize = dataString.length;
                console.log(`Data size to store in localStorage: ~${(estimatedSize/1024).toFixed(2)}KB`);
                
                // Check if we might exceed localStorage quota (typically 5-10MB)
                if (estimatedSize > 4 * 1024 * 1024) { // 4MB safety threshold
                    console.warn('WARNING: Data size exceeds safe localStorage limit. Some files may not be saved.');
                    
                    // Try to save a simplified version without content
                    const simplifiedFiles = this.files.map(file => {
                        return {
                            name: file.name,
                            path: file.path,
                            folder: file.folder || '',
                            depth: file.depth || 0,
                            isRoot: file.isRoot || false
                        };
                    });
                    
                    localStorage.setItem(LOADED_FILES_KEY, JSON.stringify(simplifiedFiles));
                } else {
                    localStorage.setItem(LOADED_FILES_KEY, dataString);
                }
                
                console.log(`Saved ${filesToStore.length} files to localStorage`);
                
                // Also save folder structure
                const folderStructureObj = {};
                this.folderStructure.forEach((folder, path) => {
                    folderStructureObj[path] = {
                        name: folder.name,
                        path: folder.path,
                        parent: folder.parent,
                        depth: folder.depth,
                        isRoot: folder.isRoot,
                        children: Array.from(folder.children),
                        files: Array.from(folder.files)
                    };
                });
                
                localStorage.setItem(LOADED_FILES_KEY + '_folders', JSON.stringify(folderStructureObj));
                console.log(`Saved folder structure with ${Object.keys(folderStructureObj).length} folders`);
                
                // Save current file index
                localStorage.setItem(LOADED_FILES_KEY + '_currentIndex', this.currentFileIndex.toString());
                console.log(`Saved current file index: ${this.currentFileIndex}`);
                
                // Verify data was stored correctly
                const storedFilesData = localStorage.getItem(LOADED_FILES_KEY);
                const storedFoldersData = localStorage.getItem(LOADED_FILES_KEY + '_folders');
                if (storedFilesData && storedFoldersData) {
                    console.log('Files and folders successfully saved to localStorage');
                    return true;
                } else {
                    console.error('Files or folders data not found in localStorage after saving');
                    return false;
                }
            } else {
                console.log('No files to save to localStorage');
                return false;
            }
        } catch (e) {
            console.error('Error saving files to localStorage:', e);
            return false;
        }
    }
    
    // Load files from localStorage
    loadFilesFromLocalStorage() {
        try {
            console.log('Attempting to load files from localStorage');
            
            const filesData = localStorage.getItem(LOADED_FILES_KEY);
            if (!filesData) {
                console.log('No files data found in localStorage');
                return false;
            }
            
            let loadedFiles;
            try {
                loadedFiles = JSON.parse(filesData);
                console.log(`Found ${loadedFiles.length} files in localStorage`);
            } catch (parseError) {
                console.error('Error parsing files data from localStorage:', parseError);
                return false;
            }
            
            if (!loadedFiles || !Array.isArray(loadedFiles) || loadedFiles.length === 0) {
                console.log('No valid files data in localStorage');
                return false;
            }
            
            // Only load from localStorage if we don't already have files
            if (this.files.length === 0) {
                console.log('Loading files from localStorage into memory');
                
                // Create File objects from stored data
                this.files = loadedFiles.map(fileData => {
                    // Create a File object from the content if available
                    if (fileData.content) {
                        // Create a File object that can be used by the application
                        const file = new File(
                            [fileData.content], 
                            fileData.name, 
                            { type: 'text/markdown' }
                        );
                        
                        return {
                            ...fileData,
                            file: file,
                        };
                    }
                    return fileData;
                });
                
                console.log(`Recreated ${this.files.length} file objects from localStorage data`);
                
                // Load folder structure if available
                const folderData = localStorage.getItem(LOADED_FILES_KEY + '_folders');
                if (folderData) {
                    try {
                        const folderStructure = JSON.parse(folderData);
                        console.log(`Found folder structure with ${Object.keys(folderStructure).length} folders`);
                        this.restoreFolderStructure(folderStructure);
                    } catch (e) {
                        console.error('Error restoring folder structure from localStorage:', e);
                        console.log('Falling back to reconstructing folder structure');
                        this.reconstructFolderStructure();
                    }
                } else {
                    console.log('No folder structure found in localStorage, reconstructing');
                    this.reconstructFolderStructure();
                }
                
                // Load current file index
                const currentIndexStr = localStorage.getItem(LOADED_FILES_KEY + '_currentIndex');
                if (currentIndexStr) {
                    try {
                        const currentIndex = parseInt(currentIndexStr, 10);
                        if (!isNaN(currentIndex) && currentIndex >= 0 && currentIndex < loadedFiles.length) {
                            console.log(`Setting current file index to ${currentIndex}`);
                            this.currentFileIndex = currentIndex;
                        } else {
                            console.log(`Invalid current file index ${currentIndex}, setting to 0`);
                            this.currentFileIndex = 0;
                        }
                    } catch (e) {
                        console.error('Error parsing current file index:', e);
                        this.currentFileIndex = 0;
                    }
                } else {
                    console.log('No current file index found, setting to 0');
                    this.currentFileIndex = 0;
                }
                
                this.updateFileMap();
                console.log('Updated file map with localStorage files');
                
                // Manually call to notify UI components about loaded files
                this.notifyFileListChanged();
                console.log('Notified components that files have been loaded from localStorage');
                
                return true;
            } else {
                console.log('Files already loaded in memory, not loading from localStorage');
                return false;
            }
        } catch (e) {
            console.error('Error in loadFilesFromLocalStorage:', e);
            return false;
        }
    }

    // Add file to file list - we'll replace this with a more robust implementation
    addFile(fileInfo) {
        // First check if file already exists by path
        const existingIndex = this.files.findIndex(f => f.path === fileInfo.path);
        if (existingIndex >= 0) {
            console.log(`File ${fileInfo.path} already exists, replacing at index ${existingIndex}`);
            this.files[existingIndex] = fileInfo;
            this.updateFileMap();
            this.notifyFileListChanged();
            this.saveFilesToLocalStorage(); // Save changes to localStorage
            return existingIndex;
        }
        
        // Add new file
        this.files.push(fileInfo);
        const index = this.files.length - 1;
        
        // Update file map
        this.updateFileMap();
        
        // Set as current file if this is the first file
        if (this.currentFileIndex === -1) {
            this.currentFileIndex = index;
        }
        
        // Record this file's real path if available for future reference
        if (fileInfo.realPath) {
            this.syncedFiles.set(fileInfo.path, fileInfo.realPath);
        }
        
        // Add to recent files
        this.addToRecentFiles(fileInfo);
        
        // Notify that the file list has changed
        this.notifyFileListChanged();
        
        // Save to localStorage
        this.saveFilesToLocalStorage();
        
        return index;
    }

    // Handle directory or file upload (core function for file processing)
    async handleFileUpload(fileList) {
        console.log('Handling file upload with', fileList.length, 'files');
        const fileCount = await this.processFiles(fileList);
        
        if (fileCount > 0) {
            // Always save to localStorage after uploading files
            this.saveFilesToLocalStorage();
            return true;
        }
        return false;
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
}

export default FileManager; 