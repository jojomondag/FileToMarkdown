const TXTConverter = require('../../src/converters/txt');
const { FileNotFoundError, FileReadError, FormatError } = require('../../src/utils/errors');
const fs = require('fs').promises;

describe('TXTConverter', () => {
  let converter;

  beforeEach(() => {
    converter = new TXTConverter();
  });

  describe('convert', () => {
    it('should convert a valid txt file to markdown', async () => {
      const mockContent = 'Title\n===\nSome content\n\n    code block\n* list item';
      jest.spyOn(fs, 'access').mockResolvedValue();
      jest.spyOn(fs, 'readFile').mockResolvedValue(mockContent);

      const result = await converter.convert('test.txt');
      expect(result).toContain('# Title');
      expect(result).toContain('Some content');
      expect(result).toContain('```\ncode block\n```');
      expect(result).toContain('- list item');
    });

    it('should throw FileNotFoundError when file does not exist', async () => {
      jest.spyOn(fs, 'access').mockRejectedValue(new Error());

      await expect(converter.convert('nonexistent.txt'))
        .rejects
        .toThrow(FileNotFoundError);
    });
  });

  describe('format', () => {
    it('should format headings correctly', () => {
      const input = 'Title\n===\nSubtitle\n---';
      const result = converter.format(input);
      expect(result).toBe('# Title\n## Subtitle\n');
    });

    it('should format lists correctly', () => {
      const input = '* Item 1\n- Item 2\n1. Item 3';
      const result = converter.format(input);
      expect(result).toBe('- Item 1\n- Item 2\n1. Item 3\n');
    });

    it('should format code blocks correctly', () => {
      const input = '    code line 1\n    code line 2';
      const result = converter.format(input);
      expect(result).toBe('```\ncode line 1\ncode line 2\n```\n');
    });

    it('should throw FormatError for invalid input', () => {
      expect(() => converter.format(null))
        .toThrow(FormatError);
    });
  });
}); 