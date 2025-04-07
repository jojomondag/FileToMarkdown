# Unified Markdown Renderer Tests

This directory contains a unified test page for the Markdown renderer, which displays all test cases in a 4-column horizontal layout:

1. **Test Input** - The markdown code being tested
2. **Test Output** - The HTML output from the renderer
3. **Example Input** - A simpler example of the same markdown feature
4. **Example Output** - The HTML output of the example

## Running the Tests

You can run the unified test page in one of the following ways:

### Using npm script (recommended)

```bash
npm run test-unified
```

This command will generate the test page and automatically open it in your default browser.

### Using the scripts directory directly

```bash
node scripts/run-unified-tests.js
```

### Running the generator manually

```bash
node examples/unified-renderer-test.js
```

This will generate the test file at `examples/test-results/unified-test-page.html` which you can then open manually.

## Features

- **Toggle View**: Each HTML output can be toggled between viewing the raw HTML code and the rendered output
- **Responsive Design**: The layout adapts to different screen sizes
- **Comprehensive Tests**: Includes both basic and advanced Markdown features

## Test Case Organization

The test cases are organized into two main categories:

1. **Basic Markdown Features**: Standard markdown syntax such as headings, lists, links, etc.
2. **Advanced Markdown Features**: Extended features that may not be supported by all Markdown implementations, such as math expressions, diagrams, etc.

## Adding New Tests

To add new tests, edit the `examples/test-cases.js` file and add your test case to either the `TEST_CASES` or `ADVANCED_TEST_CASES` array.

Each test case should follow this format:

```javascript
{
  name: 'Feature Name',
  markdown: 'Markdown content to test'
}
``` 