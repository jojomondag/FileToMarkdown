// Type definitions for FileToMarkdown converters
// Definitions for all converter classes and their interfaces

export interface ConverterOptions {
  collapsible?: boolean;
  [key: string]: any;
}

export interface BaseConverter {
  /**
   * Convert a file to markdown format
   * @param filePath Path to the file to convert
   * @param options Optional conversion options
   * @returns Promise resolving to markdown content
   */
  convert(filePath: string, options?: ConverterOptions): Promise<string>;
}

export interface ConverterClass {
  new(): BaseConverter;
  description?: string;
  supportedExtensions?: string[];
}

// Code Converter specific types
export interface LanguageMap {
  [extension: string]: string;
}

export declare class CodeConverter implements BaseConverter {
  static readonly supportedExtensions: string[];
  static description: string;
  
  convert(filePath: string, options?: ConverterOptions): Promise<string>;
  
  /**
   * Get markdown language identifier from filename
   * @param filename The filename to analyze
   * @returns Language identifier for syntax highlighting
   */
  static getLanguage(filename: string): string;
  
  /**
   * Check if a file is supported by the code converter
   * @param filename The filename to check
   * @returns True if the file type is supported
   */
  static isSupported(filename: string): boolean;
}

export declare const langMap: LanguageMap;

// Standard converter classes
export declare class PdfConverter implements BaseConverter {
  convert(filePath: string, options?: ConverterOptions): Promise<string>;
}

export declare class DocxConverter implements BaseConverter {
  convert(filePath: string, options?: ConverterOptions): Promise<string>;
}

export declare class OdtConverter implements BaseConverter {
  convert(filePath: string, options?: ConverterOptions): Promise<string>;
}

export declare class PptxConverter implements BaseConverter {
  convert(filePath: string, options?: ConverterOptions): Promise<string>;
}

export declare class OdpConverter implements BaseConverter {
  convert(filePath: string, options?: ConverterOptions): Promise<string>;
}

export declare class XlsxConverter implements BaseConverter {
  convert(filePath: string, options?: ConverterOptions): Promise<string>;
}

export declare class OdsConverter implements BaseConverter {
  convert(filePath: string, options?: ConverterOptions): Promise<string>;
}

export declare class ZipConverter implements BaseConverter {
  convert(filePath: string, options?: ConverterOptions): Promise<string>;
}

export declare class SevenZipConverter implements BaseConverter {
  convert(filePath: string, options?: ConverterOptions): Promise<string>;
}

export declare class TxtConverter implements BaseConverter {
  convert(filePath: string, options?: ConverterOptions): Promise<string>;
}

export declare class MdConverter implements BaseConverter {
  convert(filePath: string, options?: ConverterOptions): Promise<string>;
} 