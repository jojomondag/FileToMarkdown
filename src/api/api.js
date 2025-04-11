// Create a simple MarkitDown class for direct use
class MarkitDown {
    constructor(options = {}) {
        this.options = options;
    }

    async convertToMarkdown(inputPath) {
        // This is just a stub since we've removed the renderer functionality
        // The actual conversion still happens through the main module
        // In a real implementation, we would forward this to the external renderer service
        return `# File converted to Markdown\n\nPlease use the external renderer service at http://localhost:3000`;
    }
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
     * Get supported file types
     * @returns {Object} Supported file types and their descriptions
     */
    getFileTypes() {
        return {
            fileTypes: ['md', 'pdf', 'txt', 'docx', 'pptx', 'xlsx', '7z', 'zip'],
            descriptions: {
                'md': 'Markdown file (passthrough)',
                'pdf': 'PDF Documents',
                'txt': 'Text Files',
                'docx': 'Word Documents',
                'pptx': 'PowerPoint Presentations',
                'xlsx': 'Excel Spreadsheets',
                '7z': '7-Zip Archives',
                'zip': 'ZIP Archives'
            }
        };
    }
};

// Export only the API methods
module.exports = api;