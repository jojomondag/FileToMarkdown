import BaseComponent from './BaseComponent';
import DOMUtils from '../utils/domUtils';

class FileList extends BaseComponent {
    constructor(container, fileManager) {
        super(container);
        this.fileManager = fileManager;
        this.state = {
            selectedIndex: -1,
            expandedFolders: new Set()
        };

        // Debug logging
        console.log('FileList initialized');
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

        // Create container for folder contents
        const contentsContainer = this.createElement('ul', {
            class: `folder-contents ${isExpanded ? '' : 'collapsed'}`
        });
        li.appendChild(contentsContainer);

        // Add folder contents if expanded
        if (isExpanded) {
            this.renderFolderContents(folderInfo.path, contentsContainer);
        }

        return li;
    }

    toggleFolder(folderPath) {
        console.log('Toggling folder:', folderPath); // Debug log
        const expandedFolders = new Set(this.state.expandedFolders);
        const isExpanding = !expandedFolders.has(folderPath);
        
        if (isExpanding) {
            expandedFolders.add(folderPath);
            // Also expand parent folders
            let currentPath = this.fileManager.getFolderInfo(folderPath)?.parent;
            while (currentPath) {
                expandedFolders.add(currentPath);
                currentPath = this.fileManager.getFolderInfo(currentPath)?.parent;
            }
        } else {
            expandedFolders.delete(folderPath);
            // Also collapse child folders
            Array.from(expandedFolders).forEach(path => {
                if (path.startsWith(folderPath + '/')) {
                    expandedFolders.delete(path);
                }
            });
        }
        
        this.setState({ expandedFolders });
        console.log('Expanded folders:', Array.from(expandedFolders)); // Debug log
    }

    renderFolderContents(folderPath, container) {
        const folder = this.fileManager.getFolderInfo(folderPath);
        if (!folder) {
            console.warn('No folder found for path:', folderPath); // Debug log
            return;
        }

        // First render subfolders
        const subfolders = this.fileManager.getSubfolders(folderPath)
            .sort((a, b) => a.name.localeCompare(b.name));
        
        console.log('Subfolders for', folderPath, ':', subfolders); // Debug log
        
        subfolders.forEach(subfolder => {
            container.appendChild(this.createFolderItem(subfolder));
        });

        // Then render files
        const files = this.fileManager.getFilesInFolder(folderPath);
        console.log('Files in folder', folderPath, ':', files); // Debug log
        
        files.forEach(fileIndex => {
            const fileInfo = this.fileManager.getFile(fileIndex);
            container.appendChild(this.createFileItem(fileInfo, fileIndex));
        });
    }

    render() {
        console.log('Rendering file list'); // Debug log
        console.log('File manager state:', {
            files: this.fileManager.files,
            structure: this.fileManager.folderStructure
        });

        const rootList = this.createElement('ul', {
            class: 'file-tree'
        });

        // Get root level items
        const rootFolders = Array.from(this.fileManager.folderStructure.values())
            .filter(f => f.isRoot)
            .sort((a, b) => a.name.localeCompare(b.name));

        const rootFiles = this.fileManager.files
            .filter(f => f.isRoot)
            .sort((a, b) => a.name.localeCompare(b.name));

        console.log('Root items:', { folders: rootFolders, files: rootFiles }); // Debug log

        // First render root folders
        rootFolders.forEach(folder => {
            rootList.appendChild(this.createFolderItem(folder));
        });

        // Then render root files
        rootFiles.forEach((fileInfo, index) => {
            rootList.appendChild(this.createFileItem(fileInfo, index));
        });

        this.container.replaceChildren(rootList);
    }
}

export default FileList; 