import { FILE_EXTENSIONS } from './constants';

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
        
        // First, determine the root folder name from the first file
        for (const file of fileList) {
            if (file.webkitRelativePath) {
                this.rootFolder = file.webkitRelativePath.split('/')[0];
                break;
            }
        }
        
        for (const file of fileList) {
            if (file.name.toLowerCase().endsWith(FILE_EXTENSIONS.MARKDOWN)) {
                // Handle both drag-drop and folder picker cases
                let relativePath;
                if (file.webkitRelativePath) {
                    // For folder picker, keep the full structure
                    relativePath = file.webkitRelativePath;
                } else {
                    // For drag-drop, place at root level
                    relativePath = file.name;
                }

                const pathParts = relativePath.split('/');
                const fileInfo = {
                    file: file,
                    path: relativePath,
                    name: pathParts[pathParts.length - 1],
                    folder: pathParts.slice(0, -1).join('/'),
                    depth: pathParts.length - 1,
                    isRoot: pathParts.length === 1
                };

                // Build folder structure starting from root
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

                // Add file to its parent folder's files
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

    createFileTree() {
        const tree = {};
        this.files.forEach((fileInfo, index) => {
            const parts = fileInfo.path.split('/');
            let current = tree;
            parts.forEach((part, i) => {
                if (i === parts.length - 1) {
                    current[part] = { index, fileInfo };
                } else {
                    current[part] = current[part] || {
                        isFolder: true,
                        path: parts.slice(0, i + 1).join('/'),
                        children: {}
                    };
                    current = current[part].children;
                }
            });
        });
        return tree;
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

        const currentPath = currentFile.path;
        const currentDir = this.getFolderPath(currentPath);

        if (href.startsWith('./')) {
            return `${currentDir}/${href.slice(2)}`;
        } else if (href.startsWith('../')) {
            const parts = currentDir.split('/');
            const upCount = (href.match(/^\.\.\//g) || []).length;
            return parts.slice(0, -upCount).join('/') + '/' + href.replace(/^\.\.\//g, '');
        } else if (!href.startsWith('/')) {
            return `${currentDir}/${href}`;
        }

        return href;
    }
}

export default FileManager; 