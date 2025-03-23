import BaseComponent from './BaseComponent';
import DOMUtils from '../utils/domUtils';
import { CSS_CLASSES, DOM_ATTRIBUTES } from '../utils/constants';

class FolderNode extends BaseComponent {
    constructor(container, { name, path, level, isCollapsed = false }) {
        super(container);
        this.state = { name, path, level, isCollapsed };
    }

    toggleCollapse() {
        this.setState({ 
            isCollapsed: !this.state.isCollapsed 
        });
        
        this.emit('folderToggle', {
            path: this.state.path,
            isCollapsed: this.state.isCollapsed
        });
    }

    createFolderHeader() {
        const indent = DOMUtils.getIndentation(this.state.level);
        const folderId = DOMUtils.getFolderId(this.state.path);
        
        const header = this.createElement('a', {
            href: '#',
            [DOM_ATTRIBUTES.DATA_FOLDER]: '',
            [DOM_ATTRIBUTES.DATA_TARGET]: folderId,
            [DOM_ATTRIBUTES.DATA_PATH]: this.state.path,
            class: this.state.isCollapsed ? CSS_CLASSES.COLLAPSED : ''
        }, `${indent}${this.state.name}/`);

        header.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleCollapse();
        });

        return header;
    }

    render() {
        const folderId = DOMUtils.getFolderId(this.state.path);
        const content = this.createElement('div', {
            id: folderId,
            class: `${CSS_CLASSES.FOLDER_CONTENT} ${this.state.isCollapsed ? CSS_CLASSES.COLLAPSED : ''}`
        });

        this.container.replaceChildren(
            this.createFolderHeader(),
            content
        );
    }
}

export default FolderNode; 