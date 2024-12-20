Based on your codebase, here are the steps and commands to build and deploy your package to npm:

### 1. Prepare Your Package
First, ensure your `package.json` is properly configured. Your current configuration looks good as shown in:

```1:53:package.json
{
  "name": "filetomarkdown",
  "version": "0.1.36",
  "description": "Convert various file types to markdown format. Example files available at github.com/jojomondag/FileToMarkdown/tree/main/src/exampleFiles",
  "homepage": "https://github.com/jojomondag/FileToMarkdown",
  "main": "src/index.js",
  "bin": {
    "filetomarkdown-convert": "./bin/cli.js",
    "filetomarkdown-test": "./scripts/test-conversion.js"
  },
  "files": [
    "src/index.js",
    "src/converters/",
    "src/viewer.html",
    "bin/",
    "scripts/test-conversion.js",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "test": "node scripts/test-conversion.js",
    "test-github": "node scripts/test-conversion.js --github"
  },
  "keywords": [
    "markdown",
    "converter",
    "pdf",
    "docx",
    "pptx",
    "xlsx",
    "text",
    "code",
    "zip",
    "7zip"
  ],
  "author": "Josef",
  "license": "MIT",
  "dependencies": {
    "7zip-min": "^1.4.5",
    "adm-zip": "^0.5.16",
    "mammoth": "^1.8.0",
    "pdfjs-dist": "^4.9.155",
    "xlsx-js-style": "^1.2.0",
    "xml2js": "^0.6.2"
  },
  "engines": {
    "node": ">=14.0.0"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/jojomondag/FileToMarkdown.git"
  }
}
```


### 2. Login to npm
```bash
npm login
```
You'll be prompted to enter:
- Username
- Password
- Email
- (Potentially 2FA code if enabled)

### 3. Test Your Package Locally
```bash
# Remove any global installation
npm uninstall -g filetomarkdown

# Install dependencies
npm install

# Run tests
npm test

# Test with GitHub examples
npm run test-github
```

### 4. Update Version (if needed)
```bash
# Increment patch version (0.1.36 -> 0.1.37)
npm version patch

# Or for minor version (0.1.36 -> 0.2.0)
npm version minor

# Or for major version (0.1.36 -> 1.0.0)
npm version major
```

### 5. Build and Publish
```bash
# Publish to npm
npm publish
```

### 6. Verify Publication
```bash
# Test global installation
npm install -g filetomarkdown

# Test the CLI
filetomarkdown-convert --help
```

### Important Notes:

1. Your `.npmignore` file is already properly configured to exclude unnecessary files:

```1:19:.npmignore
# Example files
src/exampleFiles/

# Development files
.git/
.github/
.gitignore
.npmrc
*.log
node_modules/

# Test outputs
src/exampleFiles/outputAfterConversion/

# IDE files
.vscode/
.idea/
*.swp
*.swo
```


2. Make sure your README.md is up to date before publishing, as it's what users will see on the npm package page.

3. Your package includes the necessary files as specified in your `package.json`:

```11:19:package.json
  "files": [
    "src/index.js",
    "src/converters/",
    "src/viewer.html",
    "bin/",
    "scripts/test-conversion.js",
    "README.md",
    "LICENSE"
  ],
```


4. If you get any errors during publishing:
- Check that you're not already using the version number
- Verify you're logged in with `npm whoami`
- Ensure your package name is available with `npm search filetomarkdown`

### After Publishing

To verify everything works:

1. Create a new directory somewhere else
2. Run:
```bash
npm install -g filetomarkdown
filetomarkdown-test --github
```

This should successfully install and run your package from npm.
