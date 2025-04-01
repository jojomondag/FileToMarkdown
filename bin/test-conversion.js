#!/usr/bin/env node
const fs = require('fs/promises');
const fsSync = require('fs');
const path = require('path');
const https = require('https');
const { convertToMarkdown } = require('../dist/main');
const { createViewer } = require('../src/Viewer/createViewer');

const GITHUB_RAW_BASE = 'https://raw.githubusercontent.com/jojomondag/FileToMarkdown/main/examples';

// Create directory structure
const createDirectories = () => {
    const dirs = [
        'examples/exampleFiles/code',
        'examples/outputAfterConversion/code',
        'examples/viewer'
    ];
    
    dirs.forEach(dir => {
        if (!fsSync.existsSync(dir)) {
            fsSync.mkdirSync(dir, { recursive: true });
        }
    });
};

// Download helper
const downloadFile = (url, outputPath) => new Promise((resolve, reject) => {
    https.get(url, (response) => {
        if (response.statusCode !== 200) {
            reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
            return;
        }

        const fileStream = fsSync.createWriteStream(outputPath);
        response.pipe(fileStream)
            .on('finish', resolve)
            .on('error', (err) => {
                fs.unlink(outputPath, () => reject(err));
            });
    }).on('error', reject);
});

// Test files configuration
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

// Main test runner
const runTests = async () => {
    try {
        console.log('🚀 Starting FileToMarkdown Test Suite\n');
        console.log('🌐 Using GitHub examples and styling\n');
        
        createDirectories();
        
        // Use the shared createViewer module instead of setupViewer
        const viewerResult = await createViewer({
            targetDir: process.cwd(),
            useExamplesStructure: true,
            addGithubTheme: true,
            useFsPromises: true
        });
        
        if (viewerResult.completed) {
            console.log(`✅ Viewer created: ${path.resolve(viewerResult.viewerHtmlPath)}`);
            console.log(`✅ Bundle files copied to: ${path.resolve(viewerResult.srcDir)}`);
        } else {
            throw new Error('Failed to create viewer');
        }

        console.log('\n📂 Project Structure:');
        console.log('├── examples/');
        console.log('│   ├── exampleFiles/');
        console.log('│   ├── outputAfterConversion/');
        console.log('│   └── viewer/');
        console.log('│       └── viewer.html');
        console.log('└── package.json\n');

        for (const test of testFiles) {
            try {
                const fileType = test.type.padEnd(6, ' ');
                console.log(`🔨 Processing ${fileType}: ${path.basename(test.localPath)}`);

                await downloadFile(test.githubPath, test.localPath);
                await convertToMarkdown(test.localPath, test.outputPath);
                
                // Verify output
                if (fsSync.existsSync(test.outputPath)) {
                    const stats = fsSync.statSync(test.outputPath);
                    console.log(`✅ Success: ${path.basename(test.outputPath)} (${Math.round(stats.size/1024)}KB)`);
                } else {
                    throw new Error('Output file not created');
                }

            } catch (error) {
                console.error(`❌ ${test.type} conversion failed:`, error.message);
                process.exit(1);
            }
        }

        console.log('\n🎉 All conversions completed!');
        console.log('\n🔗 Viewer Access Instructions:');
        console.log('   - Open examples/viewer/viewer.html directly in your browser');
        console.log('   - Drag generated .md files from:');
        console.log('     examples/outputAfterConversion/');

    } catch (error) {
        console.error('💥 Critical error:', error.message);
        process.exit(1);
    }
};

// Run tests
runTests();