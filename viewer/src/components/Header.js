import BaseComponent from './BaseComponent';

/**
 * Header component for the application
 */
class Header extends BaseComponent {
    constructor(container) {
        super(container);
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="header">
                <h1>FileToMarkdown Viewer</h1>
            </div>
        `;
    }
}

export default Header; 