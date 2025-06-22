**[Commands](COMMANDS.md)** • **[API Reference](API.md)** • **[Browser Usage](BROWSER.md)** • **[File Types](CONVERTERS.md)**
# Browser Usage Guide

FileToMarkdown can also be used directly in web browsers with **full TypeScript support**, enabling client-side file conversion without needing a server.

## TypeScript Support

Complete type definitions are included for browser usage:
- Type-safe client configuration
- Typed API responses and error handling  
- IntelliSense support in modern IDEs
- Full compatibility with TypeScript projects

## Using the Browser Bundle

A UMD (Universal Module Definition) bundle is provided in the `dist` directory:

*   `dist/filetomarkdown.browser.js`: Minified production bundle.

You can include this script in your HTML file:

### JavaScript Example
```html
<script src="path/to/dist/filetomarkdown.browser.js"></script>
<script>
  // Create API client instance
  const client = new FileToMarkdown.FileToMarkdownClient();
  client.baseURL = 'http://localhost:3000'; // Your API server

  async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      try {
        const result = await client.convertFile(file);
        document.getElementById('output').textContent = result.markdown;
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

### TypeScript Example

For TypeScript projects, you can import the client directly with full type safety:

```typescript
import { FileToMarkdownClient } from 'filetomarkdown';
import type { ConvertResponse, FileToMarkdownClientOptions } from 'filetomarkdown';

// Create client with typed options
const options: FileToMarkdownClientOptions = {
  baseURL: 'http://localhost:3000'
};
const client = new FileToMarkdownClient(options);

// Type-safe file handling
async function handleFileSelect(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    try {
      const result: ConvertResponse = await client.convertFile(file);
      const output = document.getElementById('output') as HTMLPreElement;
      output.textContent = result.markdown;
    } catch (error) {
      console.error('Conversion failed:', error);
      const output = document.getElementById('output') as HTMLPreElement;
      output.textContent = `Error: ${(error as Error).message}`;
    }
  }
}

// Type-safe event binding
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
fileInput.addEventListener('change', handleFileSelect);
```

## Key Differences in Browser

*   **Requires Server**: The browser client sends files to your API server for conversion - it doesn't convert files directly in the browser.
*   **Input**: The `convertFile` method accepts a `File` object (from an `<input type="file">` or drag-and-drop).
*   **Server Dependency**: You must have `filetomarkdown-server` running to handle the conversion requests.
*   **Output**: Returns a JSON object with `{ markdown: string }` containing the converted content.

---

[← Back to Main Documentation](../Readme.md) 