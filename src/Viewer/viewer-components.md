# FileToMarkdown Viewer Components Hierarchy

This document outlines the key components, buttons, and divs that make up the FileToMarkdown Viewer interface, arranged in hierarchical order.

## Main UI Structure

### Sidebar
- **Button: Menu Toggle** (id="b")
  - SVG icon with three horizontal lines
  - Purpose: Toggle the sidebar visibility

- **Sidebar Header** (class="sidebar-header")
  - **Title** (class="sidebar-title"): Displays "FileToMarkdown"

- **File Tree** (id="l", class="file-tree")
  - Purpose: Displays the hierarchical list of files and folders
  - Managed by: `FileList` component
  - Features:
    - Expandable/collapsible folders
    - File selection
    - Context actions for files and folders

- **Dropzone** (id="z", class="dropzone")
  - SVG upload icon
  - Purpose: Area for users to drag-and-drop or click to select folders with markdown files

### Main Content Area
- **Welcome Screen** (id="welcome-screen", class="welcome-screen")
  - Shown when no files are loaded
  - Contains:
    - Welcome header and introduction
    - Getting Started instructions
    - Features list

- **Content Container** (id="content", class="content-container")
  - **Markdown Content Div** (class="markdown-content")
  - Purpose: Contains the rendered markdown content

## Component Classes

### FileList Component
- **Purpose**: Manages and renders the file tree in the sidebar
- **Key Functions**:
  - `render()`: Renders the file list UI
  - `renderFolder()`: Creates folder elements with expand/collapse functionality
  - `renderFileItem()`: Creates file elements with selection capability
  - `toggleFolder()`: Handles folder expansion/collapse
  - `handleDeleteFileClick()`: Manages file deletion
  - `handleDeleteFolderClick()`: Manages folder deletion
  - `handleRefreshFolderClick()`: Refreshes folder contents

### Preview Component
- **Purpose**: Renders markdown content as HTML
- **Key Functions**:
  - `setContent()`: Updates the markdown content
  - `render()`: Converts markdown to HTML and displays it
  - `setupLinkHandlers()`: Configures external links to open in new tabs

### Editor Component
- **Purpose**: Provides editing capability for markdown files
- **Key Functions**:
  - `setContent()`: Sets the editor content
  - `getContent()`: Retrieves the current editor content
  - `render()`: Creates the textarea element for editing

### Header Component
- **Purpose**: Renders the application header
- **Key Functions**:
  - `render()`: Creates the header with the application title

## UI Interactions

### File Navigation
1. Users can click on folders in the sidebar to expand/collapse them
2. Clicking on a file selects it and displays its content in the main area

### File Management
1. The dropzone allows users to add files through:
   - Drag and drop
   - Clicking to open a file browser
2. Files can be deleted through the context menu in the file tree

### Content Viewing/Editing
1. Files are displayed in the markdown content area
2. The Preview component renders the markdown with syntax highlighting
3. The Editor component allows for direct editing of the content

## Implementation Note
All components extend from BaseComponent, which provides basic container management functionality. The viewer uses a component-based architecture for modularity and maintainability. 