import BaseComponent from './BaseComponent';

class FileList extends BaseComponent {
    constructor(container, fileManager) {
        super(container);
        this.fileManager = fileManager;
        
        // Register this component with the file manager
        this.fileManager.registerFileListComponent(this);
        
        // Set initial state with persisted expanded folders if available
        const savedExpandedFolders = this.getSavedExpandedFolders();
        this.state = {
            selectedIndex: this.fileManager.currentFileIndex || -1,
            expandedFolders: savedExpandedFolders || new Set(),
            lastKnownFolders: new Set() // Track known folders for stability
        };
        
        // Initialize with a snapshot of current folders
        this.updateKnownFoldersSnapshot();
        
        // Ensure file list is rerendered when files are added
        window.addEventListener('fileListChanged', () => {
            console.log('FileList component received fileListChanged event');
            
            // Update folder knowledge before updating state
            this.synchronizeFolderState();
            
            // Update selected index to match file manager's current file
            this.setState({ 
                selectedIndex: this.fileManager.currentFileIndex || -1
                // Don't override expandedFolders here - synchronizeFolderState handled it
            });
            
            // Force render
            this.render();
        });
        
        // Also render whenever session is restored
        if (this.fileManager.files.length > 0) {
            console.log('Files already present in FileList construction, rendering...');
            setTimeout(() => this.render(), 0);
        }
    }
    
    // Keep track of folder structure for stability
    updateKnownFoldersSnapshot() {
        const folderPaths = Array.from(this.fileManager.folderStructure.keys());
        this.state.lastKnownFolders = new Set(folderPaths);
        console.log(`Updated known folders snapshot: ${folderPaths.length} folders`);
    }
    
    // Add a safeguard mechanism to ensure folder structure remains stable
    
    // Right after the synchronizeFolderState method and before saveExpandedFolders
    
    // Ensure folder structure integrity with resilient caching
    ensureFolderStructureIntegrity() {
        if (!this.fileManager || !this.fileManager.folderStructure) return;
        
        // Create a snapshot of the current folder structure if needed
        if (!this._folderStructureCache) {
            this._folderStructureCache = new Map();
        }
        
        // Update cache with new folders from current structure
        for (const [path, folderInfo] of this.fileManager.folderStructure.entries()) {
            this._folderStructureCache.set(path, {
                ...folderInfo,
                children: new Set(folderInfo.children),
                files: new Set(folderInfo.files)
            });
        }
        
        // Check for missing folders in the current structure
        let missingFolderCount = 0;
        let restoredFileCount = 0;
        
        for (const [cachedPath, cachedFolder] of this._folderStructureCache.entries()) {
            // If a folder is missing from current structure but exists in cache
            if (!this.fileManager.folderStructure.has(cachedPath)) {
                console.warn(`Folder missing from structure: ${cachedPath}, attempting recovery`);
                
                // Check if files in this cached folder still exist in the file manager
                const stillExistingFiles = Array.from(cachedFolder.files).filter(filePath => {
                    // Find if file still exists in fileManager.files
                    return this.fileManager.files.some(file => 
                        this.fileManager.comparePaths(file.path, filePath)
                    );
                });
                
                // If there are still files belonging to this folder, restore it
                if (stillExistingFiles.length > 0) {
                    console.log(`Restoring folder ${cachedPath} with ${stillExistingFiles.length} files`);
                    
                    // Create a new folder entry in the folder structure
                    this.fileManager.folderStructure.set(cachedPath, {
                        ...cachedFolder,
                        children: new Set(),  // Start with empty children
                        files: new Set(stillExistingFiles)  // Only include files that still exist
                    });
                    
                    // Fix parent relationship
                    if (cachedFolder.parent && this.fileManager.folderStructure.has(cachedFolder.parent)) {
                        this.fileManager.folderStructure.get(cachedFolder.parent).children.add(cachedPath);
                    }
                    
                    // Update file paths to ensure they have the correct folder
                    stillExistingFiles.forEach(filePath => {
                        const fileIndex = this.fileManager.findFileByPath(filePath);
                        if (fileIndex !== undefined) {
                            this.fileManager.files[fileIndex].folder = cachedPath;
                            restoredFileCount++;
                        }
                    });
                    
                    missingFolderCount++;
                }
            }
        }
        
        // Log restoration results if any
        if (missingFolderCount > 0) {
            console.log(`Restored ${missingFolderCount} folders and ${restoredFileCount} file associations`);
            
            // Trigger an update of the file map after restoration
            this.fileManager.updateFileMap();
        }
    }

    // Helper to save expanded folders to localStorage
    saveExpandedFolders() {
        try {
            const expandedArray = Array.from(this.state.expandedFolders);
            localStorage.setItem('expandedFolders', JSON.stringify(expandedArray));
        } catch (e) {
            console.error('Error saving expanded folders state:', e);
        }
    }

    // Helper to get saved expanded folders from localStorage
    getSavedExpandedFolders() {
        try {
            const savedFolders = localStorage.getItem('expandedFolders');
            if (savedFolders) {
                const folderArray = JSON.parse(savedFolders);
                return new Set(folderArray);
            }
        } catch (e) {
            console.error('Error getting saved expanded folders:', e);
        }
        return new Set();
    }

    // Update the setState method
    setState(newState) {
        super.setState(newState);
        
        // Save expanded folders state whenever it changes
        if (newState.expandedFolders) {
            this.saveExpandedFolders();
        }
    }

    // Called when the component is mounted to the DOM
    mount() {
        this.render();
        
        // Add a delayed re-render to ensure file tree is shown after page refresh
        setTimeout(() => {
            if (this.fileManager.files.length > 0) {
                console.log('Delayed re-render of file list after mount');
                
                // Make sure we load saved expanded folders state
                const savedExpandedFolders = this.getSavedExpandedFolders();
                if (savedExpandedFolders && savedExpandedFolders.size > 0) {
                    // Synchronize with current folder structure for stability
                    this.synchronizeFolderState();
                }
                
                this.render();
            }
        }, 200);
    }

    createFileItem(fileInfo, index) {
        const link = this.createElement('a', {
            href: '#',
            title: fileInfo.path
        }, fileInfo.name);

        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.setState({ selectedIndex: index });
            this.emit('fileSelect', { index, fileInfo });
        });

        const li = this.createElement('li', {
            class: `file-item ${index === this.state.selectedIndex ? 'selected' : ''}`,
            'data-depth': fileInfo.depth
        });
        li.appendChild(link);
        return li;
    }

    createFolderItem(folderInfo) {
        const isExpanded = this.state.expandedFolders.has(folderInfo.path);
        
        const folderLink = this.createElement('a', {
            href: '#',
            'data-folder': folderInfo.path
        }, folderInfo.name);

        folderLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleFolder(folderInfo.path);
        });

        const li = this.createElement('li', {
            class: `folder-item ${isExpanded ? 'expanded' : ''}`,
            'data-depth': folderInfo.depth
        });
        li.appendChild(folderLink);

        const contentsContainer = this.createElement('ul', {
            class: `folder-contents ${isExpanded ? '' : 'collapsed'}`
        });
        li.appendChild(contentsContainer);

        if (isExpanded) this.renderFolderContents(folderInfo.path, contentsContainer);

        return li;
    }

    toggleFolder(folderPath) {
        const expandedFolders = new Set(this.state.expandedFolders);
        const isExpanding = !expandedFolders.has(folderPath);
        
        if (isExpanding) {
            expandedFolders.add(folderPath);
            // Expand all parent folders to ensure proper hierarchy
            let currentPath = this.fileManager.getFolderInfo(folderPath)?.parent;
            while (currentPath) {
                expandedFolders.add(currentPath);
                currentPath = this.fileManager.getFolderInfo(currentPath)?.parent;
            }
        } else {
            expandedFolders.delete(folderPath);
            // Collapse all child folders
            Array.from(expandedFolders).forEach(path => {
                if (path.startsWith(folderPath + '/')) expandedFolders.delete(path);
            });
        }
        
        this.setState({ expandedFolders });
        
        // Save expanded folders state explicitly after toggling
        this.saveExpandedFolders();
    }

    renderFolderContents(folderPath, container) {
        const folder = this.fileManager.getFolderInfo(folderPath);
        if (!folder) return;

        this.fileManager.getSubfolders(folderPath)
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(subfolder => container.appendChild(this.createFolderItem(subfolder)));

        this.fileManager.getFilesInFolder(folderPath)
            .forEach(fileIndex => {
                const fileInfo = this.fileManager.getFile(fileIndex);
                container.appendChild(this.createFileItem(fileInfo, fileIndex));
            });
    }

    render() {
        console.log('FileList: Rendering with state:', this.state);
        
        const rootList = this.createElement('ul', {class: 'file-tree'});
        
        // Create "Add Directory" button at the top
        const addDirItem = this.createElement('li', {class: 'add-directory-item'});
        const addDirButton = this.createElement('button', {
            class: 'add-directory-button',
            title: 'Add directory to watch'
        }, '+ Add Directory');
        
        addDirButton.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                // Attempt to add a directory using the File System API
                const result = await this.fileManager.processDirectoryFromFileSystemAPI();
                if (!result) {
                    console.warn('No directory was selected or it contained no markdown files');
                }
            } catch (error) {
                console.error('Error adding directory:', error);
            }
        });
        
        addDirItem.appendChild(addDirButton);
        rootList.appendChild(addDirItem);
        
        // Get files and folders to display
        const rootFolders = Array.from(this.fileManager.folderStructure.values())
            .filter(f => f.isRoot)
            .sort((a, b) => a.name.localeCompare(b.name));

        const rootFiles = this.fileManager.files
            .filter(f => f.isRoot)
            .sort((a, b) => a.name.localeCompare(b.name));
        
        // If we have files or folders to show, display them
        if (rootFolders.length > 0 || rootFiles.length > 0) {
            // Create a "Current Project" header
            const projectHeader = this.createElement('li', {class: 'project-header'});
            projectHeader.appendChild(this.createElement('span', {}, 'Current Project'));
            rootList.appendChild(projectHeader);
            
            // Add folders and files
            rootFolders.forEach(folder => {
                rootList.appendChild(this.createFolderItem(folder));
            });

            rootFiles.forEach((fileInfo, index) => {
                const fileIndex = this.fileManager.fileMap.get(fileInfo.path.toLowerCase());
                rootList.appendChild(this.createFileItem(fileInfo, fileIndex));
            });
        } else {
            // If there are no files, show a message
            const emptyMessage = this.createElement('li', {class: 'empty-message'});
            emptyMessage.appendChild(this.createElement('span', {}, 'No files opened'));
            rootList.appendChild(emptyMessage);
        }

        this.container.replaceChildren(rootList);
    }

    // Now modify the synchronizeFolderState method to call the safeguard
    synchronizeFolderState() {
        // Check for folder structure integrity first
        this.ensureFolderStructureIntegrity();
        
        // Rest of the original method...
        // Get current folders from file manager
        const currentFolders = new Set(this.fileManager.folderStructure.keys());
        
        // Get previous snapshot of folders
        const previousFolders = this.state.lastKnownFolders;
        
        // Get current expanded folders (with localStorage backup)
        const expandedFolders = new Set(this.state.expandedFolders);
        const savedExpandedFolders = this.getSavedExpandedFolders() || new Set();
        
        // Merge current expanded with saved expanded for resilience
        for (const folder of savedExpandedFolders) {
            expandedFolders.add(folder);
        }
        
        // Remove any expanded state for folders that no longer exist
        for (const folder of expandedFolders) {
            if (!currentFolders.has(folder)) {
                expandedFolders.delete(folder);
            }
        }
        
        // If a parent folder was previously expanded, ensure it stays expanded
        for (const folder of currentFolders) {
            const pathParts = folder.split('/');
            if (pathParts.length > 1) {
                // Check if any parent folder was expanded
                let pathSoFar = '';
                for (let i = 0; i < pathParts.length - 1; i++) {
                    pathSoFar = pathSoFar ? `${pathSoFar}/${pathParts[i]}` : pathParts[i];
                    if (expandedFolders.has(pathSoFar)) {
                        // Parent folder is expanded, so this one should be visible
                        expandedFolders.add(folder);
                        break;
                    }
                }
            }
        }
        
        // Auto-expand any root folders for better UX
        for (const folder of currentFolders) {
            if (!folder.includes('/')) {
                expandedFolders.add(folder);
            }
        }
        
        // Update state
        this.setState({ expandedFolders });
        
        // Update the known folders snapshot
        this.state.lastKnownFolders = currentFolders;
        
        // Save to localStorage
        this.saveExpandedFolders();
        
        console.log(`Folder state synchronized: ${expandedFolders.size} expanded folders`);
    }
}

export default FileList; 