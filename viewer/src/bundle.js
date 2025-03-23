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

// Renderer for markdown content
class BrowserRenderer {
    constructor() {
        this.configureMarked();
        if (typeof window !== 'undefined') {
            window.Prism = Prism;
        }
    }

    configureMarked() {
        const langMappings = {
            'js': 'javascript',
            'py': 'python',
            'html': 'markup',
            'vue': 'markup',
            'svelte': 'markup',
            'shell': 'bash',
            'cs': 'csharp',
            'csharp': 'csharp',
            'java': 'java'
        };

        const highlightCode = (code, lang) => {
            try {
                const language = langMappings[lang] || lang;
                return Prism.languages[language] 
                    ? Prism.highlight(code, Prism.languages[language], language)
                    : code;
            } catch {
                return code;
            }
        };

        marked.setOptions({
            highlight: highlightCode,
            langPrefix: 'language-',
            gfm: true,
            breaks: true
        });
    }

    render(content) {
        return marked.parse(content);
    }

    highlightAll() {
        Prism?.highlightAll();
    }
}

// Main application class
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

// Export all modules
window.FileManager = FileManager;
window.FileList = FileList;
window.DOMUtils = DOMUtils;
window.BrowserRenderer = BrowserRenderer;
window.FileToMarkdownViewer = FileToMarkdownViewer; 