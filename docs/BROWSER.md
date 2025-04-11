# Browser Usage Guide

[← Back to Main Documentation](../Readme.md)

FileToMarkdown can also be used directly in web browsers, enabling client-side file conversion without needing a server.

## Using the Browser Bundle

A UMD (Universal Module Definition) bundle is provided in the `dist` directory:

*   `dist/filetomarkdown.browser.js`: Minified production bundle.

You can include this script in your HTML file:

```html
<script src="path/to/dist/filetomarkdown.browser.js"></script>
<script>
  // Access the library via the global `filetomarkdown` object
  const { convertToMarkdown } = filetomarkdown;

  async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      try {
        const markdown = await convertToMarkdown(file);
        document.getElementById('output').textContent = markdown;
      } catch (error) {
        console.error('Conversion failed:', error);
        document.getElementById('output').textContent = `Error: ${error.message}`;
      }
    }
  }
</script>

<input type="file" onchange="handleFileSelect(event)">
<pre id="output"></pre>
```

## Key Differences in Browser

*   **Input**: The `convertToMarkdown` function accepts a `File` object (from an `<input type="file">` or drag-and-drop) instead of a file path.
*   **Dependencies**: External CLI tools like `7z` are not available. Archive conversion relies on JavaScript libraries (`adm-zip`).
*   **Output**: By default, returns the Markdown string. Saving to a file requires additional browser-specific logic (e.g., creating a download link).

---

[← Back to Main Documentation](../Readme.md) 