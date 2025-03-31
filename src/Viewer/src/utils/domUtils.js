import { CSS_CLASSES } from './constants';

class DOMUtils {
    static createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
        if (content) element.innerHTML = content;
        return element;
    }

    static toggleClass(element, className) { element.classList.toggle(className); }
    static addClass(element, className) { element.classList.add(className); }
    static removeClass(element, className) { element.classList.remove(className); }
    static hasClass(element, className) { return element.classList.contains(className); }
    static getFolderId(path) { return `folder-${path}`.replace(/[^a-z0-9]/gi, '-'); }
    static getIndentation(level) { return '&nbsp;'.repeat(level * 2); }
    static isElementCollapsed(element) { return element.classList.contains(CSS_CLASSES.COLLAPSED); }

    static setCollapsed(element, isCollapsed) {
        if (isCollapsed) element.classList.add(CSS_CLASSES.COLLAPSED);
        else element.classList.remove(CSS_CLASSES.COLLAPSED);
    }

    static clearElement(element) {
        element.innerHTML = '';
    }

    static replaceChildren(element, newChild) {
        element.replaceChildren(newChild);
    }

    static appendChild(element, child) {
        element.appendChild(child);
    }

    static removeElement(element) {
        element.parentNode?.removeChild(element);
    }

    static setDisplay(element, display) {
        element.style.display = display;
    }

    static setVisibility(element, visible) {
        element.style.display = visible ? 'block' : 'none';
    }
}

/**
 * DOM utility functions for creating and manipulating elements
 */

/**
 * Create an element with attributes and styles
 * @param {string} tag - The HTML tag name
 * @param {Object} options - Element configuration options
 * @param {string} [options.id] - Element ID
 * @param {string} [options.className] - Element class name
 * @param {Object} [options.style] - Style object with camelCased properties
 * @param {string} [options.innerHTML] - Inner HTML content
 * @param {Object} [options.dataset] - Dataset attributes
 * @param {Function} [options.onclick] - Click event handler
 * @param {Function} [options.onchange] - Change event handler
 * @param {Object} [options.attributes] - Additional attributes to set
 * @returns {HTMLElement} The created element
 */
export function createElementWithAttributes(tag, options = {}) {
    const element = document.createElement(tag);
    
    // Apply ID if specified
    if (options.id) element.id = options.id;
    
    // Apply classes if specified
    if (options.className) element.className = options.className;
    
    // Apply styles if specified
    if (options.style && typeof options.style === 'object') {
        Object.entries(options.style).forEach(([prop, value]) => {
            element.style[prop] = value;
        });
    }
    
    // Set innerHTML if specified
    if (options.innerHTML !== undefined) element.innerHTML = options.innerHTML;
    
    // Set text content if specified
    if (options.textContent !== undefined) element.textContent = options.textContent;
    
    // Add data attributes if specified
    if (options.dataset && typeof options.dataset === 'object') {
        Object.entries(options.dataset).forEach(([key, value]) => {
            element.dataset[key] = value;
        });
    }
    
    // Add event handlers
    if (options.onclick) element.onclick = options.onclick;
    if (options.onchange) element.onchange = options.onchange;
    
    // Add additional attributes
    if (options.attributes && typeof options.attributes === 'object') {
        Object.entries(options.attributes).forEach(([attr, value]) => {
            element.setAttribute(attr, value);
        });
    }
    
    return element;
}

/**
 * Sanitize text to prevent XSS attacks
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
export function sanitizeText(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Find all elements matching a selector and apply a callback function
 * @param {string} selector - CSS selector
 * @param {Function} callback - Function to apply to each element
 */
export function applyToElements(selector, callback) {
    document.querySelectorAll(selector).forEach(callback);
}

/**
 * Create a document fragment from HTML string
 * @param {string} html - HTML string
 * @returns {DocumentFragment} Document fragment
 */
export function createFragmentFromHTML(html) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content;
}

export default DOMUtils; 