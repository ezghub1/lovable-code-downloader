
# Lovable Code Downloader Chrome Extension

A Chrome extension that allows you to download source code from Lovable projects as ZIP files.

## Features

- **Automatic Detection**: Only activates on Lovable project pages (`https://lovable.dev/projects/*`)
- **Token Extraction**: Automatically extracts authentication tokens from the page
- **API Integration**: Downloads source code via Lovable's API
- **ZIP Creation**: Packages all files into a downloadable ZIP archive
- **User-Friendly**: Simple popup interface with status updates

## Installation

1. Download or clone this extension code
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder

## Usage

1. Navigate to any Lovable project page (`https://lovable.dev/projects/your-project-id`)
2. Make sure you're logged in to Lovable
3. Click the extension icon in the toolbar
4. Click "Download Project Code" in the popup
5. Choose where to save the ZIP file

## How it Works

1. **Page Detection**: The extension monitors tab URLs and activates only on Lovable project pages
2. **Token Extraction**: A content script searches for authentication tokens in the page's JavaScript
3. **Project ID**: Extracts the project ID from the URL
4. **API Call**: Makes an authenticated request to `https://lovable-api.com/projects/{id}/source-code`
5. **ZIP Creation**: Processes the returned files and creates a ZIP archive
6. **Download**: Triggers the browser's download functionality

## Required Permissions

- `activeTab`: To access the current Lovable project page
- `storage`: To store temporary data if needed
- `downloads`: To trigger file downloads
- Host permissions for `lovable.dev` and `lovable-api.com`

## File Structure

```
├── manifest.json          # Extension configuration
├── background.js          # Service worker for API calls and ZIP creation
├── content.js            # Content script for token extraction
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── lib/
│   └── jszip.min.js      # JSZip library for ZIP creation
├── icons/
│   ├── download-16.png   # Extension icons (16x16)
│   ├── download-32.png   # Extension icons (32x32)  
│   ├── download-48.png   # Extension icons (48x48)
│   └── download-128.png  # Extension icons (128x128)
└── README.md            # This file
```

## Notes

- The extension requires you to be logged in to Lovable
- Make sure to replace the placeholder JSZip implementation with the actual library
- Create appropriate icon files for the extension
- The extension only works on Lovable project pages for security reasons

## Development

To modify the extension:

1. Make your changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon next to your extension
4. Test the changes on a Lovable project page

## Troubleshooting

- **Extension not showing**: Make sure you're on a valid Lovable project URL
- **Token not found**: Ensure you're logged in to Lovable and refresh the page
- **Download fails**: Check the browser console for error messages
- **ZIP not working**: Make sure you've included the actual JSZip library
