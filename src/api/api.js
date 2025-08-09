// Use a static import so the server bundle includes the implementation
const { convertToMarkdown, getFileTypes, getFileTypeDescriptions } = require('..');

module.exports = {
    async convertToMarkdown(filePath) {
        return convertToMarkdown(filePath);
    },

    getFileTypes() {
        return {
            fileTypes: getFileTypes(),
            descriptions: getFileTypeDescriptions()
        };
    }
};