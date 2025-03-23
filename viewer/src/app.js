import FileManager from './utils/fileManager';
import BrowserRenderer from './utils/renderer';
import FileList from './components/FileList';

/**
 * Main application class for FileToMarkdown viewer
 */
class FileToMarkdownViewer {
    constructor() {
        this.fileManager = new FileManager();
        this.renderer = new BrowserRenderer();
        this.elements = this.getElements();
        this.setupComponents();
        this.setupEventListeners();
        this.restoreSidebarState();
    }

    getElements() {
        return {
            content: document.getElementById('c'),
            sidebar: document.querySelector('.p'),
            main: document.querySelector('.m'),
            fileList: document.getElementById('l'),
            dropZone: document.getElementById('z'),
            toggleButton: document.getElementById('b')
        };
    }

    setupComponents() {
        this.fileListComponent = new FileList(this.elements.fileList, this.fileManager);
        this.fileListComponent.on('fileSelect', ({ index }) => this.loadFile(index));
    }

    setupEventListeners() {
        this.elements.dropZone.addEventListener('click', () => this.createAndClickFileInput());
        
        ['dragover', 'dragleave', 'drop'].forEach(event => {
            this.elements.dropZone.addEventListener(event, e => {
                e.preventDefault();
                e.stopPropagation();
                this.elements.dropZone.classList.toggle('d', event === 'dragover');
                if (event === 'drop') this.handleFiles(Array.from(e.dataTransfer.files));
            });
        });

        ['dragover', 'drop'].forEach(event => {
            document.addEventListener(event, e => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        this.elements.toggleButton.onclick = () => this.toggleSidebar();
        document.onkeydown = e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.toggleSidebar();
            }
        };
    }
    
    createAndClickFileInput() {
        const oldInput = document.getElementById('temp-file-input');
        if (oldInput) document.body.removeChild(oldInput);
        
        const tempInput = document.createElement('input');
        Object.assign(tempInput, {
            type: 'file',
            id: 'temp-file-input',
            accept: '.md',
            multiple: true,
            webkitdirectory: true,
            directory: true,
            style: 'display:none'
        });
        
        tempInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
            document.body.removeChild(tempInput);
        });
        
        document.body.appendChild(tempInput);
        tempInput.click();
    }

    handleFiles(fileList) {
        if (this.fileManager.processFiles(fileList)) {
            this.fileListComponent.render();
            if (this.fileManager.files.length > 0) this.loadFile(0);
        } else {
            this.showError('No markdown (.md) files found in the selected files/folders.');
        }
    }

    showError(message) {
        this.elements.content.innerHTML = `<p style="color:red">${message}</p>`;
    }

    loadFile(index) {
        const fileInfo = this.fileManager.getFile(index);
        if (!fileInfo) return;

        this.fileManager.setCurrentFile(index);
        this.updateFileListSelection(index);

        const reader = new FileReader();
        reader.onload = e => {
            this.elements.content.innerHTML = this.renderer.render(e.target.result);
            this.renderer.highlightAll();
            this.setupLinkHandlers();
        };
        reader.onerror = e => this.showError(`Error reading file: ${e.target.error}`);
        reader.readAsText(fileInfo.file);
    }

    updateFileListSelection(index) {
        // Update FileList component selection state
        this.fileListComponent.setState({ selectedIndex: index });
        
        // Ensure parent folders are expanded to show the selected file
        const fileInfo = this.fileManager.getFile(index);
        if (fileInfo && fileInfo.folder) {
            this.expandParentFolders(fileInfo.folder);
        }
    }

    expandParentFolders(folderPath) {
        if (!folderPath) return;
        
        const expandedFolders = new Set(this.fileListComponent.state.expandedFolders);
        let currentPath = folderPath;
        
        // Add this folder and all parent folders to the expanded set
        while (currentPath) {
            expandedFolders.add(currentPath);
            const folderInfo = this.fileManager.getFolderInfo(currentPath);
            currentPath = folderInfo?.parent;
        }
        
        this.fileListComponent.setState({ expandedFolders });
    }

    setupLinkHandlers() {
        const links = this.elements.content.getElementsByTagName('a');
        Array.from(links).forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.endsWith('.md')) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleInternalLink(href);
                });
            }
        });
    }

    handleInternalLink(href) {
        const currentFile = this.fileManager.getCurrentFile();
        if (!currentFile) return;
        
        const currentDir = currentFile.folder || '';
        const targetPath = this.resolvePath(href, currentDir);
        
        console.log('Resolving link:', {
            href,
            currentDir,
            targetPath
        });
        
        // Try to find the file by path
        let fileIndex = this.findFileByPath(targetPath);
        
        if (fileIndex !== undefined) {
            console.log('File found, loading index:', fileIndex);
            this.loadFile(fileIndex);
        } else {
            // If not found, try case-insensitive search
            console.log('File not found by exact path, trying alternative methods');
            this.showError(`Could not find linked file: ${href}`);
        }
    }
    
    findFileByPath(targetPath) {
        // First try direct match
        let fileIndex = this.fileManager.fileMap.get(targetPath.toLowerCase());
        
        // If not found and it doesn't have a root directory, try with various folders
        if (fileIndex === undefined && !targetPath.includes('/')) {
            // Just try to find a file with this name anywhere
            for (let i = 0; i < this.fileManager.files.length; i++) {
                const file = this.fileManager.files[i];
                if (file.name.toLowerCase() === targetPath.toLowerCase()) {
                    return i;
                }
            }
        }
        
        return fileIndex;
    }

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
                for (let i = 0; i < this.fileManager.files.length; i++) {
                    const file = this.fileManager.files[i];
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

    toggleSidebar() {
        this.elements.sidebar.classList.toggle('hidden');
        this.elements.main.classList.toggle('expanded');
        this.elements.toggleButton.classList.toggle('n');
        localStorage.setItem('sidebarCollapsed', this.elements.sidebar.classList.contains('hidden'));
    }

    restoreSidebarState() {
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebarCollapsed) this.toggleSidebar();
    }
}

// Initialize app on window load
window.onload = () => {
    window.viewer = new FileToMarkdownViewer();
};

export default FileToMarkdownViewer; 