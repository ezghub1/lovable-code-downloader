
// Import JSZip library
importScripts('./lib/jszip.min.js');

// Background script to manage extension state and API calls
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const isLovableProject = /^https:\/\/lovable\.dev\/projects\/[^\/]+\/?$/.test(tab.url);
    
    if (isLovableProject) {
      // Show the action icon
      chrome.action.setIcon({
        tabId: tabId,
        path: {
          "16": "icons/download-16.png",
          "32": "icons/download-32.png",
          "48": "icons/download-48.png",
          "128": "icons/download-128.png"
        }
      });
      chrome.action.enable(tabId);
    } else {
      // Hide the action icon
      chrome.action.disable(tabId);
    }
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'downloadProject') {
    downloadProject(request.projectId, request.token)
      .then(result => sendResponse({success: true, result}))
      .catch(error => sendResponse({success: false, error: error.message}));
    return true; // Keep message channel open for async response
  }
});

async function downloadProject(projectId, token) {
  try {
    console.log('Downloading project:', projectId);
    
    const response = await fetch(`https://lovable-api.com/projects/${projectId}/source-code`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API response received, files count:', data.files?.length);

    if (!data.files || !Array.isArray(data.files)) {
      throw new Error('Invalid API response: missing files array');
    }

    // Create ZIP file
    const zipBlob = await createZipFile(data.files);

    // Download the file using data URL
    const downloadId = await chrome.downloads.download({
      url: `data:application/octet-stream;base64,${zipBlob}`,
      filename: `lovable-project-${projectId}.zip`,
      saveAs: true
    });
    
    return { downloadId, filesCount: data.files.length };
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

async function createZipFile(files) {
  const zip = new JSZip();
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'];

  // Add each file to the zip
  files.forEach(file => {
    // First check if file.contents exist, if not skip this file
    if (!file.contents) {
      console.log(`Skipping file ${file.name} - no contents`);
      return;
    }

    // Extract file extension from file.name
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Check if it's a common image extension
    if (imageExtensions.includes(extension)) {
      // Check if the first 30 characters of file.contents contain "data:image"
      const first30Chars = file.contents.substring(0, 30);
      if (first30Chars.includes('data:image')) {
        // Check if it contains "base64,"
        if (file.contents.includes('base64,')) {
          // Substring the content after "base64,"
          let base64Content = file.contents.substring(file.contents.indexOf('base64,') + 7);
          
          // Trim "\n" at the end if present
          base64Content = base64Content.replace(/\n$/, '');
          
          // Treat as binary (atob then write to zip as bytes)
          try {
            const binaryData = atob(base64Content);
            const bytes = new Uint8Array(binaryData.length);
            for (let i = 0; i < binaryData.length; i++) {
              bytes[i] = binaryData.charCodeAt(i);
            }
            zip.file(file.name, bytes);
            console.log(`Added image file as binary: ${file.name}`);
          } catch (error) {
            console.error(`Failed to decode base64 for ${file.name}:`, error);
            // Fallback to text file
            zip.file(file.name, file.contents);
          }
        } else {
          // Treat as text file
          zip.file(file.name, file.contents);
        }
      } else {
        // Treat as text file
        zip.file(file.name, file.contents);
      }
    } else {
      // For other extensions, treat as text files
      zip.file(file.name, file.contents);
    }
  });

  // Generate the zip file
  return await zip.generateAsync({ type: 'base64' });
}
