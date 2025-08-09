// Provide a stable server API without triggering heavy imports during type listing

module.exports = {
    async convertToMarkdown(filePath) {
        // Lazy-load the main library only when converting
        const lib = require('..');
        return lib.convertToMarkdown(filePath);
    },

    getFileTypes() {
        try {
            // Try to load from the main library
            const lib = require('..');
            return {
                fileTypes: lib.getFileTypes(),
                descriptions: lib.getFileTypeDescriptions()
            };
        } catch (_err) {
            // Fallback: static list without any IO
            const base = ['md','pdf','txt','docx','odt','pptx','odp','xlsx','ods','7z','zip'];
            const code = [
                'js','html','htm','xml','css','scss','less','json',
                'java','cs','py','rb','cpp','c','h','hpp','go','rs','php','swift','kt','scala','dart','lua','r','m','pl','ts',
                'sh','bash','zsh','ps1','bat','cmd',
                'sql','pgsql','mysql',
                'jsx','tsx','vue','svelte','astro',
                'yml','yaml','toml','ini','conf','dockerfile','docker',
                'tex','graphql','gql'
            ];
            const fileTypes = [...base, ...code];
            const descriptions = Object.fromEntries([
                ['md','Markdown file (passthrough)'],
                ['pdf','PDF Documents'],
                ['txt','Text Files'],
                ['docx','Word Documents'],
                ['odt','LibreOffice Writer Documents'],
                ['pptx','PowerPoint Presentations'],
                ['odp','LibreOffice Impress Presentations'],
                ['xlsx','Excel Spreadsheets'],
                ['ods','LibreOffice Calc Spreadsheets'],
                ['7z','7-Zip Archives'],
                ['zip','ZIP Archives'],
                ...code.map(ext => [ext, `${ext.toUpperCase()} Source Files`])
            ]);
            return { fileTypes, descriptions };
        }
    }
};