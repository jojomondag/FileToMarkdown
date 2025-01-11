#!/usr/bin/env node

const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const https = require('https');
const os = require('os');

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/jojomondag/FileToMarkdown/refs/heads/main/src/exampleFiles';

// Create necessary directories
const createDirectories = () => {
    const dirs = [
        'src/exampleFiles/code',
        'src/outputAfterConversion',
        'src/outputAfterConversion/code'
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
const testCases = [
    {
        type: 'PDF',
        localPath: 'src/exampleFiles/exampleGardening.pdf',
        githubUrl: `${GITHUB_RAW_BASE}/exampleGardening.pdf`,
        outputPath: 'src/outputAfterConversion/exampleGardening.md'
    },
    {
        type: 'TXT',
        localPath: 'src/exampleFiles/exampleTheDebuggingDuck.txt',
        githubUrl: `${GITHUB_RAW_BASE}/exampleTheDebuggingDuck.txt`,
        outputPath: 'src/outputAfterConversion/exampleTheDebuggingDuck.md'
    },
    {
        type: 'DOCX',
        localPath: 'src/exampleFiles/exampleProjekt9.docx',
        githubUrl: `${GITHUB_RAW_BASE}/exampleProjekt9.docx`,
        outputPath: 'src/outputAfterConversion/exampleProjekt9.md'
    },
    {
        type: 'PPTX',
        localPath: 'src/exampleFiles/exampleBruceLee.pptx',
        githubUrl: `${GITHUB_RAW_BASE}/exampleBruceLee.pptx`,
        outputPath: 'src/outputAfterConversion/exampleBruceLee.md'
    },
    {
        type: 'XLSX',
        localPath: 'src/exampleFiles/exampleProgrammeringYearPlan.xlsx',
        githubUrl: `${GITHUB_RAW_BASE}/exampleProgrammeringYearPlan.xlsx`,
        outputPath: 'src/outputAfterConversion/exampleProgrammeringYearPlan.md'
    },
    {
        type: '7Z',
        localPath: 'src/exampleFiles/exampleStudentWorks.7z',
        githubUrl: `${GITHUB_RAW_BASE}/exampleStudentWorks.7z`,
        outputPath: 'src/outputAfterConversion/exampleStudentWorks.md'
    },
    {
        type: 'ZIP',
        localPath: 'src/exampleFiles/exampleLeads.zip',
        githubUrl: `${GITHUB_RAW_BASE}/exampleLeads.zip`,
        outputPath: 'src/outputAfterConversion/exampleLeads.md'
    },
    {
        type: 'Code CS',
        localPath: 'src/exampleFiles/code/codeCs.cs',
        githubUrl: `${GITHUB_RAW_BASE}/code/codeCs.cs`,
        outputPath: 'src/outputAfterConversion/code/codeCs.md'
    },
    {
        type: 'Code HTML',
        localPath: 'src/exampleFiles/code/codeHtml.html',
        githubUrl: `${GITHUB_RAW_BASE}/code/codeHtml.html`,
        outputPath: 'src/outputAfterConversion/code/codeHtml.md'
    },
    {
        type: 'Code JAVA',
        localPath: 'src/exampleFiles/code/codeJava.java',
        githubUrl: `${GITHUB_RAW_BASE}/code/codeJava.java`,
        outputPath: 'src/outputAfterConversion/code/codeJava.md'
    },
    {
        type: 'Code JS',
        localPath: 'src/exampleFiles/code/codeJs.js',
        githubUrl: `${GITHUB_RAW_BASE}/code/codeJs.js`,
        outputPath: 'src/outputAfterConversion/code/codeJs.md'
    },
    {
        type: 'Code PY',
        localPath: 'src/exampleFiles/code/codePy.py',
        githubUrl: `${GITHUB_RAW_BASE}/code/codePy.py`,
        outputPath: 'src/outputAfterConversion/code/codePy.md'
    }
];

// Run the tests
const runTests = async (useGithub = false) => {
    try {
        console.log('Creating project structure:');
        console.log('src/');
        console.log('├── viewer.html           # Markdown viewer');
        console.log('├── exampleFiles/');
        console.log('│   ├── code/');
        console.log('│   └── [example files]');
        console.log('└── outputAfterConversion/');
        console.log('    └── code/');
        console.log('');

        // Create directories
        createDirectories();

        // Copy viewer.html to src directory
        const viewerPath = path.join(process.cwd(), 'src', 'viewer.html');
        const packageViewerPath = path.join(__dirname, '..', '..', 'src', 'viewer.html');

        if (!fsSync.existsSync(viewerPath)) {
            if (fsSync.existsSync(packageViewerPath)) {
                fsSync.copyFileSync(packageViewerPath, viewerPath);
            }
        }

        // Process each test case
        for (const test of testCases) {
            try {
                if (useGithub) {
                    console.log(`Downloading ${test.type} file from GitHub...`);
                    await downloadFile(test.githubUrl, test.localPath);
                    console.log(`✓ Download complete: ${test.localPath}`);
                }

                // Ensure output directory exists
                const outputDir = path.dirname(test.outputPath);
                if (!fsSync.existsSync(outputDir)) {
                    fsSync.mkdirSync(outputDir, { recursive: true });
                }

                console.log(`Converting ${test.type}...`);
                const { convertToMarkdown } = require('../../src/index.js');
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
        console.log('2. Open viewer.html in your browser\n');

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

// Check if --github flag is provided
const useGithub = process.argv.includes('--github');
runTests(useGithub); 