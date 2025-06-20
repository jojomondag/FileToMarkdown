#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { spawn } = require('child_process');
const os = require('os');

const REPO_OWNER = 'jojomondag';
const REPO_NAME = 'Markdown-Viewer';
const LATEST_RELEASE_API = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`;
const VIEWER_DIR = path.join(os.homedir(), '.filetomarkdown');
const VIEWER_PATH = path.join(VIEWER_DIR, 'Markdown-Viewer.exe');
const VERSION_FILE = path.join(VIEWER_DIR, 'version.txt');

// Console colors
const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function getLatestReleaseInfo() {
    return new Promise((resolve, reject) => {
        https.get(LATEST_RELEASE_API, {
            headers: {
                'User-Agent': 'FileToMarkdown-Viewer'
            }
        }, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to fetch latest release: ${response.statusCode} ${response.statusMessage}`));
                return;
            }
            
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            
            response.on('end', () => {
                try {
                    const releaseInfo = JSON.parse(data);
                    
                    // Find the .exe asset
                    const exeAsset = releaseInfo.assets.find(asset => 
                        asset.name.endsWith('.exe') && asset.name.includes('Markdown')
                    );
                    
                    if (!exeAsset) {
                        reject(new Error('No executable file found in latest release'));
                        return;
                    }
                    
                    resolve({
                        version: releaseInfo.tag_name,
                        downloadUrl: exeAsset.browser_download_url,
                        fileName: exeAsset.name,
                        fileSize: exeAsset.size
                    });
                } catch (error) {
                    reject(new Error(`Failed to parse release info: ${error.message}`));
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}

function downloadFile(url, outputPath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(outputPath);
        
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                // Follow redirect
                return downloadFile(response.headers.location, outputPath)
                    .then(resolve)
                    .catch(reject);
            }
            
            if (response.statusCode !== 200) {
                fs.unlink(outputPath, () => {});
                reject(new Error(`Failed to download: ${response.statusCode} ${response.statusMessage}`));
                return;
            }
            
            const totalSize = parseInt(response.headers['content-length'], 10);
            let downloadedSize = 0;
            
            response.on('data', (chunk) => {
                downloadedSize += chunk.length;
                if (totalSize) {
                    const percent = ((downloadedSize / totalSize) * 100).toFixed(1);
                    process.stdout.write(`\r${colors.blue}Downloading... ${percent}%${colors.reset}`);
                }
            });
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                process.stdout.write('\n');
                log('✓ Download completed successfully!', 'green');
                resolve();
            });
            
        }).on('error', (err) => {
            fs.unlink(outputPath, () => {});
            reject(err);
        });
    });
}

function ensureViewerDirectory() {
    if (!fs.existsSync(VIEWER_DIR)) {
        fs.mkdirSync(VIEWER_DIR, { recursive: true });
        log(`Created directory: ${VIEWER_DIR}`, 'blue');
    }
}

function isViewerInstalled() {
    return fs.existsSync(VIEWER_PATH);
}

function getCurrentVersion() {
    try {
        if (fs.existsSync(VERSION_FILE)) {
            return fs.readFileSync(VERSION_FILE, 'utf8').trim();
        }
    } catch (error) {
        // Ignore errors, treat as no version
    }
    return null;
}

function saveCurrentVersion(version) {
    try {
        fs.writeFileSync(VERSION_FILE, version);
    } catch (error) {
        log(`Warning: Could not save version info: ${error.message}`, 'yellow');
    }
}

async function needsUpdate() {
    if (!isViewerInstalled()) {
        return { needsUpdate: true, reason: 'not_installed' };
    }
    
    try {
        const releaseInfo = await getLatestReleaseInfo();
        const currentVersion = getCurrentVersion();
        
        if (!currentVersion) {
            return { needsUpdate: true, reason: 'no_version_info', latestVersion: releaseInfo.version };
        }
        
        if (currentVersion !== releaseInfo.version) {
            return { 
                needsUpdate: true, 
                reason: 'new_version', 
                currentVersion, 
                latestVersion: releaseInfo.version 
            };
        }
        
        return { needsUpdate: false, currentVersion };
    } catch (error) {
        log(`Warning: Could not check for updates: ${error.message}`, 'yellow');
        return { needsUpdate: false, currentVersion: getCurrentVersion() };
    }
}

async function downloadViewer() {
    log('Fetching latest release information...', 'yellow');
    
    try {
        const releaseInfo = await getLatestReleaseInfo();
        log(`Latest version: ${releaseInfo.version}`, 'blue');
        log(`File: ${releaseInfo.fileName} (${Math.round(releaseInfo.fileSize / 1024 / 1024)} MB)`, 'blue');
        
        log('Downloading Markdown Viewer...', 'yellow');
        log(`URL: ${releaseInfo.downloadUrl}`, 'blue');
        
        ensureViewerDirectory();
        await downloadFile(releaseInfo.downloadUrl, VIEWER_PATH);
        saveCurrentVersion(releaseInfo.version);
        log(`Markdown Viewer ${releaseInfo.version} installed to: ${VIEWER_PATH}`, 'green');
    } catch (error) {
        log(`Failed to download Markdown Viewer: ${error.message}`, 'red');
        log('Falling back to direct GitHub link...', 'yellow');
        
        // Fallback to hardcoded URL if API fails
        const fallbackUrl = 'https://github.com/jojomondag/Markdown-Viewer/releases/download/v1.0.0/Markdown.Viewer.1.0.0.exe';
        try {
            ensureViewerDirectory();
            await downloadFile(fallbackUrl, VIEWER_PATH);
            log(`Markdown Viewer installed to: ${VIEWER_PATH}`, 'green');
        } catch (fallbackError) {
            log(`Fallback download also failed: ${fallbackError.message}`, 'red');
            process.exit(1);
        }
    }
}

function attemptToStartViewer(attemptNumber) {
    try {
        const viewer = spawn(VIEWER_PATH, [], { 
            detached: true, 
            stdio: 'ignore' 
        });
        
        viewer.on('error', (error) => {
            if (error.code === 'EBUSY' && attemptNumber < 3) {
                log(`Viewer busy, retrying in ${2 + attemptNumber} seconds... (attempt ${attemptNumber + 1}/3)`, 'yellow');
                setTimeout(() => {
                    attemptToStartViewer(attemptNumber + 1);
                }, (2 + attemptNumber) * 1000);
            } else {
                log(`Failed to start Markdown Viewer: ${error.message}`, 'red');
                if (error.code === 'EBUSY') {
                    log('The file might be in use by antivirus software. Please try again in a few moments.', 'yellow');
                }
            }
        });
        
        viewer.unref();
        log('Markdown Viewer started successfully!', 'green');
    } catch (error) {
        if (error.code === 'EBUSY' && attemptNumber < 3) {
            log(`Viewer busy, retrying in ${2 + attemptNumber} seconds... (attempt ${attemptNumber + 1}/3)`, 'yellow');
            setTimeout(() => {
                attemptToStartViewer(attemptNumber + 1);
            }, (2 + attemptNumber) * 1000);
        } else {
            log(`Failed to start Markdown Viewer: ${error.message}`, 'red');
            if (error.code === 'EBUSY') {
                log('The file might be in use by antivirus software. Please try again in a few moments.', 'yellow');
            }
        }
    }
}

function runViewer() {
    log('Starting Markdown Viewer...', 'green');
    
    if (os.platform() !== 'win32') {
        log('Warning: Markdown Viewer is currently only available for Windows', 'yellow');
        log('Please visit https://github.com/jojomondag/Markdown-Viewer/releases for updates', 'blue');
        return;
    }
    
    // Add a small delay to allow file system operations to complete
    // This helps prevent EBUSY errors when the file was just downloaded
    log('Waiting for file system to stabilize...', 'blue');
    setTimeout(() => {
        attemptToStartViewer(0);
    }, 2000);
}

async function main() {
    log('FileToMarkdown Viewer Launcher', 'blue');
    log('================================', 'blue');
    
    if (os.platform() !== 'win32') {
        log('Error: Markdown Viewer is currently only available for Windows', 'red');
        log('Please visit https://github.com/jojomondag/Markdown-Viewer/releases', 'blue');
        process.exit(1);
    }
    
    // Check if user wants to force re-download
    if (process.argv.includes('--update') || process.argv.includes('-u')) {
        log('Force updating Markdown Viewer...', 'yellow');
        await downloadViewer();
    } else {
        // Check if we need to update
        const updateCheck = await needsUpdate();
        
        if (updateCheck.needsUpdate) {
            switch (updateCheck.reason) {
                case 'not_installed':
                    log('Markdown Viewer not found. Downloading latest version...', 'yellow');
                    break;
                case 'no_version_info':
                    log(`Updating to latest version (${updateCheck.latestVersion})...`, 'yellow');
                    break;
                case 'new_version':
                    log(`New version available: ${updateCheck.latestVersion} (current: ${updateCheck.currentVersion})`, 'green');
                    log('Downloading update...', 'yellow');
                    break;
            }
            await downloadViewer();
        } else {
            log(`Markdown Viewer ${updateCheck.currentVersion} is up to date!`, 'green');
        }
    }
    
    runViewer();
}

// Handle command line arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
FileToMarkdown Viewer Launcher

Downloads and runs the Markdown Viewer application for viewing converted files.

Usage: filetomarkdown-viewer [options]

Options:
  -h, --help     Show this help message
  -u, --update   Force update/re-download the viewer
  
The viewer will be downloaded to: ${VIEWER_PATH}

For more information visit:
https://github.com/jojomondag/Markdown-Viewer
`);
    process.exit(0);
}

// Run the main function
main().catch((error) => {
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
}); 