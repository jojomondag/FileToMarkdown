// Type definitions for filetomarkdown
// Project: https://github.com/jojomondag/FileToMarkdown
// Definitions by: FileToMarkdown contributors

/// <reference path="types/converters.d.ts" />
/// <reference path="types/server.d.ts" />
/// <reference path="types/cli.d.ts" />

export interface MarkitDownOptions {
  [key: string]: any;
}

export interface FileTypeDescriptions {
  md: string;
  pdf: string;
  txt: string;
  docx: string;
  odt: string;
  pptx: string;
  odp: string;
  xlsx: string;
  ods: string;
  '7z': string;
  zip: string;
  [extension: string]: string;
}

export interface ConversionResult {
  markdown: string;
  metadata?: {
    originalFilename?: string;
    fileSize?: number;
    processedAt?: Date;
  };
}

export declare class MarkitDown {
  constructor(options?: MarkitDownOptions);
  
  /**
   * Convert a file to markdown format
   * @param inputPath Path to the input file
   * @param outputPath Optional path to save the markdown output
   * @returns Promise resolving to the markdown content
   */
  convertToMarkdown(inputPath: string, outputPath?: string): Promise<string>;
  
  /**
   * Get the converter class for a specific file extension
   * @param ext File extension without the dot
   * @returns Converter class or null if unsupported
   */
  getFileType(ext: string): any | null;
  
  /**
   * Static getter for supported file type mappings
   */
  static get typeMap(): Record<string, any>;
  
  /**
   * Get descriptions for all supported file types
   */
  static getTypeDescriptions(): FileTypeDescriptions;
}

/**
 * Convert a file to markdown (convenience function)
 * @param input Path to input file
 * @param output Optional path to output file
 * @param options Optional conversion options
 * @returns Promise resolving to markdown content
 */
export declare function convertToMarkdown(
  input: string, 
  output?: string, 
  options?: MarkitDownOptions
): Promise<string>;

/**
 * Get array of supported file extensions
 * @returns Array of supported file extensions
 */
export declare function getFileTypes(): string[];

/**
 * Get descriptions for all supported file types
 * @returns Object mapping file extensions to descriptions
 */
export declare function getFileTypeDescriptions(): FileTypeDescriptions;

// Browser/Client-side types
export interface FileToMarkdownClientOptions {
  baseURL?: string;
}

export interface ConvertResponse {
  success: boolean;
  markdown?: string;
  error?: string;
  filename?: string;
}

export interface SupportedTypesResponse {
  fileTypes: string[];
  descriptions: FileTypeDescriptions;
}

export declare class FileToMarkdownClient {
  constructor(options?: FileToMarkdownClientOptions);
  
  /**
   * Convert a file using the remote API
   * @param file File object to convert
   * @returns Promise resolving to conversion result
   */
  convertFile(file: File): Promise<ConvertResponse>;
  
  /**
   * Get supported file types from the remote API
   * @returns Promise resolving to supported types
   */
  getSupportedTypes(): Promise<SupportedTypesResponse>;
}

// Default export
declare const filetomarkdown: {
  MarkitDown: typeof MarkitDown;
  convertToMarkdown: typeof convertToMarkdown;
  getFileTypes: typeof getFileTypes;
  getFileTypeDescriptions: typeof getFileTypeDescriptions;
};

export default filetomarkdown; 