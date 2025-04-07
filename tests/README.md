# FileToMarkdown Tests

This directory contains all tests for the FileToMarkdown project. The tests are organized by components they test.

## Test Structure

- `tests/markdown-renderer/` - Tests for the Markdown renderer component
- `tests/results/` - Output directory where test results are stored

## Running Tests

### Markdown Renderer Tests

To run the Markdown renderer tests:

```bash
# From the project root
node tests/markdown-renderer/run-test.js

# Or navigate to the tests directory and run
cd tests/markdown-renderer
node run-test.js
```

This will generate an HTML report at `tests/results/@test-results.html` that shows a comprehensive evaluation of all Markdown features.

### Test Results

The Markdown renderer tests evaluate the following features:
- Basic formatting (headings, bold, italic, strikethrough)
- Lists (ordered, unordered, nested, task lists)
- Code blocks with syntax highlighting
- Blockquotes
- Links and images
- Tables
- Horizontal rules
- HTML embedding
- Advanced features (footnotes, superscript/subscript, math expressions, diagrams)

Each feature is marked as PASSED or FAILED based on specific rendering criteria.

## Interpreting Test Results

After running the tests, you'll see a summary in the console:
```
Test Results Summary:
Total: 18
Passed: 12
Failed: 6
Pass Rate: 67%
```

For detailed results, open the HTML report in your browser. This shows:
- A summary dashboard with pass/fail statistics
- Navigation links to each test
- Individual sections for each feature showing:
  - The Markdown input
  - The rendered HTML output
  - The pass/fail status 