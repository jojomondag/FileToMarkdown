class ConverterError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'ConverterError';
    this.code = code;
    this.originalError = originalError;
  }
}

class FileNotFoundError extends ConverterError {
  constructor(filePath, originalError = null) {
    super(`File not found: ${filePath}`, 'FILE_NOT_FOUND', originalError);
    this.name = 'FileNotFoundError';
  }
}

class FileReadError extends ConverterError {
  constructor(filePath, originalError = null) {
    super(`Failed to read file: ${filePath}`, 'FILE_READ_ERROR', originalError);
    this.name = 'FileReadError';
  }
}

class FormatError extends ConverterError {
  constructor(message, originalError = null) {
    super(message, 'FORMAT_ERROR', originalError);
    this.name = 'FormatError';
  }
}

module.exports = {
  ConverterError,
  FileNotFoundError,
  FileReadError,
  FormatError
}; 