import { createElementWithAttributes } from '../utils/domUtils';
import EventEmitter from '../utils/eventEmitter';

/**
 * FileList component for rendering and interacting with the file tree
 */
class FileList extends EventEmitter {
    constructor(container, fileManager) {
        super();
        this.container = container;
        this.fileManager = fileManager;
        
        // Register this component with the file manager
        this.fileManager.registerFileListComponent(this);
        
        // Set initial state
        this.state = {
            selectedIndex: this.fileManager.currentFileIndex || -1,
            expandedFolders: this.getSavedExpandedFolders() || new Set()
        };
        
        // Listen for file list changes
        window.addEventListener('fileListChanged', () => {
            console.log('FileList: Handling fileListChanged event');
            
            // Update selected index to match file manager's current file
            this.setState({ 
                selectedIndex: this.fileManager.currentFileIndex || -1
            });
            
            this.render();
        });
        
        // Initial render
        this.render();
    }
    
    /**
     * Update component state
     * @param {Object} newState - New state properties to merge
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
    }
    
    /**
     * Get saved expanded folders from localStorage
     */
    getSavedExpandedFolders() {
        try {
            const savedFolders = localStorage.getItem('expandedFolders');
            if (savedFolders) {
                const folderArray = JSON.parse(savedFolders);
                return new Set(folderArray);
            }
        } catch (e) {
            console.error('Error loading expanded folders state:', e);
        }
        return new Set();
    }
    
    /**
     * Save expanded folders to localStorage
     */
    saveExpandedFolders() {
        try {
            const folderArray = Array.from(this.state.expandedFolders);
            localStorage.setItem('expandedFolders', JSON.stringify(folderArray));
        } catch (e) {
            console.error('Error saving expanded folders state:', e);
        }
    }
    
    /**
     * Render component
     */
    render() {
        console.log('Rendering FileList component');
        
        // Clear container
        this.container.innerHTML = '';
        
        // Check if we have any files
        if (!this.fileManager.files || this.fileManager.files.length === 0) {
            this.renderEmptyState();
            return;
        }
        
        // Create file tree
        const fileTree = createElementWithAttributes('ul', {
            className: 'file-tree'
        });
        
        try {
            // Render root folders
            if (this.fileManager.folderStructure && this.fileManager.folderStructure.size > 0) {
                const rootFolders = Array.from(this.fileManager.folderStructure.values())
                    .filter(folder => folder && folder.isRoot) // Filter out undefined values
                    .sort((a, b) => {
                        if (!a || !a.name) return 1;
                        if (!b || !b.name) return -1;
                        return a.name.localeCompare(b.name);
                    });
                
                console.log(`FileList: Rendering ${rootFolders.length} root folders`);
                
                for (const folder of rootFolders) {
                    if (folder && folder.path) {
                        try {
                            const folderElement = this.renderFolder(folder);
                            fileTree.appendChild(folderElement);
                        } catch (err) {
                            console.error(`Error rendering folder ${folder.path}:`, err);
                        }
                    }
                }
            }
            
            // Render root files (files without folders)
            const rootFiles = this.fileManager.files
                .filter(file => file && file.isRoot) // Filter out undefined values and ensure isRoot
                .sort((a, b) => {
                    if (!a || !a.name) return 1;
                    if (!b || !b.name) return -1;
                    return a.name.localeCompare(b.name);
                });
            
            console.log(`FileList: Rendering ${rootFiles.length} root files`);
            
            for (const file of rootFiles) {
                if (file && file.path) {
                    try {
                        const fileIndex = this.fileManager.findFileByPath(file.path);
                        if (fileIndex !== undefined) {
                            const fileElement = this.renderFileItem(file, fileIndex);
                            fileTree.appendChild(fileElement);
                        }
                    } catch (err) {
                        console.error(`Error rendering file ${file.path}:`, err);
                    }
                }
            }
        } catch (error) {
            console.error('Error rendering file list:', error);
            this.renderEmptyState();
            return;
        }
        
        // Add file tree to container
        this.container.appendChild(fileTree);
    }
    
    /**
     * Render empty state
     */
    renderEmptyState() {
        const emptyMessage = createElementWithAttributes('div', {
            className: 'empty-state',
            style: {
                padding: '20px',
                textAlign: 'center',
                color: '#666'
            },
            innerHTML: '<p>No files loaded</p>'
        });
        
        this.container.appendChild(emptyMessage);
    }
    
    /**
     * Render a folder and its contents
     * @param {Object} folder - Folder info object
     * @returns {HTMLElement} Folder list item
     */
    renderFolder(folder) {
        if (!folder || !folder.path) {
            console.error('Invalid folder object:', folder);
            return document.createElement('li'); // Return empty element
        }

        const isExpanded = this.state.expandedFolders.has(folder.path);
        
        // Create folder item
        const folderItem = createElementWithAttributes('li', {
            className: `folder-item ${isExpanded ? 'expanded' : ''}`,
            'data-path': folder.path,
            'data-depth': folder.depth || 0
        });
        
        // Create folder header
        const folderHeader = createElementWithAttributes('div', {
            className: 'folder-header',
            onclick: (e) => {
                e.preventDefault();
                this.toggleFolder(folder.path);
            }
        });
        
        // Create folder icon
        const folderIcon = createElementWithAttributes('span', {
            className: 'folder-icon',
            innerHTML: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>'
        });
        
        // Create expand/collapse indicator
        const expandIcon = createElementWithAttributes('span', {
            className: 'expand-icon',
            innerHTML: isExpanded 
                ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>' 
                : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>'
        });
        
        // Create folder name
        const folderName = createElementWithAttributes('span', {
            className: 'folder-name',
            textContent: folder.name || 'Unknown folder'
        });
        
        // Assemble folder header
        folderHeader.appendChild(expandIcon);
        folderHeader.appendChild(folderIcon);
        folderHeader.appendChild(folderName);
        folderItem.appendChild(folderHeader);
        
        // Create folder contents container
        const folderContents = createElementWithAttributes('ul', {
            className: `folder-contents ${isExpanded ? '' : 'collapsed'}`,
            style: {
                display: isExpanded ? 'block' : 'none'
            }
        });
        
        // Only render contents if expanded
        if (isExpanded) {
            try {
                // Render subfolders
                if (folder.path) {
                    const subfolders = this.fileManager.getSubfolders(folder.path)
                        .filter(subfolder => subfolder && subfolder.path) // Filter undefined
                        .sort((a, b) => {
                            if (!a || !a.name) return 1;
                            if (!b || !b.name) return -1;
                            return a.name.localeCompare(b.name);
                        });
                    
                    for (const subfolder of subfolders) {
                        if (subfolder && subfolder.path) {
                            try {
                                const folderElement = this.renderFolder(subfolder);
                                folderContents.appendChild(folderElement);
                            } catch (err) {
                                console.error(`Error rendering subfolder ${subfolder.path}:`, err);
                            }
                        }
                    }
                    
                    // Render files in folder - FIXED to use indices directly
                    console.log(`Rendering files in folder: ${folder.path}`);
                    const fileIndices = this.fileManager.getFilesInFolder(folder.path);
                    console.log(`Got ${fileIndices.length} file indices for folder: ${folder.path}`);
                    
                    for (const fileIndex of fileIndices) {
                        try {
                            const fileInfo = this.fileManager.getFile(fileIndex);
                            if (fileInfo && fileInfo.path) {
                                console.log(`Rendering file: ${fileInfo.name} (${fileInfo.path})`);
                                const fileElement = this.renderFileItem(fileInfo, fileIndex);
                                folderContents.appendChild(fileElement);
                            } else {
                                console.warn(`Missing file info for index: ${fileIndex}`);
                            }
                        } catch (err) {
                            console.error(`Error rendering file at index ${fileIndex}:`, err);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error rendering contents of folder ${folder.path}:`, error);
                // Add error message to folder contents
                const errorElement = createElementWithAttributes('li', {
                    className: 'folder-error',
                    textContent: 'Error loading folder contents'
                });
                folderContents.appendChild(errorElement);
            }
        }
        
        folderItem.appendChild(folderContents);
        return folderItem;
    }
    
    /**
     * Render a file item
     * @param {Object} fileInfo - File info object
     * @param {number} index - Index in file manager
     * @returns {HTMLElement} File list item
     */
    renderFileItem(fileInfo, index) {
        const isSelected = index === this.state.selectedIndex;
        
        // Create file item
        const fileItem = createElementWithAttributes('li', {
            className: `file-item ${isSelected ? 'selected' : ''}`,
            'data-index': index,
            'data-path': fileInfo.path,
            'data-depth': fileInfo.depth || 0
        });
        
        // Create file link
        const fileLink = createElementWithAttributes('a', {
            href: '#',
            title: fileInfo.path,
            onclick: (e) => {
                e.preventDefault();
                this.setState({ selectedIndex: index });
                this.emit('fileSelect', { index, fileInfo });
            }
        });
        
        // Create file icon based on type
        const fileIcon = createElementWithAttributes('span', {
            className: 'file-icon',
            innerHTML: this.getFileIconSVG(fileInfo.name)
        });
        
        // Create file name
        const fileName = createElementWithAttributes('span', {
            className: 'file-name',
            textContent: fileInfo.name
        });
        
        // Assemble file item
        fileLink.appendChild(fileIcon);
        fileLink.appendChild(fileName);
        fileItem.appendChild(fileLink);
        
        return fileItem;
    }
    
    /**
     * Toggle folder expansion state
     * @param {string} folderPath - Path of folder to toggle
     */
    toggleFolder(folderPath) {
        console.log(`Toggling folder: ${folderPath}`);
        
        const expandedFolders = new Set(this.state.expandedFolders);
        const isExpanding = !expandedFolders.has(folderPath);
        
        if (isExpanding) {
            // Add this folder to expanded set
            expandedFolders.add(folderPath);
            
            // Make sure all parent folders are expanded too
            let parentPath = this.fileManager.getFolderInfo(folderPath)?.parent;
            while (parentPath) {
                expandedFolders.add(parentPath);
                parentPath = this.fileManager.getFolderInfo(parentPath)?.parent;
            }
        } else {
            // Remove this folder from expanded set
            expandedFolders.delete(folderPath);
            
            // Also collapse all child folders
            Array.from(expandedFolders).forEach(path => {
                if (path.startsWith(folderPath + '/')) {
                    expandedFolders.delete(path);
                }
            });
        }
        
        // Update state and save
        this.setState({ expandedFolders });
        this.saveExpandedFolders();
    }
    
    /**
     * Get SVG icon for file based on extension
     * @param {string} fileName - Name of file
     * @returns {string} SVG markup
     */
    getFileIconSVG(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        
        // Map of extensions to SVG icons
        const iconMap = {
            md: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 13h2v6M16 13h2M11 13c-.5 2.5-2.5 4-5 4"></path></svg>',
            markdown: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 13h2v6M16 13h2M11 13c-.5 2.5-2.5 4-5 4"></path></svg>',
            mdown: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M9 13h2v6M16 13h2M11 13c-.5 2.5-2.5 4-5 4"></path></svg>',
            txt: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'
        };
        
        return iconMap[extension] || '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>';
    }
}

export default FileList; 