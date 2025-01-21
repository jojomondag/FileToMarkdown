#!/usr/bin/env node

const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const https = require('https');

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/jojomondag/FileToMarkdown/main/examples';

// Create necessary directories
const createDirectories = () => {
    const dirs = [
        'examples/exampleFiles/code',
        'examples/outputAfterConversion',
        'examples/outputAfterConversion/code',
        'examples/viewer'
    ];
    
    dirs.forEach(dir => {
        if (!fsSync.existsSync(dir)) {
            fsSync.mkdirSync(dir, { recursive: true });
        }
    });
};

// Download a file from GitHub
const downloadFile = (url, outputPath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }

            // Create directory if it doesn't exist
            const dir = path.dirname(outputPath);
            if (!fsSync.existsSync(dir)) {
                fsSync.mkdirSync(dir, { recursive: true });
            }

            const fileStream = fsSync.createWriteStream(outputPath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });

            fileStream.on('error', (err) => {
                fs.unlink(outputPath, () => {});
                reject(err);
            });
        }).on('error', reject);
    });
};

// Test cases
const testFiles = [
    {
        type: 'code',
        localPath: 'examples/exampleFiles/code/codeCs.cs',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/code/codeCs.cs`,
        outputPath: 'examples/outputAfterConversion/code/codeCs.md'
    },
    {
        type: 'code',
        localPath: 'examples/exampleFiles/code/codeHtml.html',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/code/codeHtml.html`,
        outputPath: 'examples/outputAfterConversion/code/codeHtml.md'
    },
    {
        type: 'code',
        localPath: 'examples/exampleFiles/code/codeJava.java',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/code/codeJava.java`,
        outputPath: 'examples/outputAfterConversion/code/codeJava.md'
    },
    {
        type: 'code',
        localPath: 'examples/exampleFiles/code/codeJs.js',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/code/codeJs.js`,
        outputPath: 'examples/outputAfterConversion/code/codeJs.md'
    },
    {
        type: 'code',
        localPath: 'examples/exampleFiles/code/codePy.py',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/code/codePy.py`,
        outputPath: 'examples/outputAfterConversion/code/codePy.md'
    },
    {
        type: 'pdf',
        localPath: 'examples/exampleFiles/exampleGardening.pdf',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/exampleGardening.pdf`,
        outputPath: 'examples/outputAfterConversion/exampleGardening.md'
    },
    {
        type: 'docx',
        localPath: 'examples/exampleFiles/exampleProjekt9.docx',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/exampleProjekt9.docx`,
        outputPath: 'examples/outputAfterConversion/exampleProjekt9.md'
    },
    {
        type: 'pptx',
        localPath: 'examples/exampleFiles/exampleBruceLee.pptx',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/exampleBruceLee.pptx`,
        outputPath: 'examples/outputAfterConversion/exampleBruceLee.md'
    },
    {
        type: 'xlsx',
        localPath: 'examples/exampleFiles/exampleProgrammeringYearPlan.xlsx',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/exampleProgrammeringYearPlan.xlsx`,
        outputPath: 'examples/outputAfterConversion/exampleProgrammeringYearPlan.md'
    },
    {
        type: 'zip',
        localPath: 'examples/exampleFiles/exampleLeads.zip',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/exampleLeads.zip`,
        outputPath: 'examples/outputAfterConversion/exampleLeads.md'
    },
    {
        type: '7zip',
        localPath: 'examples/exampleFiles/exampleStudentWorks.7z',
        githubPath: `${GITHUB_RAW_BASE}/exampleFiles/exampleStudentWorks.7z`,
        outputPath: 'examples/outputAfterConversion/exampleStudentWorks.md'
    }
];

// Run the tests
const runTests = async (useGithub = false) => {
    try {
        console.log('Creating project structure:');
        console.log('examples/');
        console.log('├── viewer/');
        console.log('│   ├── viewer.html     # Markdown viewer');
        console.log('│   └── markdown.js     # Renderer script');
        console.log('├── exampleFiles/');
        console.log('│   ├── code/');
        console.log('│   └── [example files]');
        console.log('└── outputAfterConversion/');
        console.log('    └── code/');
        console.log('');

        // Create directories
        createDirectories();

        // Copy viewer.html to examples directory
        const viewerPath = path.join(process.cwd(), 'examples', 'viewer', 'viewer.html');
        const packageViewerPath = path.join(__dirname, '..', 'src', 'viewer.html');
        const nodeModulesViewerPath = path.join(process.cwd(), 'node_modules', 'filetomarkdown', 'src', 'viewer.html');

        // Add markdown.js paths
        const markdownJsPath = path.join(process.cwd(), 'examples', 'viewer', 'markdown.js');
        const packageMarkdownJsPath = path.join(__dirname, '..', 'src', 'renderer', 'markdown.js');
        const nodeModulesMarkdownJsPath = path.join(process.cwd(), 'node_modules', 'filetomarkdown', 'src', 'renderer', 'markdown.js');

        if (!fsSync.existsSync(viewerPath)) {
            if (fsSync.existsSync(packageViewerPath)) {
                fsSync.copyFileSync(packageViewerPath, viewerPath);
            } else if (fsSync.existsSync(nodeModulesViewerPath)) {
                fsSync.copyFileSync(nodeModulesViewerPath, viewerPath);
            } else {
                console.warn('Warning: Could not find viewer.html');
            }
        }

        if (!fsSync.existsSync(markdownJsPath)) {
            if (fsSync.existsSync(packageMarkdownJsPath)) {
                fsSync.copyFileSync(packageMarkdownJsPath, markdownJsPath);
            } else if (fsSync.existsSync(nodeModulesMarkdownJsPath)) {
                fsSync.copyFileSync(nodeModulesMarkdownJsPath, markdownJsPath);
            } else {
                console.warn('Warning: Could not find markdown.js');
            }
        }

        // Process each test case
        for (const test of testFiles) {
            try {
                if (useGithub) {
                    console.log(`Downloading ${test.type} file from GitHub...`);
                    await downloadFile(test.githubPath, test.localPath);
                    console.log(`✓ Download complete: ${test.localPath}`);
                }

                // Ensure output directory exists
                const outputDir = path.dirname(test.outputPath);
                if (!fsSync.existsSync(outputDir)) {
                    fsSync.mkdirSync(outputDir, { recursive: true });
                }

                console.log(`Converting ${test.type}...`);
                const { convertToMarkdown } = require('../src/index.js');
                await convertToMarkdown(test.localPath, test.outputPath);

                // Move the markdown file if it was created in the source directory
                const sourceDir = path.dirname(test.localPath);
                const sourceMd = path.join(sourceDir, path.basename(test.localPath, path.extname(test.localPath)) + '.md');
                if (fsSync.existsSync(sourceMd)) {
                    await fs.copyFile(sourceMd, test.outputPath);
                    await fs.unlink(sourceMd);
                }

                console.log(`✓ ${test.type} conversion complete\n`);
                
            } catch (error) {
                console.error(`Error processing ${test.type}:`, error);
                process.exit(1);
            }
        }

        console.log('All conversions completed!');
        console.log('Project structure created in current directory.\n');
        console.log('To view the converted files:');
        console.log('1. Navigate to the examples/outputAfterConversion directory');
        console.log('2. Open ../viewer.html in your browser\n');

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

// Check if --github flag is provided
const useGithub = process.argv.includes('--github');
runTests(useGithub); 