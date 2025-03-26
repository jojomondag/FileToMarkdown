import { CSS_CLASSES } from './constants';

class DOMUtils {
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
        if (content) element.innerHTML = content;
        return element;
    }

    static toggleClass(element, className) { element.classList.toggle(className); }
    static getFolderId(path) { return `folder-${path}`.replace(/[^a-z0-9]/gi, '-'); }
    static getIndentation(level) { return '&nbsp;'.repeat(level * 2); }
    static isElementCollapsed(element) { return element.classList.contains(CSS_CLASSES.COLLAPSED); }

    static setCollapsed(element, isCollapsed) {
        if (isCollapsed) element.classList.add(CSS_CLASSES.COLLAPSED);
        else element.classList.remove(CSS_CLASSES.COLLAPSED);
    }
}

export default DOMUtils; 