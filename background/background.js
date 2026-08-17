// Background service worker for authenticated data fetching

// Update configuration
const UPDATE_CHECK_URL = 'https://raw.githubusercontent.com/ryanyakich/locust-extender/main/version.json'; // Replace with your actual remote URL
const UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

async function fetchData(url) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'accept': 'application/json, text/plain, */*',
        'content-type': 'application/json',
        'x-requested-with': 'XMLHttpRequest'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch failed for', url, error);
    throw error;
  }
}

// Version comparison function
function compareVersions(current, latest) {
  const currentParts = current.split('.').map(Number);
  const latestParts = latest.split('.').map(Number);
  
  for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
    const currentPart = currentParts[i] || 0;
    const latestPart = latestParts[i] || 0;
    
    if (latestPart > currentPart) return 1; // Update available
    if (latestPart < currentPart) return -1; // Current is newer
  }
  
  return 0; // Same version
}

// Check for updates
async function checkForUpdates() {
  try {
    // Check if automatic updates are enabled
    const settings = await chrome.storage.local.get(['autoUpdateEnabled']);
    if (settings.autoUpdateEnabled === false) {
      console.log('Automatic updates are disabled');
      return;
    }
    
    console.log('Checking for updates...');
    
    // Get current version from manifest
    const manifest = chrome.runtime.getManifest();
    const currentVersion = manifest.version;
    
    // Fetch version info from remote
    const response = await fetch(UPDATE_CHECK_URL);
    if (!response.ok) {
      console.log('Update check failed: HTTP error');
      return;
    }
    
    const versionInfo = await response.json();
    const latestVersion = versionInfo.version;
    
    console.log(`Current version: ${currentVersion}, Latest version: ${latestVersion}`);
    
    // Compare versions
    const comparison = compareVersions(currentVersion, latestVersion);
    
    console.log(`Version comparison result: ${comparison} (1 = update available, 0 = same, -1 = current newer)`);
    
    if (comparison === 1) {
      // Update available
      console.log('Update available!');
      
      // Store update info
      await chrome.storage.local.set({
        updateAvailable: true,
        latestVersion: latestVersion,
        downloadUrl: versionInfo.downloadUrl,
        releaseNotes: versionInfo.releaseNotes
      });
      
      // Show badge on all tabs
      const tabs = await chrome.tabs.query({});
      tabs.forEach(tab => {
        chrome.action.setBadgeText({ text: '🔄', tabId: tab.id });
        chrome.action.setBadgeBackgroundColor({ color: '#FF9800', tabId: tab.id });
      });
      
      // Also set default badge for new tabs
      chrome.action.setBadgeText({ text: '🔄' });
      chrome.action.setBadgeBackgroundColor({ color: '#FF9800' });
      
    } else {
      console.log('No update available');
      await chrome.storage.local.set({ updateAvailable: false });
    }
    
    // Store last check time
    await chrome.storage.local.set({ lastUpdateCheck: Date.now() });
    
  } catch (error) {
    console.error('Update check failed:', error);
  }
}

// Schedule periodic update checks
function scheduleUpdateChecks() {
  // Check immediately on startup
  checkForUpdates();
  
  // Then check periodically
  setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL);
}

// Extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Locust Shift Availability Checker installed');
  scheduleUpdateChecks();
});

// Track tabs that are waiting for navigation to locustspw.org
const waitingTabs = new Set();

// Listen for tab updates to detect navigation to locustspw.org
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  console.log('Tab updated:', tabId, changeInfo.status, tab.url);
  
  // Check if the tab has completed loading and the URL includes locustspw.org
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('locustspw.org')) {
    console.log('Tab completed loading on locustspw.org:', tabId);
    console.log('Waiting tabs:', Array.from(waitingTabs));
    
    // If this tab was waiting for navigation, refresh popup and set badge
    if (waitingTabs.has(tabId)) {
      console.log('Tab was waiting, refreshing popup');
      waitingTabs.delete(tabId);
      
      // Set badge to indicate extension is ready
      chrome.action.setBadgeText({ text: '!', tabId: tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#4CAF50', tabId: tabId });
      
      // Send message to popup to refresh (if popup is open)
      chrome.runtime.sendMessage({
        action: 'navigationComplete',
        tabId: tabId
      }).catch(err => {
        console.log('Popup not open, badge will indicate readiness:', err);
      });
    } else {
      console.log('Tab was not in waiting list');
    }
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.action, request);
  
  if (request.action === 'fetchData') {
    fetchData(request.url)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'waitForNavigation') {
    console.log('Received waitForNavigation for tab:', request.tabId);
    // Mark this tab as waiting for navigation to locustspw.org
    if (request.tabId) {
      waitingTabs.add(request.tabId);
      console.log('Added tab to waiting list. Current waiting tabs:', Array.from(waitingTabs));
    }
    sendResponse({ success: true });
  }
  
  if (request.action === 'checkForUpdates') {
    checkForUpdates().then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'dismissUpdate') {
    // Clear the update notification
    chrome.storage.local.set({ updateAvailable: false });
    
    // Clear badge
    chrome.action.setBadgeText({ text: '' });
    
    // Clear badge on all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.action.setBadgeText({ text: '', tabId: tab.id });
      });
    });
    
    sendResponse({ success: true });
  }
});
