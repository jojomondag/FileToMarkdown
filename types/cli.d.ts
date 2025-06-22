// Type definitions for FileToMarkdown CLI tools
// Command-line interface types and argument parsing

export interface CliOptions {
  input?: string;
  output?: string;
  help?: boolean;
  version?: boolean;
  verbose?: boolean;
  format?: string;
}

export interface ConvertCliArgs {
  inputFile: string;
  outputFile?: string;
}

export interface ServerCliArgs {
  port?: number;
  host?: string;
  cors?: boolean;
  uploadDir?: string;
}

export interface TestCliArgs {
  github?: boolean;
  verbose?: boolean;
  format?: string;
}

export interface ViewerCliArgs {
  file?: string;
  port?: number;
  browser?: boolean;
}

// CLI Result types
export interface CliResult {
  success: boolean;
  message?: string;
  error?: string;
  exitCode: number;
}

export interface ConversionResult extends CliResult {
  inputPath?: string;
  outputPath?: string;
  fileSize?: number;
  conversionTime?: number;
}

// CLI Command handlers
export type CliCommandHandler<T = any> = (args: T) => Promise<CliResult>;

export interface CliCommand {
  name: string;
  description: string;
  usage: string;
  handler: CliCommandHandler;
  examples?: string[];
}

// Argument parsing utilities
export interface ParsedArgs {
  command?: string;
  options: CliOptions;
  positional: string[];
}

export declare function parseArgs(argv: string[]): ParsedArgs;
export declare function showHelp(command?: string): void;
export declare function showVersion(): void;

// Main CLI functions
export declare function runConvertCli(): Promise<CliResult>;
export declare function runServerCli(): Promise<CliResult>;
export declare function runTestCli(): Promise<CliResult>;
export declare function runViewerCli(): Promise<CliResult>;
export declare function runFileTypesCli(): Promise<CliResult>; 