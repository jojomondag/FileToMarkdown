# Markdown Renderer Tests

This folder contains the consolidated tests for the Markdown renderer functionality.

## Running the Tests

To run the unified test:

```bash
node tests/markdown-renderer/unified-renderer-test.js
```

This will generate an HTML file at `tests/results/@test-results.html` that displays the renderer's output for a comprehensive Markdown test.

## Test Contents

The test includes examples of all major Markdown features:

- Basic formatting (bold, italic, strikethrough)
- Lists (ordered, unordered, nested, task lists)
- Code blocks with syntax highlighting
- Blockquotes (including nested)
- Links and images
- Tables with alignment
- Horizontal rules
- HTML embedding
- Advanced features (footnotes, superscript/subscript, math expressions, diagrams)

## Output

The output is a single HTML page showing:
1. The Markdown input
2. The rendered HTML output

This provides a clear visual way to verify that the Markdown renderer is working correctly. 