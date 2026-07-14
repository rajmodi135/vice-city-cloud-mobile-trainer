// Injected into the game frame main world context to override fullscreen requests
(function() {
  const originalRequest = Element.prototype.requestFullscreen || 
                          Element.prototype.webkitRequestFullscreen || 
                          Element.prototype.mozRequestFullScreen || 
                          Element.prototype.msRequestFullscreen;
                          
  if (originalRequest) {
    const customRequest = function(options) {
      if (this.tagName && this.tagName.toLowerCase() === "canvas") {
        const parent = this.parentElement;
        if (parent) {
          const computed = window.getComputedStyle(parent);
          if (computed.position === "static") {
            parent.style.position = "relative";
          }
          const overlay = document.getElementById("vcc-trainer-overlay");
          if (overlay && overlay.parentElement !== parent) {
            parent.appendChild(overlay);
          }
          return originalRequest.call(parent, options);
        }
      }
      return originalRequest.call(this, options);
    };
    
    try {
      if (Element.prototype.requestFullscreen) Element.prototype.requestFullscreen = customRequest;
      if (Element.prototype.webkitRequestFullscreen) Element.prototype.webkitRequestFullscreen = customRequest;
      if (Element.prototype.mozRequestFullScreen) Element.prototype.mozRequestFullScreen = customRequest;
      if (Element.prototype.msRequestFullscreen) Element.prototype.msRequestFullscreen = customRequest;
      console.log("[Trainer Extension] Installed main-world requestFullscreen hooks successfully.");
    } catch (e) {
      console.error("[Trainer Extension] Failed to hook Element.prototype.requestFullscreen:", e);
    }
  }
})();
