// Background service worker for authenticated data fetching

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

// Extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Locust Shift Availability Checker installed');
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
});
