import BaseComponent from './BaseComponent';

/**
 * Preview component for rendering markdown content
 */
class Preview extends BaseComponent {
    constructor(container, renderer) {
        super(container);
        this.renderer = renderer;
        this.content = '';
        this.render();
    }

    setContent(content) {
        this.content = content;
        this.render();
    }

    render() {
        if (!this.renderer) {
            console.error('No renderer provided to Preview component');
            this.container.innerHTML = '<div class="error">No renderer available</div>';
            return;
        }
        
        try {
            const html = this.renderer.render(this.content || '');
            this.container.innerHTML = html;
            
            // Apply syntax highlighting if the renderer supports it
            if (typeof this.renderer.highlightAll === 'function') {
                this.renderer.highlightAll();
            }
            
            // Setup link handlers if needed
            this.setupLinkHandlers();
        } catch (error) {
            console.error('Error rendering markdown:', error);
            this.container.innerHTML = `<div class="error">Error rendering content: ${error.message}</div>`;
        }
    }
    
    setupLinkHandlers() {
        // This could be overridden or extended with specific link handling logic
        this.container.querySelectorAll('a').forEach(link => {
            // Set target="_blank" for external links
            if (link.getAttribute('href')?.startsWith('http')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }
}

export default Preview; 