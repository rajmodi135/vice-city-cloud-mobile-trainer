// Background Service Worker

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "launchGame") {
    (async () => {
      try {
        // Get the current active tab in the current window
        const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (activeTab) {
          // Update the active tab's URL to open the game in the same tab
          await chrome.tabs.update(activeTab.id, { 
            url: "https://rajmodi135.github.io/vice-city-launcher/game/index.html"
          });
          sendResponse({ success: true, status: "loaded_in_same_tab" });
        } else {
          // Fallback if no active tab is detected
          await chrome.tabs.create({ 
            url: "https://rajmodi135.github.io/vice-city-launcher/game/index.html"
          });
          sendResponse({ success: true, status: "opened_fallback" });
        }
      } catch (err) {
        console.error("Error in launchGame worker:", err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // Keep channel open for async sendResponse
  }
});
