const { MarkitDown, getFileTypes, getFileTypeDescriptions } = require('../index');
const MarkdownRenderer = require('../renderer/markdown');

// Direct API methods for programmatic use
const api = {
    /**
     * Convert a file to markdown
     * @param {string|Buffer} file - File path or buffer to convert
     * @returns {Promise<string>} Markdown content
     */
    async convertToMarkdown(file) {
        const converter = new MarkitDown();
        return converter.convertToMarkdown(file);
    },

    /**
     * Render markdown to HTML
     * @param {string} markdown - Markdown content to render
     * @param {Object} options - Rendering options
     * @param {boolean} options.highlight - Enable/disable syntax highlighting
     * @returns {string} HTML content
     */
    renderMarkdown(markdown, options = {}) {
        const renderer = new MarkdownRenderer({ 
            highlight: options.highlight !== undefined ? options.highlight : true,
            loadLanguages: true 
        });
        return renderer.render(markdown);
    },

    /**
     * Get supported file types
     * @returns {Object} Supported file types and their descriptions
     */
    getFileTypes() {
        return {
            fileTypes: getFileTypes(),
            descriptions: getFileTypeDescriptions()
        };
    }
};

// Export only the API methods
module.exports = api;