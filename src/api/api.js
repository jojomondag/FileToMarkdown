const { MarkitDown, getFileTypes, getFileTypeDescriptions } = require('../index');
const MarkdownRenderer = require('../renderer/markdown');

/**
 * Create a configured markdown renderer with file types
 * @param {Object} options Additional renderer options
 * @returns {MarkdownRenderer} Configured renderer instance
 */
function createRenderer(options = {}) {
    // Get file types from the main module
    const fileTypes = getFileTypes();
    const descriptions = getFileTypeDescriptions();
    
    // Create and return renderer with file types included
    return new MarkdownRenderer({
        highlight: options.highlight !== undefined ? options.highlight : true,
        loadLanguages: true,
        // Pass file types to the renderer
        dynamicFileTypes: {
            fileTypes,
            descriptions
        },
        ...options
    });
}

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
        const renderer = createRenderer(options);
        return renderer.render(markdown);
    },

    /**
     * Read a markdown file and render it to HTML
     * @param {string} filePath - Path to markdown file
     * @param {Object} options - Rendering options
     * @param {boolean} options.highlight - Enable/disable syntax highlighting
     * @returns {Promise<string>} HTML content
     */
    async renderMarkdownFromFile(filePath, options = {}) {
        const renderer = createRenderer(options);
        return renderer.readMarkdownFromFile(filePath);
    },

    /**
     * Read a markdown file and render it to HTML synchronously
     * @param {string} filePath - Path to markdown file
     * @param {Object} options - Rendering options
     * @param {boolean} options.highlight - Enable/disable syntax highlighting
     * @returns {string} HTML content
     */
    renderMarkdownFromFileSync(filePath, options = {}) {
        const renderer = createRenderer(options);
        return renderer.readMarkdownFromFileSync(filePath);
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