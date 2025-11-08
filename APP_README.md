# SAZ Viewer

A 100% client-side, serverless web application for inspecting Telerik Fiddler .saz files directly in your browser.

## Features

- **No Installation Required**: Works entirely in your web browser
- **Privacy-First**: All file parsing happens locally—no data is uploaded to any server
- **Cross-Platform**: Works on macOS, Linux, and Windows
- **Smart Content Detection**: Automatically detects and formats JSON, XML, and binary content
- **Multi-View Inspector**: View HTTP sessions as raw text, parsed headers, formatted syntax, or hex dump

## How to Use

1. **Load a SAZ File**: Drag and drop a .saz file onto the drop zone, or click "Load SAZ File" to browse
2. **Select a Session**: Click on any session in the list to view its details
3. **Inspect Request/Response**: View formatted headers, syntax-highlighted JSON/XML, or raw HTTP messages

## Supported Content Types

- **JSON**: Automatic syntax highlighting and formatting
- **XML**: Automatic syntax highlighting
- **Binary Content**: Hex viewer for images, PDFs, and other binary data
- **Plain Text**: Raw view always available for any content type

## Technical Details

- Built with React and TypeScript
- Uses JSZip for client-side .saz file parsing
- Powered by highlight.js for syntax highlighting
- No backend servers or data transmission

## Creating Test SAZ Files

To create a .saz file for testing:
1. Download Fiddler Classic (Windows) or Fiddler Everywhere (cross-platform)
2. Capture HTTP traffic from your application
3. Save the session(s) as a .saz archive

## Security

This application never sends your .saz files or their contents to any server. All parsing and inspection happens entirely in your browser using JavaScript. Your sensitive HTTP captures (including cookies, auth tokens, and request/response data) remain completely private.
