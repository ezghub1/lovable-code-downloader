
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize i18n
  initializeI18n();
  
  const downloadBtn = document.getElementById('download-btn');
  const statusDiv = document.getElementById('status');
  const projectInfo = document.getElementById('project-info');
  const projectIdSpan = document.getElementById('project-id');
  const tokenStatusSpan = document.getElementById('token-status');
  
  let pageData = null;
  
  // Get current tab and check if it's a Lovable project page
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url || !tab.url.match(/^https:\/\/lovable\.dev\/projects\/[^\/]+\/?$/)) {
    showStatus(chrome.i18n.getMessage('onlyWorksOnLovable'), 'warning');
    downloadBtn.disabled = true;
    return;
  }
  
  // Get page data from content script
  try {
    pageData = await chrome.tabs.sendMessage(tab.id, { action: 'getPageData' });
    
    if (!pageData.projectId) {
      showStatus(chrome.i18n.getMessage('couldNotExtractProjectId'), 'error');
      downloadBtn.disabled = true;
      return;
    }
    
    if (!pageData.token) {
      showStatus(chrome.i18n.getMessage('couldNotFindToken'), 'error');
      downloadBtn.disabled = true;
      return;
    }
    
    // Show project info
    projectIdSpan.textContent = pageData.projectId;
    tokenStatusSpan.textContent = chrome.i18n.getMessage('tokenFound');
    projectInfo.classList.remove('hidden');
    showStatus(chrome.i18n.getMessage('readyToDownload'), 'success');
    
  } catch (error) {
    console.error('Error getting page data:', error);
    showStatus(chrome.i18n.getMessage('errorCommunicating'), 'error');
    downloadBtn.disabled = true;
    return;
  }
  
  // Handle download button click
  downloadBtn.addEventListener('click', async () => {
    if (!pageData) return;
    
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = `
      <div class="loading"></div>
      ${chrome.i18n.getMessage('downloading')}
    `;
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'downloadProject',
        projectId: pageData.projectId,
        token: pageData.token
      });
      
      if (response.success) {
        showStatus(chrome.i18n.getMessage('downloadSuccess', [response.result.filesCount.toString()]), 'success');
        downloadBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20,6 9,17 4,12"/>
          </svg>
          ${chrome.i18n.getMessage('downloadComplete')}
        `;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      console.error('Download failed:', error);
      showStatus(chrome.i18n.getMessage('downloadFailed', [error.message]), 'error');
      downloadBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7,10 12,15 17,10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        ${chrome.i18n.getMessage('retryDownload')}
      `;
      downloadBtn.disabled = false;
    }
  });
  
  function showStatus(message, type) {
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.classList.remove('hidden');
  }
  
  function initializeI18n() {
    // Initialize all i18n elements
    const i18nElements = document.querySelectorAll('[data-i18n]');
    i18nElements.forEach(element => {
      const messageKey = element.getAttribute('data-i18n');
      const message = chrome.i18n.getMessage(messageKey);
      if (message) {
        element.textContent = message;
      }
    });
  }
});
