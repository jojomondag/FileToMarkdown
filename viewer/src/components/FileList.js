import BaseComponent from './BaseComponent';

class FileList extends BaseComponent {
    constructor(container, fileManager) {
        super(container);
        this.fileManager = fileManager;
        
        // Load expanded folders from localStorage
        const expandedFolders = this.fileManager.loadExpandedFolders() || new Set();
        console.log('Loaded expanded folders from localStorage:', Array.from(expandedFolders));
        
        // Set initial state
        this.state = {
            selectedIndex: this.fileManager.currentFileIndex || -1,
            expandedFolders: expandedFolders,
            showRecent: this.getInitialRecentState() // Start with recent files shown
        };
        
        // Ensure file list is rerendered when files are added
        window.addEventListener('fileListChanged', () => {
            console.log('FileList component received fileListChanged event');
            // Update selected index to match file manager's current file
            this.setState({ 
                selectedIndex: this.fileManager.currentFileIndex || -1,
                // Keep expanded folders state
                expandedFolders: this.state.expandedFolders
            });
            
            // Save expanded folders state to localStorage
            this.fileManager.saveExpandedFolders(this.state.expandedFolders);
        });
        
        // Also render whenever session is restored
        if (this.fileManager.files.length > 0) {
            // Files are already loaded (perhaps from a previous restoration)
            console.log('Files already present in FileList construction, rendering...');
            setTimeout(() => this.render(), 0);
        }
    }

    // Called when the component is mounted to the DOM
    mount() {
        this.render();
        
        // Add a delayed re-render to ensure file tree is shown after page refresh
        setTimeout(() => {
            if (this.fileManager.files.length > 0) {
                console.log('Delayed re-render of file list after mount');
                this.render();
            }
        }, 200);
    }

    // Determine initial state of the recent files section
    getInitialRecentState() {
        // Show recent files by default when there are no current files
        return this.fileManager.files.length === 0 && this.fileManager.getRecentFiles().length > 0;
    }

    createFileItem(fileInfo, index) {
        const isSelected = index === this.state.selectedIndex;
        
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
            class: `file-item ${isSelected ? 'selected' : ''}`,
            'data-depth': fileInfo.depth
        });
        li.appendChild(link);
        return li;
    }

    createRecentFileItem(recentFile, index) {
        const link = this.createElement('a', {
            href: '#',
            title: recentFile.path,
            'data-recent': index
        }, recentFile.name);

        link.addEventListener('click', async (e) => {
            e.preventDefault();
            const success = await this.fileManager.openRecentFile(recentFile);
            if (success) {
                this.setState({ 
                    selectedIndex: 0,
                    showRecent: false // Hide recent files after selection
                });
                this.emit('fileSelect', { index: 0, fileInfo: this.fileManager.getFile(0) });
            }
        });

        const li = this.createElement('li', {
            class: 'file-item recent-file',
            'data-depth': 0
        });
        
        // Add a timestamp subtitle
        const date = new Date(recentFile.lastOpened);
        const dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        // Create a container for file info
        const fileInfo = this.createElement('div', { class: 'file-info' });
        fileInfo.appendChild(link);
        
        const timestamp = this.createElement('span', { class: 'timestamp' }, dateStr);
        fileInfo.appendChild(timestamp);
        
        li.appendChild(fileInfo);
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
            let currentPath = this.fileManager.getFolderInfo(folderPath)?.parent;
            while (currentPath) {
                expandedFolders.add(currentPath);
                currentPath = this.fileManager.getFolderInfo(currentPath)?.parent;
            }
        } else {
            expandedFolders.delete(folderPath);
            Array.from(expandedFolders).forEach(path => {
                if (path.startsWith(folderPath + '/')) expandedFolders.delete(path);
            });
        }
        
        // Save expanded folders to localStorage
        this.fileManager.saveExpandedFolders(expandedFolders);
        
        this.setState({ expandedFolders });
    }

    // Toggle view of recent files
    toggleRecentFiles() {
        this.setState({ showRecent: !this.state.showRecent });
    }

    renderFolderContents(folderPath, container) {
        const folder = this.fileManager.getFolderInfo(folderPath);
        if (!folder) return;

        const subfolders = this.fileManager.getSubfolders(folderPath)
            .sort((a, b) => a.name.localeCompare(b.name));
        
        subfolders.forEach(subfolder => {
            container.appendChild(this.createFolderItem(subfolder));
        });

        const files = this.fileManager.getFilesInFolder(folderPath);
        files.forEach(fileIndex => {
            const fileInfo = this.fileManager.getFile(fileIndex);
            container.appendChild(this.createFileItem(fileInfo, fileIndex));
        });
    }

    render() {
        const rootList = this.createElement('ul', {class: 'file-tree'});
        
        // Add Recent Files section if we have recent files
        const recentFiles = this.fileManager.getRecentFiles();
        
        if (recentFiles.length > 0) {
            // Create a "Recent Files" header that toggles the view
            const recentHeader = this.createElement('li', {class: 'recent-header'});
            const recentToggle = this.createElement('a', {
                href: '#',
                'data-recent-toggle': true,
                class: this.state.showRecent ? 'expanded' : ''
            }, 'Recent Files');
            
            recentToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleRecentFiles();
            });
            
            recentHeader.appendChild(recentToggle);
            rootList.appendChild(recentHeader);
            
            // Add recent files if expanded
            if (this.state.showRecent) {
                const recentList = this.createElement('ul', {class: 'recent-files'});
                
                recentFiles.forEach((recentFile, index) => {
                    recentList.appendChild(this.createRecentFileItem(recentFile, index));
                });
                
                const recentContainer = this.createElement('li', {class: 'recent-container'});
                recentContainer.appendChild(recentList);
                rootList.appendChild(recentContainer);
            }
            
            // Add a separator
            rootList.appendChild(this.createElement('li', {class: 'file-separator'}));
        }

        const rootFolders = Array.from(this.fileManager.folderStructure.values())
            .filter(f => f.isRoot)
            .sort((a, b) => a.name.localeCompare(b.name));

        const rootFiles = this.fileManager.files
            .filter(f => f.isRoot)
            .sort((a, b) => a.name.localeCompare(b.name));
            
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
                rootList.appendChild(this.createFileItem(fileInfo, index));
            });
        } else if (recentFiles.length === 0) {
            // If there are no files or recent history, show a message
            const emptyMessage = this.createElement('li', {class: 'empty-message'});
            emptyMessage.appendChild(this.createElement('span', {}, 'No files opened'));
            rootList.appendChild(emptyMessage);
        }

        this.container.replaceChildren(rootList);
    }
}

export default FileList; 