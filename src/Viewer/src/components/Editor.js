import BaseComponent from './BaseComponent';

/**
 * Editor component for editing markdown files
 */
class Editor extends BaseComponent {
    constructor(container, options = {}) {
        super(container);
        this.options = options;
        this.content = '';
        this.render();
    }

    setContent(content) {
        this.content = content;
        if (this.textarea) {
            this.textarea.value = content;
        }
    }

    getContent() {
        return this.textarea ? this.textarea.value : this.content;
    }

    render() {
        this.container.innerHTML = '';
        
        this.textarea = document.createElement('textarea');
        this.textarea.className = 'markdown-editor';
        this.textarea.value = this.content;
        
        if (this.options.autoFocus) {
            this.textarea.focus();
        }
        
        this.container.appendChild(this.textarea);
    }
}

export default Editor; 