// FileToMarkdown Viewer Bundle - 2025-03-23T11:27:56.690Z

// File: utils/constants.js
const FOLDER_STATES_KEY = 'folderStates';

const CSS_CLASSES = {
    COLLAPSED: 'collapsed',
    FOLDER_CONTENT: 'folder-content'
};

const ICONS = {
    FILE: '📄',
    FOLDER_OPEN: '📂',
    FOLDER_CLOSED: '📁'
};

const DOM_ATTRIBUTES = {
    DATA_FOLDER: 'data-folder'
};

const FILE_EXTENSIONS = {
    MARKDOWN: '.md'
};

const LANGUAGE_MAPPINGS = {
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
// File: utils/domUtils.js


class DOMUtils {
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => {
            element.setAttribute(key, value);
        });
        if (content) element.innerHTML = content;
        return element;
    }

    static toggleClass(element, className) {
        element.classList.toggle(className);
    }

    static getAttribute(element, attribute) {
        return element.getAttribute(attribute);
    }

    static dispatchCustomEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        window.dispatchEvent(event);
    }

    static getFolderId(path) {
        return `folder-${path}`.replace(/[^a-z0-9]/gi, '-');
    }

    static getIndentation(level) {
        return '&nbsp;'.repeat(level * 2);
    }

    static isElementCollapsed(element) {
        return element.classList.contains(CSS_CLASSES.COLLAPSED);
    }

    static setCollapsed(element, isCollapsed) {
        if (isCollapsed) {
            element.classList.add(CSS_CLASSES.COLLAPSED);
        } else {
            element.classList.remove(CSS_CLASSES.COLLAPSED);
        }
    }
}

// export DOMUtils; 
// File: components/BaseComponent.js


class BaseComponent {
    constructor(container) {
        this.container = container;
        this.state = {};
        this.events = new Map();
    }

    setState(newState) {
        this.state = {...this.state, ...newState};
        this.render();
    }

    on(eventName, callback) {
        if (!this.events.has(eventName)) this.events.set(eventName, new Set());
        this.events.get(eventName).add(callback);
    }

    emit(eventName, data) {
        if (this.events.has(eventName)) 
            this.events.get(eventName).forEach(callback => callback(data));
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

// export BaseComponent; 
// File: utils/fileManager.js


class FileManager {
    constructor() {
        this.files = [];
        this.fileMap = new Map();
        this.folderStructure = new Map();
        this.currentFileIndex = -1;
        this.rootFolder = null;
    }

    processFiles(fileList) {
        const markdownFiles = [];
        this.folderStructure.clear();
        
        for (const file of fileList) {
            if (file.webkitRelativePath) {
                this.rootFolder = file.webkitRelativePath.split('/')[0];
                break;
            }
        }
        
        for (const file of fileList) {
            if (file.name.toLowerCase().endsWith(FILE_EXTENSIONS.MARKDOWN)) {
                let relativePath = file.webkitRelativePath || file.name;
                const pathParts = relativePath.split('/');
                const fileInfo = {
                    file: file,
                    path: relativePath,
                    name: pathParts[pathParts.length - 1],
                    folder: pathParts.slice(0, -1).join('/'),
                    depth: pathParts.length - 1,
                    isRoot: pathParts.length === 1
                };

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

                if (fileInfo.folder) {
                    this.folderStructure.get(fileInfo.folder).files.add(relativePath);
                }

                markdownFiles.push(fileInfo);
            }
        }

        if (markdownFiles.length) {
            this.files = markdownFiles;
            this.updateFileMap();
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
            return parts.length > 1
                ? `${parts.slice(0, -1).join('/')}/${href.slice(3)}`
                : href.slice(3);
        } else if (!href.startsWith('/')) {
            return currentDir ? `${currentDir}/${href}` : href;
        }
        return href.slice(1);
    }
}

// export FileManager; 
// File: components/FileList.js


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

        const rootFolders = Array.from(this.fileManager.folderStructure.values())
            .filter(f => f.isRoot)
            .sort((a, b) => a.name.localeCompare(b.name));

        const rootFiles = this.fileManager.files
            .filter(f => f.isRoot)
            .sort((a, b) => a.name.localeCompare(b.name));

        rootFolders.forEach(folder => {
            rootList.appendChild(this.createFolderItem(folder));
        });

        rootFiles.forEach((fileInfo, index) => {
            rootList.appendChild(this.createFileItem(fileInfo, index));
        });

        this.container.replaceChildren(rootList);
    }
}

// export FileList; 
// File: utils/renderer.js


/**
 * Renderer for markdown content with syntax highlighting
 */
class BrowserRenderer {
    constructor() {
        this.configureMarked();
        if (typeof window !== 'undefined') window.Prism = Prism;
    }

    configureMarked() {
        const highlightCode = (code, lang) => {
            try {
                const language = LANGUAGE_MAPPINGS[lang] || lang;
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

// export BrowserRenderer; 
// File: app.js




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

// export FileToMarkdownViewer; 

// Export all modules for global use
window.FileManager = FileManager;
window.FileList = FileList;
window.DOMUtils = DOMUtils;
window.BrowserRenderer = BrowserRenderer;
window.FileToMarkdownViewer = FileToMarkdownViewer;
