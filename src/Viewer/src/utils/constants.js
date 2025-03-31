/**
 * Application constants
 */

// CSS Classes
export const CSS_CLASSES = {
    COLLAPSED: 'collapsed',
    FOLDER_CONTENT: 'folder-content',
    ACTIVE: 'active',
    SELECTED: 'selected',
    ERROR: 'error'
};

// UI Icons
export const ICONS = {
    FILE: '📄',
    FOLDER_OPEN: '📂',
    FOLDER_CLOSED: '📁',
    MARKDOWN: '📝'
};

// DOM Attributes
export const DOM_ATTRIBUTES = {
    DATA_FOLDER: 'data-folder',
    DATA_PATH: 'data-path',
    DATA_INDEX: 'data-index'
};

// File extensions and their MIME types
export const FILE_EXTENSIONS = {
    'md': 'text/markdown',
    'markdown': 'text/markdown',
    'mdown': 'text/markdown'
};

// Language mappings for syntax highlighting
export const LANGUAGE_MAPPINGS = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'php': 'php',
    'html': 'markup',
    'vue': 'markup',
    'svelte': 'markup',
    'shell': 'bash',
    'sh': 'bash',
    'bat': 'batch',
    'cs': 'csharp',
    'csharp': 'csharp',
    'java': 'java',
    'go': 'go',
    'rust': 'rust',
    'rs': 'rust',
    'c': 'c',
    'cpp': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'md': 'markdown',
    'json': 'json',
    'yaml': 'yaml',
    'yml': 'yaml',
    'css': 'css',
    'scss': 'scss',
    'sass': 'sass',
    'sql': 'sql',
    'graphql': 'graphql',
    'xml': 'xml'
};

// API Endpoints
export const API_ENDPOINTS = {
    FILE: '/api/file'
};

// Event types
export const EVENTS = {
    FILE_CHANGE: 'fileChanged',
    FILE_LIST_CHANGE: 'fileListChanged',
    FILE_SELECT: 'fileSelect'
}; 