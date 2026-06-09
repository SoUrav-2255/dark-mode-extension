// Dark Mode Extension - Background Service Worker

// Listen for tab updates to re-apply dark mode if globally enabled
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    chrome.storage.local.get(['globalEnabled', 'brightness', 'contrast'], (data) => {
      if (data.globalEnabled) {
        const hostname = new URL(tab.url).hostname;
        const siteKey = 'site_' + hostname;
        chrome.storage.local.get([siteKey], (siteData) => {
          // If this site is explicitly disabled, skip
          if (siteData[siteKey] === false) return;

          chrome.tabs.sendMessage(tabId, {
            action: 'enable',
            brightness: data.brightness ?? 100,
            contrast: data.contrast ?? 100
          }).catch(() => {
            // Tab may not have content script yet, ignore
          });
        });
      }
    });
  }
});
