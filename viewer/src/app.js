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
        this.fileListComponent.on('fileSelect', ({ index }) => {
            this.loadFile(index);
        });
    }

    setupEventListeners() {
        // Drop zone handling
        this.elements.dropZone.addEventListener('click', () => {
            this.createAndClickFileInput();
        });
        
        ['dragover', 'dragleave', 'drop'].forEach(event => {
            this.elements.dropZone.addEventListener(event, e => {
                e.preventDefault();
                e.stopPropagation();
                this.elements.dropZone.classList.toggle('d', event === 'dragover');
                if (event === 'drop') {
                    this.handleFiles(Array.from(e.dataTransfer.files));
                }
            });
        });

        // Prevent browser default drag behavior
        ['dragover', 'drop'].forEach(event => {
            document.addEventListener(event, e => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        // Sidebar toggle
        this.elements.toggleButton.onclick = () => this.toggleSidebar();
        document.onkeydown = e => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.toggleSidebar();
            }
        };
    }
    
    createAndClickFileInput() {
        // Clean up any existing input
        const oldInput = document.getElementById('temp-file-input');
        if (oldInput) document.body.removeChild(oldInput);
        
        // Create new file input
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
        
        // Set up change handler
        tempInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
            document.body.removeChild(tempInput);
        });
        
        // Add to DOM and trigger click
        document.body.appendChild(tempInput);
        tempInput.click();
    }

    handleFiles(fileList) {
        if (this.fileManager.processFiles(fileList)) {
            this.fileListComponent.render();
            if (this.fileManager.files.length > 0) {
                this.loadFile(0);
            }
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

        const reader = new FileReader();
        reader.onload = e => {
            this.elements.content.innerHTML = this.renderer.render(e.target.result);
            this.renderer.highlightAll();
            this.setupLinkHandlers();
        };
        reader.onerror = e => {
            this.showError(`Error reading file: ${e.target.error}`);
        };
        reader.readAsText(fileInfo.file);
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
        const currentFile = this.fileManager.files[this.fileManager.currentFileIndex];
        const currentPath = currentFile.path;
        const currentDir = currentPath.split('/').slice(0, -1).join('/');

        let targetPath = this.resolvePath(href, currentDir);
        const fileIndex = this.fileManager.fileMap.get(targetPath.toLowerCase());
        
        if (fileIndex !== undefined) {
            this.loadFile(fileIndex);
        } else {
            this.elements.content.innerHTML = `
                <div style="color: red; padding: 20px; border: 1px solid #ffcdd2; background: #ffebee; border-radius: 4px;">
                    <h3>File Not Found</h3>
                    <p>The linked file "${href}" is not loaded in the viewer.</p>
                    <p>Please make sure to load all related Markdown files together.</p>
                </div>
            `;
        }
    }

    resolvePath(href, currentDir) {
        if (href.startsWith('./')) {
            return currentDir + '/' + href.slice(2);
        } else if (href.startsWith('../')) {
            const parts = currentDir.split('/');
            const upCount = (href.match(/^\.\.\//g) || []).length;
            return parts.slice(0, -upCount).join('/') + '/' + href.replace(/^\.\.\//g, '');
        } else if (!href.startsWith('/')) {
            return currentDir + '/' + href;
        }
        return href;
    }

    toggleSidebar() {
        this.elements.sidebar.classList.toggle('hidden');
        this.elements.main.classList.toggle('expanded');
        this.elements.toggleButton.classList.toggle('n');
        localStorage.setItem('sidebarHidden', this.elements.sidebar.classList.contains('hidden'));
    }

    restoreSidebarState() {
        if (localStorage.getItem('sidebarHidden') === 'true') {
            this.elements.sidebar.classList.add('hidden');
            this.elements.main.classList.add('expanded');
            this.elements.toggleButton.classList.add('n');
        }
    }
}

// Initialize app on window load
window.onload = () => {
    window.viewer = new FileToMarkdownViewer();
};

export default FileToMarkdownViewer; 