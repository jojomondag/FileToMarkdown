Here are all the commands you need:

1. **Uninstall FileToMarkdown globally:**
```bash
npm uninstall -g filetomarkdown
```

2. **Install FileToMarkdown globally:**
```bash
npm install -g filetomarkdown
```

3. **Run test with example files from GitHub (using npx):**
```bash
npx filetomarkdown-test --github
```

5. **Run test after global installation:**
```bash
filetomarkdown-test
```

6. **Run test with example files after global installation:**
```bash
filetomarkdown-test --github
```

After running any of these test commands:
1. Navigate to the `src` directory
2. Open `viewer.html` in your browser
3. Use the file browser to select and view markdown files in the `outputAfterConversion` folder

Note: The `--github` flag attempts to download example files from your GitHub repository. If the files don't exist in the repository, you'll get 404 errors, but the directory structure will still be created.
