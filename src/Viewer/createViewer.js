/**
 * Shared module for creating the FileToMarkdown viewer
 * Used by both the bin/create-viewer.js and bin/test-conversion.js scripts
 */
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

/**
 * Creates a FileToMarkdown viewer in the specified directory
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.targetDir - Target directory where viewer will be created
 * @param {boolean} options.useExamplesStructure - Whether to create in examples/viewer subdirectory
 * @param {boolean} options.addGithubTheme - Whether to add GitHub-themed CSS
 * @param {boolean} options.useFsPromises - Whether to use fs.promises or fs sync methods
 * @returns {Promise<Object>} - Result with paths and status
 */
async function createViewer(options = {}) {
    const {
        targetDir = process.cwd(),
        useExamplesStructure = true,
        addGithubTheme = false,
        useFsPromises = false
    } = options;

    // Filesystem operations based on preference
    const fileOps = {
        copyFile: useFsPromises 
            ? (src, dest) => fsPromises.copyFile(src, dest)
            : (src, dest) => {
                fs.copyFileSync(src, dest);
                return Promise.resolve();
              },
        mkdir: useFsPromises
            ? (dir) => fsPromises.mkdir(dir, { recursive: true })
            : (dir) => {
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                return Promise.resolve();
              },
        appendFile: useFsPromises
            ? (file, data) => fsPromises.appendFile(file, data)
            : (file, data) => {
                fs.appendFileSync(file, data);
                return Promise.resolve();
              },
        exists: (path) => fs.existsSync(path)
    };

    try {
        const packageRoot = path.resolve(path.join(__dirname, '..', '..'));
        const sourceFiles = {
            viewer: path.join(packageRoot, 'src', 'Viewer', 'viewer.html'),
            bundle_js: path.join(packageRoot, 'src', 'Viewer', 'src', 'bundle.js'),
            bundle_css: path.join(packageRoot, 'src', 'Viewer', 'src', 'bundle.css')
        };

        // Verify source files exist
        for (const [name, filePath] of Object.entries(sourceFiles)) {
            if (!fileOps.exists(filePath)) {
                throw new Error(`Missing required file: ${name} (${filePath})`);
            }
        }

        // Determine final target directory based on structure preference
        let viewerDir = targetDir;
        if (useExamplesStructure) {
            viewerDir = path.join(targetDir, 'examples', 'viewer');
        }

        // Create target directory and src subdirectory
        await fileOps.mkdir(viewerDir);
        const srcDir = path.join(viewerDir, 'src');
        await fileOps.mkdir(srcDir);

        // Copy files
        const results = {
            viewerHtmlPath: '',
            bundleJsPath: '',
            bundleCssPath: '',
            completed: false
        };

        // Copy viewer HTML
        const viewerDestPath = path.join(viewerDir, path.basename(sourceFiles.viewer));
        await fileOps.copyFile(sourceFiles.viewer, viewerDestPath);
        results.viewerHtmlPath = viewerDestPath;

        // Copy JS bundle
        const jsDestPath = path.join(srcDir, path.basename(sourceFiles.bundle_js));
        await fileOps.copyFile(sourceFiles.bundle_js, jsDestPath);
        results.bundleJsPath = jsDestPath;

        // Copy CSS bundle
        const cssDestPath = path.join(srcDir, path.basename(sourceFiles.bundle_css));
        await fileOps.copyFile(sourceFiles.bundle_css, cssDestPath);
        results.bundleCssPath = cssDestPath;

        // Add GitHub theme if requested
        if (addGithubTheme) {
            const githubCSS = `
            <style>
                /* GitHub-themed additions */
                body { background: #f6f8fa !important; }
                #c { 
                    background: #ffffff;
                    border: 1px solid #e1e4e8 !important;
                    box-shadow: 0 1px 3px rgba(27,31,35,0.04) !important;
                }
                pre { 
                    background: #f6f8fa !important;
                    border-radius: 6px !important;
                    padding: 16px !important;
                }
                .token.keyword { color: #d73a49 !important; }
                .token.string { color: #032f62 !important; }
            </style>`;
            
            await fileOps.appendFile(viewerDestPath, githubCSS);
        }

        results.completed = true;
        results.viewerDir = viewerDir;
        results.srcDir = srcDir;
        return results;

    } catch (error) {
        throw error;
    }
}

module.exports = {
    createViewer
}; 