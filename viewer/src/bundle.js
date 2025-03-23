// Constants
const FILE_EXTENSIONS = {
    MARKDOWN: '.md'
};

const FOLDER_STATES_KEY = 'folderStates';

// DOM Utils
const DOMUtils = {
    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        if (content) element.innerHTML = content;
        return element;
    },

    getFolderId(path) {
        return `folder-${path}`.replace(/[^a-z0-9]/gi, '-');
    }
};

// Base Component
class BaseComponent {
    constructor(container) {
        this.container = container;
        this.state = {};
        this.events = new Map();
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
    }

    on(eventName, callback) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, new Set());
        }
        this.events.get(eventName).add(callback);
    }

    emit(eventName, data) {
        if (this.events.has(eventName)) {
            this.events.get(eventName).forEach(callback => callback(data));
        }
    }

    createElement(tag, attributes = {}, content = '') {
        return DOMUtils.createElement(tag, attributes, content);
    }

    render() {
        throw new Error('render() method must be implemented');
    }

    mount() {
        this.render();
    }

    unmount() {
        this.events.clear();
        this.container.innerHTML = '';
    }
}

// File Manager
class FileManager {
    constructor() {
        this.files = [];
        this.fileMap = new Map();
        this.folderStructure = new Map();
        this.currentFileIndex = -1;
    }

    processFiles(fileList) {
        const markdownFiles = [];
        this.folderStructure.clear();
        
        for (const file of fileList) {
            if (file.name.toLowerCase().endsWith(FILE_EXTENSIONS.MARKDOWN)) {
                const relativePath = file.webkitRelativePath || file.name;
                const pathParts = relativePath.split('/');
                const isSimpleFile = pathParts.length === 1;
                
                const fileInfo = this.createFileInfo(file, relativePath, pathParts);
                markdownFiles.push(fileInfo);
                
                if (!isSimpleFile) {
                    this.processFolderStructure(pathParts, relativePath);
                }
            }
        }

        if (markdownFiles.length) {
            this.files = markdownFiles;
            this.updateFileMap();
            return true;
        }
        return false;
    }

    createFileInfo(file, relativePath, pathParts) {
        if (pathParts.length === 1) {
            return {
                file,
                path: file.name,
                name: file.name,
                folder: '',
                depth: 0,
                isRoot: true
            };
        }
        
        return {
            file,
            path: relativePath,
            name: pathParts[pathParts.length - 1],
            folder: pathParts.slice(0, -1).join('/'),
            depth: pathParts.length - 1,
            isRoot: false
        };
    }

    processFolderStructure(pathParts, relativePath) {
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
        
        // Add file to its folder
        const folder = pathParts.slice(0, -1).join('/');
        this.folderStructure.get(folder).files.add(relativePath);
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

    getFolderInfo(path) {
        return this.folderStructure.get(path);
    }

    getFilesInFolder(folderPath) {
        if (!folderPath) {
            // Return root-level files
            return this.files
                .filter(file => !file.folder)
                .map((_, index) => index);
        }
        const folder = this.folderStructure.get(folderPath);
        return folder ? Array.from(folder.files).map(path => this.fileMap.get(path.toLowerCase())) : [];
    }

    getSubfolders(folderPath) {
        const folder = folderPath ? this.folderStructure.get(folderPath) : null;
        if (!folder) {
            // Return root-level folders
            return Array.from(this.folderStructure.values()).filter(f => f.isRoot);
        }
        return Array.from(folder.children).map(path => this.folderStructure.get(path));
    }
}

// File List Component
class FileList extends BaseComponent {
    constructor(container, fileManager) {
        super(container);
        this.fileManager = fileManager;
        this.state = {
            selectedIndex: -1,
            expandedFolders: new Set()
        };
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

        if (isExpanded) {
            this.renderFolderContents(folderInfo.path, contentsContainer);
        }

        return li;
    }

    toggleFolder(folderPath) {
        const expandedFolders = new Set(this.state.expandedFolders);
        const isExpanding = !expandedFolders.has(folderPath);
        
        if (isExpanding) {
            this.expandFolder(folderPath, expandedFolders);
        } else {
            this.collapseFolder(folderPath, expandedFolders);
        }
        
        this.setState({ expandedFolders });
    }

    expandFolder(folderPath, expandedFolders) {
        expandedFolders.add(folderPath);
        
        // Ensure all parent folders are expanded too
        let currentPath = this.fileManager.getFolderInfo(folderPath)?.parent;
        while (currentPath) {
            expandedFolders.add(currentPath);
            currentPath = this.fileManager.getFolderInfo(currentPath)?.parent;
        }
    }

    collapseFolder(folderPath, expandedFolders) {
        expandedFolders.delete(folderPath);
        
        // Also collapse all child folders
        Array.from(expandedFolders).forEach(path => {
            if (path.startsWith(folderPath + '/')) {
                expandedFolders.delete(path);
            }
        });
    }

    renderFolderContents(folderPath, container) {
        const folder = this.fileManager.getFolderInfo(folderPath);
        if (!folder) return;

        // Add subfolders first
        const subfolders = this.fileManager.getSubfolders(folderPath)
            .sort((a, b) => a.name.localeCompare(b.name));
        
        subfolders.forEach(subfolder => {
            container.appendChild(this.createFolderItem(subfolder));
        });

        // Then add files
        const files = this.fileManager.getFilesInFolder(folderPath);
        files.forEach(fileIndex => {
            const fileInfo = this.fileManager.getFile(fileIndex);
            container.appendChild(this.createFileItem(fileInfo, fileIndex));
        });
    }

    render() {
        this.container.innerHTML = '';
        const rootList = this.createElement('ul');
        
        // Add root level files first
        const rootFiles = this.fileManager.getFilesInFolder('');
        rootFiles.forEach(index => {
            const fileInfo = this.fileManager.getFile(index);
            if (fileInfo && fileInfo.isRoot) {
                rootList.appendChild(this.createFileItem(fileInfo, index));
            }
        });
        
        // Then add folders
        const rootFolders = this.fileManager.getSubfolders('');
        rootFolders.forEach(folderInfo => {
            rootList.appendChild(this.createFolderItem(folderInfo));
        });
        
        this.container.appendChild(rootList);
    }
}

// Export all modules
window.FileManager = FileManager;
window.FileList = FileList;
window.DOMUtils = DOMUtils; 