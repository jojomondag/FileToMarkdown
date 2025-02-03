/**
 * Markdown passthrough converter
 * Simply returns the markdown content as-is
 */
class MarkdownConverter {
    async convert(f) {
        // Convert buffer to string and return as-is since it's already markdown
        const fs = require('fs').promises;
        return (await fs.readFile(f, 'utf-8')).toString();
    }
}

// Add description to the class
MarkdownConverter.description = 'Markdown file (passthrough)';

// Export the converter class
module.exports = MarkdownConverter; 