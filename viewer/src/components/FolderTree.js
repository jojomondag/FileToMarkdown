import BaseComponent from './BaseComponent';
import FolderNode from './FolderNode';
import DOMUtils from '../utils/domUtils';
import { FOLDER_STATES_KEY } from '../utils/constants';

class FolderTree extends BaseComponent {
    constructor(container, fileManager) {
        super(container);
        this.fileManager = fileManager;
        this.folderStates = new Map();
        this.folderNodes = new Map();
        this.loadFolderStates();
    }

    loadFolderStates() {
        const savedStates = JSON.parse(localStorage.getItem(FOLDER_STATES_KEY) || '{}');
        Object.entries(savedStates).forEach(([id, isCollapsed]) => {
            this.folderStates.set(id, isCollapsed);
        });
    }

    saveFolderStates() {
        const states = Object.fromEntries(this.folderStates);
        localStorage.setItem(FOLDER_STATES_KEY, JSON.stringify(states));
    }

    handleFolderToggle({ path, isCollapsed }) {
        const folderId = DOMUtils.getFolderId(path);
        this.folderStates.set(folderId, isCollapsed);
        this.saveFolderStates();
        this.emit('folderStateChange', { folderPath: path, isCollapsed });
    }

    createFileNode(name, index, prefix, level) {
        const link = this.createElement('a', {
            href: '#',
            title: `${prefix}${name}`
        }, `${DOMUtils.getIndentation(level)}${name}`);

        link.addEventListener('click', (e) => {
            e.preventDefault();
            this.emit('fileSelect', { index });
        });

        return this.createElement('li', {}, link.outerHTML);
    }

    createFolderNode(name, path, level) {
        const folderId = DOMUtils.getFolderId(path);
        const isCollapsed = this.folderStates.get(folderId) || false;

        const folderNode = new FolderNode(this.createElement('li'), {
            name,
            path,
            level,
            isCollapsed
        });

        folderNode.on('folderToggle', this.handleFolderToggle.bind(this));
        this.folderNodes.set(path, folderNode);
        folderNode.mount();

        return folderNode.container;
    }

    renderTree(node, prefix = '', level = 0) {
        const list = this.createElement('ul');
        const entries = Object.entries(node).sort(([aKey, aVal], [bKey, bVal]) => {
            const aIsFile = 'index' in aVal;
            const bIsFile = 'index' in bVal;
            return aIsFile !== bIsFile ? (aIsFile ? 1 : -1) : aKey.localeCompare(bKey);
        });

        entries.forEach(([name, value]) => {
            const isFile = 'index' in value;
            if (isFile) {
                list.appendChild(this.createFileNode(name, value.index, prefix, level));
            } else {
                const folderPath = prefix + name;
                const folderNode = this.createFolderNode(name, folderPath, level);
                const folderContent = folderNode.querySelector('.folder-content');
                folderContent.appendChild(this.renderTree(value, `${folderPath}/`, level + 1));
                list.appendChild(folderNode);
            }
        });

        return list;
    }

    render() {
        const tree = this.fileManager.createFileTree();
        this.container.replaceChildren(this.renderTree(tree));
    }

    unmount() {
        this.folderNodes.forEach(node => node.unmount());
        this.folderNodes.clear();
        super.unmount();
    }
}

export default FolderTree; 