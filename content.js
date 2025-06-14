
// Content script to extract token from the page
function extractTokenFromPage() {
  try {
    // Get all script tags
    const scripts = document.getElementsByTagName('script');
    
    for (let script of scripts) {
      const content = script.innerHTML;
      
      // Look for the specific pattern with idToken using escaped quotes
      const tokenMatch = content.match(/\\"idToken\\":\\"([^"]+)\\"/);
      if (tokenMatch) {
        return tokenMatch[1];
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting token:', error);
    return null;
  }
}

function getProjectIdFromUrl() {
  const url = window.location.href;
  const match = url.match(/https:\/\/lovable\.dev\/projects\/([^\/]+)/);
  return match ? match[1] : null;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageData') {
    const token = extractTokenFromPage();
    const projectId = getProjectIdFromUrl();
    
    sendResponse({
      token: token,
      projectId: projectId,
      url: window.location.href
    });
  }
});

// Notify background script that we're on a Lovable project page
if (window.location.href.match(/^https:\/\/lovable\.dev\/projects\/[^\/]+\/?$/)) {
  chrome.runtime.sendMessage({
    action: 'pageLoaded',
    url: window.location.href
  });
}
