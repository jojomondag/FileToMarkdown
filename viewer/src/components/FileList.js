import BaseComponent from './BaseComponent';

class FileList extends BaseComponent {
    constructor(container, fileManager) {
        super(container);
        this.fileManager = fileManager;
        
        // Register this component with the file manager
        this.fileManager.registerFileListComponent(this);
        
        // Set initial state
        this.state = {
            selectedIndex: this.fileManager.currentFileIndex || -1,
            expandedFolders: new Set()
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
            
            // Force render
            this.render();
        });
        
        // Also render whenever session is restored
        if (this.fileManager.files.length > 0) {
            console.log('Files already present in FileList construction, rendering...');
            setTimeout(() => this.render(), 0);
        }
    }

    // Update the setState method
    setState(newState) {
        super.setState(newState);
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
        
        this.setState({ expandedFolders });
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
}

export default FileList; 