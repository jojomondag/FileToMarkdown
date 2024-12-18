const MarkItDown = require('../src/index');

describe('MarkItDown', () => {
  let converter;

  beforeEach(() => {
    converter = new MarkItDown();
  });

  test('should be instantiated with default options', () => {
    expect(converter.options).toEqual({
      preserveFormatting: true,
      includeMetadata: true
    });
  });

  test('should throw error for unsupported file format', async () => {
    await expect(converter.convertToMarkdown('test.xyz'))
      .rejects
      .toThrow('Unsupported file format: xyz');
  });
}); 