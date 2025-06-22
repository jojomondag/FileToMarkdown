**[Commands](COMMANDS.md)** • **[API Reference](API.md)** • **[Browser Usage](BROWSER.md)** • **[TypeScript](TYPESCRIPT.md)** • **[File Types](CONVERTERS.md)**

# TypeScript Support

FileToMarkdown includes complete TypeScript type definitions for enhanced development experience across all platforms and use cases.

## Quick Start

```bash
npm install filetomarkdown
# TypeScript definitions included automatically
```

## Core API Types

### Main Converter Class

```typescript
import { MarkitDown } from 'filetomarkdown';
import type { MarkitDownOptions } from 'filetomarkdown';

// Create converter with typed options
const options: MarkitDownOptions = {
  collapsible: true
};

const converter = new MarkitDown(options);
const markdown: string = await converter.convertToMarkdown('document.pdf');
```

### Convenience Functions

```typescript
import { convertToMarkdown, getFileTypes, getFileTypeDescriptions } from 'filetomarkdown';
import type { FileTypeDescriptions } from 'filetomarkdown';

// Type-safe conversion
const result: string = await convertToMarkdown('input.docx', 'output.md');

// Type-safe file type information
const types: string[] = getFileTypes();
const descriptions: FileTypeDescriptions = getFileTypeDescriptions();
```

## Browser Client Types

### Client Configuration

```typescript
import { FileToMarkdownClient } from 'filetomarkdown';
import type { 
  FileToMarkdownClientOptions,
  ConvertResponse,
  SupportedTypesResponse 
} from 'filetomarkdown';

const options: FileToMarkdownClientOptions = {
  baseURL: 'http://localhost:3000'
};

const client = new FileToMarkdownClient(options);
```

### File Conversion

```typescript
// Type-safe file conversion
const file: File = fileInput.files[0];
const response: ConvertResponse = await client.convertFile(file);

if (response.success) {
  console.log(response.markdown);
} else {
  console.error(response.error);
}
```

### Supported Types Query

```typescript
const typesResponse: SupportedTypesResponse = await client.getSupportedTypes();
console.log(typesResponse.fileTypes);      // string[]
console.log(typesResponse.descriptions);   // FileTypeDescriptions
```

## Server API Types

For server-side development and API integration:

```typescript
import type { 
  ConvertRequest,
  ConvertHandler,
  FileTypesHandler,
  ServerOptions,
  CreateServerOptions 
} from 'filetomarkdown/types/server';

// Type-safe route handlers
const convertHandler: ConvertHandler = async (req, res) => {
  const file = req.file; // Typed as Express.Multer.File
  // Implementation...
};

// Server configuration
const serverOptions: CreateServerOptions = {
  port: 3000,
  cors: true,
  maxFileSize: 50 * 1024 * 1024 // 50MB
};
```

## Converter Implementation Types

For extending or working with converters:

```typescript
import type { 
  BaseConverter,
  ConverterOptions,
  ConverterClass 
} from 'filetomarkdown/types/converters';

// Implement custom converter
class CustomConverter implements BaseConverter {
  async convert(filePath: string, options?: ConverterOptions): Promise<string> {
    // Implementation with type safety
    return "# Converted Content";
  }
}

// Converter class with static properties
const MyConverter: ConverterClass = CustomConverter;
```

## CLI Types

For CLI development and tooling:

```typescript
import type { 
  CliOptions,
  ConvertCliArgs,
  CliResult,
  ConversionResult 
} from 'filetomarkdown/types/cli';

// Type-safe CLI argument handling
const args: ConvertCliArgs = {
  inputFile: 'document.pdf',
  outputFile: 'output.md'
};

// Type-safe CLI results
const result: ConversionResult = {
  success: true,
  inputPath: args.inputFile,
  outputPath: args.outputFile,
  exitCode: 0,
  conversionTime: 1250
};
```

## Advanced Usage

### Error Handling with Types

```typescript
import type { ConvertResponse } from 'filetomarkdown';

async function safeConvert(file: File): Promise<string> {
  try {
    const client = new FileToMarkdownClient();
    const response: ConvertResponse = await client.convertFile(file);
    
    if (response.success && response.markdown) {
      return response.markdown;
    } else {
      throw new Error(response.error || 'Conversion failed');
    }
  } catch (error) {
    console.error('Type-safe error handling:', error);
    throw error;
  }
}
```

### Generic Type Utilities

```typescript
// Working with file type mappings
type SupportedExtension = keyof FileTypeDescriptions;
type ConverterType<T extends SupportedExtension> = T extends 'js' | 'ts' ? 'code' : 'document';

// Type guards for runtime checking
function isConvertResponse(obj: any): obj is ConvertResponse {
  return obj && typeof obj.success === 'boolean';
}
```

## IDE Integration

### VS Code

TypeScript definitions enable:
- **IntelliSense**: Auto-completion for all methods and properties
- **Parameter Hints**: Inline documentation for function parameters  
- **Type Checking**: Real-time error detection
- **Go to Definition**: Navigate to type definitions
- **Refactoring**: Safe renaming and restructuring

### WebStorm/IntelliJ

Full support for:
- Smart code completion
- Type-aware inspections
- Automatic imports
- Built-in documentation

## Benefits Summary

✅ **Complete Type Safety** - Catch errors at compile time  
✅ **Enhanced IDE Experience** - Rich IntelliSense and documentation  
✅ **Better Refactoring** - Safe code changes with TypeScript compiler  
✅ **Team Productivity** - Clear interfaces and contracts  
✅ **Enterprise Ready** - Professional development standards  
✅ **Zero Runtime Overhead** - Types are compile-time only  

---

[← Back to Main Documentation](../Readme.md) 