/**
 * Test cases for Markdown renderer
 * Exports test cases used across different test files
 */

// Collection of test cases for each Markdown feature
const TEST_CASES = [
  {
    name: 'Headings',
    markdown: `# Heading 1\n## Heading 2\n### Heading 3\n#### Heading 4\n##### Heading 5\n###### Heading 6`
  },
  {
    name: 'Paragraph',
    markdown: `This is a simple paragraph.\n\nThis is another paragraph with multiple sentences. It should be properly rendered.`
  },
  {
    name: 'Emphasis',
    markdown: `*Italic text* and _also italic_\n\n**Bold text** and __also bold__\n\n***Bold and italic*** and ___also bold and italic___`
  },
  {
    name: 'Strikethrough',
    markdown: `~~Strikethrough text~~`
  },
  {
    name: 'Blockquotes',
    markdown: `> Simple blockquote\n\n> Multi-line blockquote\n> second line\n\n> Nested blockquote\n>> Nested level 2`
  },
  {
    name: 'Unordered Lists',
    markdown: `* Item 1\n* Item 2\n  * Nested item 1\n  * Nested item 2\n* Item 3\n\n- Alternate 1\n- Alternate 2\n\n+ Another alternate 1\n+ Another alternate 2`
  },
  {
    name: 'Ordered Lists',
    markdown: `1. Item 1\n2. Item 2\n   1. Nested item 1\n   2. Nested item 2\n3. Item 3`
  },
  {
    name: 'Task Lists',
    markdown: `- [x] Completed task\n- [ ] Incomplete task`
  },
  {
    name: 'Inline Code',
    markdown: '`This is inline code`'
  },
  {
    name: 'Code Blocks',
    markdown: '```\nPlain code block\nSecond line\n```'
  },
  {
    name: 'Syntax Highlighting',
    markdown: '```javascript\nfunction test() {\n  return "Hello world!";\n}\n```'
  },
  {
    name: 'Horizontal Rules',
    markdown: `Above rule\n\n---\n\nBetween rules\n\n***\n\nBelow rule\n\n___`
  },
  {
    name: 'Links',
    markdown: `[Basic link](https://example.com)\n\n[Link with title](https://example.com "Example")\n\n<https://example.com>\n\n<user@example.com>`
  },
  {
    name: 'Reference Links',
    markdown: `[Reference link][ref]\n\n[ref]: https://example.com "Reference"`
  },
  {
    name: 'Images',
    markdown: `![Descriptive image of a mountain landscape](https://example.com/image.jpg "Image title")`
  },
  {
    name: 'Tables',
    markdown: `| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |\n| Cell 3   | Cell 4   |`
  },
  {
    name: 'Table Alignment',
    markdown: `| Left | Center | Right |\n|:-----|:------:|------:|\n| A    | B      | C     |`
  },
  {
    name: 'HTML in Markdown',
    markdown: `<div class="custom">\n  <p>HTML content</p>\n</div>`
  },
  {
    name: 'Escape Characters',
    markdown: `\\*not italic\\*\n\n\\\`not code\\\`\n\n\\[not link\\]`
  }
];

// Additional advanced tests that may not be supported by all Markdown implementations
const ADVANCED_TEST_CASES = [
  {
    name: 'Footnotes',
    markdown: `Text with a footnote[^1].\n\n[^1]: Footnote content.`
  },
  {
    name: 'Definition Lists',
    markdown: `Term 1\n: Definition 1\n\nTerm 2\n: Definition 2a\n: Definition 2b`
  },
  {
    name: 'Abbreviations',
    markdown: `*[HTML]: Hyper Text Markup Language\n\nThe HTML specification.`
  },
  {
    name: 'Subscript',
    markdown: `H~2~O is the formula for water.`
  },
  {
    name: 'Superscript',
    markdown: `The area of a circle is πr^2^.`
  },
  {
    name: 'Highlight',
    markdown: `This is ==highlighted text==.`
  },
  {
    name: 'Math Expressions (Inline)',
    markdown: `This is an inline math formula: $E = mc^2$ within text.`
  },
  {
    name: 'Math Expressions (Block)',
    markdown: `Here's a block math formula:\n\n$$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\nThe quadratic formula.`
  },
  {
    name: 'Diagrams (Mermaid)',
    markdown: "```mermaid\ngraph TD;\n    A-->B;\n    A-->C;\n    B-->D;\n    C-->D;\n```"
  },
  {
    name: 'GitHub @mentions',
    markdown: `This feature was implemented by @username and reviewed by @anotheruser.`
  },
  {
    name: 'GitHub #issue References',
    markdown: `This fixes #123 and addresses #456.`
  },
  {
    name: 'Admonitions',
    markdown: `:::note\nThis is a note admonition.\n:::\n\n:::warning Warning Title\nThis is a warning with a custom title.\n:::\n\n:::danger\nThis is a danger admonition.\n:::`
  },
  {
    name: 'Table of Contents',
    markdown: `# Document with TOC\n\n[[toc]]\n\n## Section 1\nContent 1\n\n## Section 2\nContent 2`
  },
  {
    name: 'Enhanced Images',
    markdown: `![Beautiful sunset over the ocean](https://images.unsplash.com/photo-1495954484750-af469f2f9be5?w=500&auto=format)\n\n![Golden Gate Bridge in San Francisco|width=300px](https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&auto=format)`
  },
  {
    name: 'Embedded Content',
    markdown: `@[youtube](https://www.youtube.com/watch?v=dQw4w9WgXcQ)\n\n@[vimeo](https://vimeo.com/123456789){width=400 height=300}`
  }
];

module.exports = {
  TEST_CASES,
  ADVANCED_TEST_CASES
}; 