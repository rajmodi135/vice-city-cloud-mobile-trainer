// content.js - GTA VICELAUNCHER: Cloud Play & Mod Launcher

console.log("[Trainer Extension] content.js loading context...");

const CHEATS = [
  {"action": "[ TOGGLE GRID MODE ]", "code": "TOGGLE_LAYOUT", "key_char": "", "grid_name": "GRID VIEW", "icon": "📋"},
  {"action": "[ TOGGLE THEATER MODE ]", "code": "ACTION_THEATER", "key_char": "", "grid_name": "THEATER", "icon": "📺"},
  {"action": "[ CAMERA: TAKE PHOTO ]", "code": "ACTION_PHOTO", "key_char": "", "grid_name": "CAMERA", "icon": "📸"},
  {"action": "[ CAMERA: RECORD VIDEO ]", "code": "ACTION_RECORD", "key_char": "", "grid_name": "RECORDER", "icon": "📹"},
  {"action": "Full Health", "code": "aspirine", "key_char": "h", "grid_name": "HEALTH", "icon": "❤️"},
  {"action": "Full Armor", "code": "preciousprotection", "key_char": "a", "grid_name": "ARMOR", "icon": "🛡️"},
  {"action": "Weapon Set 1 (Light)", "code": "thugstools", "key_char": "1", "grid_name": "WEAPONS 1", "icon": "🔫"},
  {"action": "Weapon Set 2 (Medium)", "code": "professionaltools", "key_char": "2", "grid_name": "WEAPONS 2", "icon": "💣"},
  {"action": "Weapon Set 3 (Heavy)", "code": "nuttertools", "key_char": "3", "grid_name": "WEAPONS 3", "icon": "🚀"},
  {"action": "Lower Wanted Level", "code": "leavemealone", "key_char": "l", "grid_name": "WANTED -", "icon": "🕵️"},
  {"action": "Raise Wanted Level", "code": "youwonttakemealive", "key_char": "u", "grid_name": "WANTED +", "icon": "👮"},
  {"action": "Spawn Rhino (Tank)", "code": "panzer", "key_char": "t", "grid_name": "TANK", "icon": "🎖️"},
  {"action": "Spawn Sabre Turbo", "code": "gettherefast", "key_char": "c", "grid_name": "SABRE", "icon": "🏎️"},
  {"action": "Spawn Hotring Racer", "code": "getthereamazinglyfast", "key_char": "r", "grid_name": "RACER", "icon": "🏁"},
  {"action": "Spawn Love Fist Limo", "code": "rockandrollcar", "key_char": "o", "grid_name": "LIMO", "icon": "🎵"},
  {"action": "Drive on Water", "code": "seaways", "key_char": "w", "grid_name": "WATER", "icon": "🌊"},
  {"action": "Flying Cars", "code": "comeflywithme", "key_char": "f", "grid_name": "FLY", "icon": "✈️"},
  {"action": "Perfect Handling", "code": "gripiseverything", "key_char": "g", "grid_name": "STEERING", "icon": "🔧"},
  {"action": "Blow Up All Cars", "code": "bigbang", "key_char": "b", "grid_name": "DETONATE", "icon": "💥"},
  {"action": "Clear Weather", "code": "alovelyday", "key_char": "k", "grid_name": "WEATHER", "icon": "☀️"},
  {"action": "Speed Up Game", "code": "ontherunway", "key_char": "s", "grid_name": "SPEED", "icon": "⏩"},
  {"action": "Slow Down Game", "code": "booooooring", "key_char": "m", "grid_name": "SLOW", "icon": "⏪"},
];

const VIEWPORT_SIZE = 5;
let isMenuOpen = false;
let selectedIndex = 0;
let scrollStart = 0;
let layoutMode = "list"; // "list" or "grid"

let overlayEl = null;
let upIndicatorEl = null;
let downIndicatorEl = null;
let clockTimer = null;

let mediaRecorder = null;
let recordedChunks = [];
let recordStream = null;

// Initialize Smartphone Overlay DOM
function initOverlay() {
  if (document.getElementById("vcc-trainer-overlay")) {
    console.log("[Trainer Extension] Overlay element already exists.");
    return;
  }

  console.log("[Trainer Extension] Constructing Smartphone Overlay DOM...");

  // Create Top-Left floating instructions note
  const helpNote = document.createElement("div");
  helpNote.id = "vcc-trainer-help-note";
  helpNote.innerHTML = `
    <span class="vcc-key-badge">▲ UP ARROW</span>
    <span class="vcc-note-text">PRESS TO OPEN PHONE HUD</span>
  `;
  document.body.appendChild(helpNote);

  // Root Container
  overlayEl = document.createElement("div");
  overlayEl.id = "vcc-trainer-overlay";
  overlayEl.style.display = "none";

  // Phone Body
  const phoneBody = document.createElement("div");
  phoneBody.className = "vcc-phone-body";

  // Speaker & Notch
  const notch = document.createElement("div");
  notch.className = "vcc-phone-notch";
  phoneBody.appendChild(notch);

  // Phone Screen
  const screen = document.createElement("div");
  screen.className = "vcc-phone-screen";

  // Status Bar
  const statusBar = document.createElement("div");
  statusBar.className = "vcc-phone-status-bar";

  const timeSpan = document.createElement("span");
  timeSpan.className = "vcc-phone-time";
  timeSpan.textContent = "12:00";

  const iconSpan = document.createElement("span");
  iconSpan.className = "vcc-phone-icons";
  iconSpan.textContent = "📶 🔋 98%";

  statusBar.appendChild(timeSpan);
  statusBar.appendChild(iconSpan);
  screen.appendChild(statusBar);

  // App Body
  const appBody = document.createElement("div");
  appBody.className = "vcc-phone-app-body";

  const appTitle = document.createElement("div");
  appTitle.className = "vcc-phone-app-title";
  appTitle.textContent = "VICELAUNCHER";
  appBody.appendChild(appTitle);

  // Viewport Up Arrow (List Mode scroll indicator)
  upIndicatorEl = document.createElement("div");
  upIndicatorEl.className = "vcc-phone-scroll-indicator";
  upIndicatorEl.textContent = "▲";
  appBody.appendChild(upIndicatorEl);

  // Core List & Grid frame
  const listFrame = document.createElement("div");
  listFrame.className = "vcc-phone-list-frame list-mode";
  appBody.appendChild(listFrame);

  // Viewport Down Arrow (List Mode scroll indicator)
  downIndicatorEl = document.createElement("div");
  downIndicatorEl.className = "vcc-phone-scroll-indicator";
  downIndicatorEl.textContent = "▼";
  appBody.appendChild(downIndicatorEl);

  // Action Help Label
  const helpLbl = document.createElement("div");
  helpLbl.className = "vcc-phone-help";
  helpLbl.textContent = "[▲/▼] NAV  [ENTER] DIAL";
  appBody.appendChild(helpLbl);

  // Powered by Mauxx AI branding watermark label
  const branding = document.createElement("div");
  branding.className = "vcc-phone-branding";
  branding.textContent = "POWERED BY MAUXX AI";
  appBody.appendChild(branding);

  screen.appendChild(appBody);

  // Home Screen Bar
  const homeBar = document.createElement("div");
  homeBar.className = "vcc-phone-home-indicator";
  screen.appendChild(homeBar);

  phoneBody.appendChild(screen);
  overlayEl.appendChild(phoneBody);

  // Append overlay securely directly to the document body to prevent layout clipping
  document.body.appendChild(overlayEl);
  console.log("[Trainer Extension] Overlay attached to iframe document body.");

  // Clock Update Loop
  updatePhoneClock();
  clockTimer = setInterval(updatePhoneClock, 30000);
}

// Update the real-time clock inside the virtual phone
function updatePhoneClock() {
  const clockEl = document.querySelector(".vcc-phone-time");
  if (clockEl) {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    clockEl.textContent = `${hours}:${minutes}`;
  }
}

// Redraw list or grid viewport inside the virtual phone dynamically
function renderPhoneScreen() {
  const listFrame = document.querySelector(".vcc-phone-list-frame");
  if (!listFrame) return;

  listFrame.innerHTML = "";

  // Update layout button description dynamically
  if (layoutMode === "grid") {
    CHEATS[0].action = "[ TOGGLE LIST MODE ]";
    CHEATS[0].grid_name = "LIST VIEW";
    CHEATS[0].icon = "📋";
  } else {
    CHEATS[0].action = "[ TOGGLE GRID MODE ]";
    CHEATS[0].grid_name = "GRID VIEW";
    CHEATS[0].icon = "📋";
  }

  const helpEl = document.querySelector(".vcc-phone-help");

  if (layoutMode === "list") {
    listFrame.className = "vcc-phone-list-frame list-mode";
    if (upIndicatorEl) upIndicatorEl.style.display = "block";
    if (downIndicatorEl) downIndicatorEl.style.display = "block";
    if (helpEl) helpEl.textContent = "[▲/▼] NAV  [ENTER] DIAL";

    if (selectedIndex < scrollStart) {
      scrollStart = selectedIndex;
    } else if (selectedIndex >= scrollStart + VIEWPORT_SIZE) {
      scrollStart = selectedIndex - VIEWPORT_SIZE + 1;
    }

    // Active glowing indicators
    if (scrollStart > 0) {
      upIndicatorEl.classList.add("glowing");
    } else {
      upIndicatorEl.classList.remove("glowing");
    }

    if (scrollStart + VIEWPORT_SIZE < CHEATS.length) {
      downIndicatorEl.classList.add("glowing");
    } else {
      downIndicatorEl.classList.remove("glowing");
    }

    // Draw list rows
    for (let i = 0; i < VIEWPORT_SIZE; i++) {
      const itemIndex = scrollStart + i;
      if (itemIndex < CHEATS.length) {
        const cheat = CHEATS[itemIndex];
        const lbl = document.createElement("div");
        if (itemIndex === selectedIndex) {
          lbl.textContent = `► ${cheat.action.toUpperCase()}`;
          lbl.className = "vcc-phone-list-item active";
        } else {
          lbl.textContent = cheat.action.toUpperCase();
          lbl.className = "vcc-phone-list-item";
        }
        listFrame.appendChild(lbl);
      }
    }
  } else {
    // Grid layout mode (3-columns icon dashboard)
    listFrame.className = "vcc-phone-list-frame grid-mode";
    if (upIndicatorEl) upIndicatorEl.style.display = "none";
    if (downIndicatorEl) downIndicatorEl.style.display = "none";
    if (helpEl) helpEl.textContent = "[◀/▶/▲/▼] NAV  [ENT] DIAL";

    // Draw grid of icons
    CHEATS.forEach((cheat, index) => {
      const gridItem = document.createElement("div");
      gridItem.className = "vcc-phone-grid-item";
      if (index === selectedIndex) {
        gridItem.classList.add("active");
      }

      // App Icon (Emoji representation)
      const iconSpan = document.createElement("span");
      iconSpan.className = "vcc-phone-grid-icon";
      iconSpan.textContent = cheat.icon || "🎮";

      // App Label (Short text)
      const labelSpan = document.createElement("span");
      labelSpan.className = "vcc-phone-grid-label";
      labelSpan.textContent = cheat.grid_name || cheat.action.substring(0, 8);

      gridItem.appendChild(iconSpan);
      gridItem.appendChild(labelSpan);
      listFrame.appendChild(gridItem);
    });

    // Auto-scroll the grid container to keep the active item in focus
    const activeEl = listFrame.querySelector(".vcc-phone-grid-item.active");
    if (activeEl) {
      activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }
}

// Sandbox-safe and iframe-safe frame checks
const isGameFrame = (window !== window.top) || 
                     window.location.hostname.includes("vc.quenq.com") || 
                     document.querySelector("canvas") !== null;

console.log("[Trainer Extension] Context variables:", {
  hostname: window.location.hostname,
  isIframe: window !== window.top,
  isGameFrame: isGameFrame
});

let gameAudioCtx = null;

// Synthesize premium telephone call/dial DTMF beeps inside the game frame
function playMenuSound(type) {
  try {
    if (!gameAudioCtx) {
      gameAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (gameAudioCtx.state === "suspended") {
      gameAudioCtx.resume();
    }

    if (type === "navigate") {
      // Short key tone (DTMF beep)
      const osc1 = gameAudioCtx.createOscillator();
      const osc2 = gameAudioCtx.createOscillator();
      const gain = gameAudioCtx.createGain();
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(gameAudioCtx.destination);
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(697, gameAudioCtx.currentTime); // Low group
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1209, gameAudioCtx.currentTime); // High group
      gain.gain.setValueAtTime(0.02, gameAudioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, gameAudioCtx.currentTime + 0.08);
      osc1.start();
      osc1.stop(gameAudioCtx.currentTime + 0.08);
      osc2.start();
      osc2.stop(gameAudioCtx.currentTime + 0.08);
    } else if (type === "open") {
      // Slide up sound
      const osc1 = gameAudioCtx.createOscillator();
      const gain = gameAudioCtx.createGain();
      osc1.connect(gain);
      gain.connect(gameAudioCtx.destination);
      
      osc1.type = "triangle";
      osc1.frequency.setValueAtTime(250, gameAudioCtx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(750, gameAudioCtx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.03, gameAudioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, gameAudioCtx.currentTime + 0.18);
      osc1.start();
      osc1.stop(gameAudioCtx.currentTime + 0.18);
    } else if (type === "select") {
      // Telephone ring dial tone
      const osc1 = gameAudioCtx.createOscillator();
      const osc2 = gameAudioCtx.createOscillator();
      const gain = gameAudioCtx.createGain();
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(gameAudioCtx.destination);
      
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(440, gameAudioCtx.currentTime);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(480, gameAudioCtx.currentTime);
      gain.gain.setValueAtTime(0.025, gameAudioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, gameAudioCtx.currentTime + 0.35);
      osc1.start();
      osc1.stop(gameAudioCtx.currentTime + 0.35);
      osc2.start();
      osc2.stop(gameAudioCtx.currentTime + 0.35);
    } else if (type === "shutter") {
      // Synthesize noise-shutter snap for camera photos
      const bufferSize = gameAudioCtx.sampleRate * 0.08;
      const buffer = gameAudioCtx.createBuffer(1, bufferSize, gameAudioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = gameAudioCtx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = gameAudioCtx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 1500;
      
      const noiseGain = gameAudioCtx.createGain();
      noiseGain.gain.setValueAtTime(0.06, gameAudioCtx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, gameAudioCtx.currentTime + 0.08);
      
      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(gameAudioCtx.destination);
      
      noise.start();
    }
  } catch (err) {
    console.warn("DTMF tone synthesis blocked:", err);
  }
}

if (isGameFrame) {
  console.log("[Trainer Extension] Injecting smartphone HUD logic inside frame.");

  // Inject the fullscreen override script directly into the page context
  const fsOverrideScript = document.createElement("script");
  fsOverrideScript.textContent = `
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
        
        if (Element.prototype.requestFullscreen) Element.prototype.requestFullscreen = customRequest;
        if (Element.prototype.webkitRequestFullscreen) Element.prototype.webkitRequestFullscreen = customRequest;
        if (Element.prototype.mozRequestFullScreen) Element.prototype.mozRequestFullScreen = customRequest;
        if (Element.prototype.msRequestFullscreen) Element.prototype.msRequestFullscreen = customRequest;
      }
    })();
  `;
  (document.head || document.documentElement).appendChild(fsOverrideScript);
  fsOverrideScript.remove();

  // Relocate the smartphone overlay inside the active fullscreen element if a change occurs
  const handleFullscreenChange = () => {
    const fsElement = document.fullscreenElement || 
                      document.webkitFullscreenElement || 
                      document.mozFullScreenElement || 
                      document.msFullscreenElement;
                      
    const overlay = document.getElementById("vcc-trainer-overlay");
    if (overlay) {
      if (fsElement) {
        console.log("[Trainer Extension] Relocating overlay inside fullscreen container:", fsElement);
        fsElement.appendChild(overlay);
      } else {
        console.log("[Trainer Extension] Restoring overlay back to document body.");
        document.body.appendChild(overlay);
      }
    }

    const note = document.getElementById("vcc-trainer-help-note");
    if (note) {
      if (fsElement) {
        fsElement.appendChild(note);
      } else {
        document.body.appendChild(note);
      }
    }
  };
  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
  document.addEventListener("mozfullscreenchange", handleFullscreenChange);
  document.addEventListener("MSFullscreenChange", handleFullscreenChange);

  // Key Event Listener Callback (captures menu triggers and list selections)
  const keyHandler = (e) => {
    // 1. Check for Phone Toggle trigger (ArrowUp when closed, or Backtick, F1, Alt+Shift+P)
    const isToggleKey = (!isMenuOpen && (e.key === "ArrowUp" || e.code === "ArrowUp")) ||
                        e.key === "`" || 
                        e.code === "Backquote" || 
                        e.key === "F1" || 
                        e.code === "F1" || 
                        (e.altKey && e.shiftKey && (e.key.toLowerCase() === "p" || e.code === "KeyP"));
                        
    if (isToggleKey) {
      e.preventDefault();
      e.stopPropagation();
      console.log("[Trainer Extension] Toggle hotkey intercepted.");
      toggleMenu();
      return;
    }

    // 2. If the phone is open, intercept navigation controls
    if (isMenuOpen) {
      e.preventDefault();
      e.stopPropagation();

      if (layoutMode === "list") {
        // 1D Navigation
        if (e.key === "ArrowUp") {
          selectedIndex = (selectedIndex - 1 + CHEATS.length) % CHEATS.length;
          playMenuSound("navigate");
          renderPhoneScreen();
        } else if (e.key === "ArrowDown") {
          selectedIndex = (selectedIndex + 1) % CHEATS.length;
          playMenuSound("navigate");
          renderPhoneScreen();
        }
      } else {
        // 2D Grid Navigation (3 columns, 7 rows)
        if (e.key === "ArrowRight") {
          selectedIndex = (selectedIndex + 1) % CHEATS.length;
          playMenuSound("navigate");
          renderPhoneScreen();
        } else if (e.key === "ArrowLeft") {
          selectedIndex = (selectedIndex - 1 + CHEATS.length) % CHEATS.length;
          playMenuSound("navigate");
          renderPhoneScreen();
        } else if (e.key === "ArrowUp") {
          selectedIndex = (selectedIndex - 3 + CHEATS.length) % CHEATS.length;
          playMenuSound("navigate");
          renderPhoneScreen();
        } else if (e.key === "ArrowDown") {
          selectedIndex = (selectedIndex + 3) % CHEATS.length;
          playMenuSound("navigate");
          renderPhoneScreen();
        }
      }

      // Handle triggers
      if (e.key === "Enter") {
        const selectedCheat = CHEATS[selectedIndex];
        
        // Handle Layout Swap
        if (selectedCheat.code === "TOGGLE_LAYOUT") {
          layoutMode = layoutMode === "list" ? "grid" : "list";
          selectedIndex = 0; // Reset focus to top left/first item
          playMenuSound("select");
          renderPhoneScreen();
          return;
        }

        // Handle Theater Mode Custom Actions
        if (selectedCheat.code === "ACTION_THEATER") {
          playMenuSound("select");
          toggleTheaterMode();
          return;
        }

        // Handle Camera Custom Actions
        if (selectedCheat.code === "ACTION_PHOTO") {
          playMenuSound("shutter");
          triggerCameraPhoto();
          return;
        } else if (selectedCheat.code === "ACTION_RECORD") {
          playMenuSound("select");
          triggerCameraRecordStart();
          return;
        } else if (selectedCheat.code === "ACTION_STOP_RECORD") {
          playMenuSound("select");
          triggerCameraRecordStop();
          return;
        }

        // Standard Cheat Dialing
        playMenuSound("select");
        
        // Show dialing animation on screen
        const appTitle = document.querySelector(".vcc-phone-app-title");
        if (appTitle) {
          appTitle.textContent = "DIALING CHEAT...";
          appTitle.style.color = "#00ff66";
        }
        
        // Wait brief dialing animation, then close and type
        setTimeout(() => {
          closeMenu();
          triggerCheatDirectly(selectedCheat.code);
          if (appTitle) {
            appTitle.textContent = "VICELAUNCHER";
            appTitle.style.color = "#ff3366";
          }
        }, 350);
      } else if (e.key === "Escape" || e.key === "Backspace") {
        closeMenu();
      }
      return;
    }
  };

  // Bind capture phase listeners on both window and document to bypass key capture blocks
  window.addEventListener("keydown", keyHandler, true);
  document.addEventListener("keydown", keyHandler, true);
  console.log("[Trainer Extension] Double capture-phase keydown listeners bound.");

  // Handle runtime messages from the popup (clicking "Send" buttons)
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "injectCheat") {
      playMenuSound("select");
      triggerCheatDirectly(message.code);
      sendResponse({ success: true });
    }
  });

  // Initialize on page load
  initOverlay();
  console.log("[Trainer Extension] Initialization complete.");
} else {
  console.log("[Trainer Extension] Injection ignored on wrapper frame.");
}

function toggleMenu() {
  console.log("[Trainer Extension] toggleMenu called. Current state isMenuOpen:", isMenuOpen);
  if (!overlayEl) {
    initOverlay();
  }

  // Fade out and remove helper note on first open
  const note = document.getElementById("vcc-trainer-help-note");
  if (note) {
    note.style.opacity = "0";
    setTimeout(() => note.remove(), 500);
  }

  if (isMenuOpen) {
    closeMenu();
  } else {
    isMenuOpen = true;
    selectedIndex = 0;
    scrollStart = 0;
    renderPhoneScreen();
    playMenuSound("open");
    overlayEl.style.display = "block";
    overlayEl.classList.remove("vcc-slide-out");
    console.log("[Trainer Extension] Smartphone UI set to display: block.");
  }
}

function closeMenu() {
  console.log("[Trainer Extension] closeMenu called.");
  isMenuOpen = false;
  if (overlayEl) {
    overlayEl.classList.add("vcc-slide-out");
    // Wait for the slide-down animation to finish before setting display to none
    setTimeout(() => {
      if (!isMenuOpen) {
        overlayEl.style.display = "none";
      }
    }, 200);
  }
  // Focus back on the game screen canvas
  const canvas = document.querySelector("canvas");
  if (canvas) canvas.focus();
}

// Helper sleep promise
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Typing simulation loop directly onto the browser game elements
async function triggerCheatDirectly(code) {
  console.log(`[Trainer Extension] Injecting cheat code: ${code.toUpperCase()}`);
  
  // Find game canvas or input sink
  const target = document.querySelector("canvas") || document.body;
  target.focus();

  // Wait brief moment for focus to anchor
  await sleep(100);

  for (let i = 0; i < code.length; i++) {
    const char = code[i];
    const key = char.toLowerCase();
    const keyCode = char.toUpperCase().charCodeAt(0);
    const codeName = `Key${char.toUpperCase()}`;

    // Key Down
    target.dispatchEvent(new KeyboardEvent("keydown", {
      key: key,
      code: codeName,
      keyCode: keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true
    }));

    // Wait character delay (similar to trainer's key typing delays)
    await sleep(25);

    // Key Up
    target.dispatchEvent(new KeyboardEvent("keyup", {
      key: key,
      code: codeName,
      keyCode: keyCode,
      which: keyCode,
      bubbles: true,
      cancelable: true
    }));

    await sleep(25);
  }
  console.log(`[Trainer Extension] Injection complete: ${code.toUpperCase()}`);
}

// Captures a photo frame from the game canvas
function triggerCameraPhoto() {
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    console.warn("[Trainer Extension] Canvas not found for snapshot.");
    return;
  }

  // Trigger flash animation
  const screen = document.querySelector(".vcc-phone-screen");
  if (screen) {
    screen.classList.add("flash-effect");
    setTimeout(() => screen.classList.remove("flash-effect"), 150);
  }

  try {
    let dataUrl = canvas.toDataURL("image/png");
    
    // WebGL fallback if buffer was cleared
    if (dataUrl === "data:," || dataUrl.length < 100) {
      const stream = canvas.captureStream(0);
      const video = document.createElement("video");
      video.srcObject = stream;
      video.muted = true;
      video.play().then(() => {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const ctx = tempCanvas.getContext("2d");
        ctx.drawImage(video, 0, 0);
        dataUrl = tempCanvas.toDataURL("image/png");
        downloadURI(dataUrl, `gta_photo_${Date.now()}.png`);
        stream.getTracks().forEach(track => track.stop());
      }).catch(err => {
        console.error("Video snapshot capture failed:", err);
      });
    } else {
      downloadURI(dataUrl, `gta_photo_${Date.now()}.png`);
    }
  } catch (e) {
    console.error("Camera snapshot error:", e);
  }
}

// Downloads data URI
function downloadURI(uri, name) {
  const link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Starts gameplay recording
function triggerCameraRecordStart() {
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    console.warn("[Trainer Extension] Canvas not found for recording.");
    return;
  }

  try {
    recordStream = canvas.captureStream(30); // 30 FPS
    recordedChunks = [];

    let options = { mimeType: "video/webm; codecs=vp9" };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: "video/webm" };
    }

    mediaRecorder = new MediaRecorder(recordStream, options);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        recordedChunks.push(e.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      downloadURI(url, `gta_video_${Date.now()}.webm`);
      
      if (recordStream) {
        recordStream.getTracks().forEach(track => track.stop());
      }
      console.log("[Trainer Extension] Screen recording saved.");
    };

    mediaRecorder.start();
    console.log("[Trainer Extension] Screen recording started.");

    // Update menu state
    const recordIndex = CHEATS.findIndex(c => c.code === "ACTION_RECORD");
    if (recordIndex !== -1) {
      CHEATS[recordIndex].action = "[ CAMERA: STOP RECORD ]";
      CHEATS[recordIndex].code = "ACTION_STOP_RECORD";
    }
    renderPhoneScreen();

    // Show blinking rec dot on status bar
    const iconsEl = document.querySelector(".vcc-phone-icons");
    if (iconsEl) {
      iconsEl.textContent = "🔴 REC";
      iconsEl.style.color = "#ff0000";
    }
    
  } catch (err) {
    console.error("Failed to start recording:", err);
  }
}

// Stops gameplay recording
function triggerCameraRecordStop() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
  }

  // Restore menu state
  const recordIndex = CHEATS.findIndex(c => c.code === "ACTION_STOP_RECORD");
  if (recordIndex !== -1) {
    CHEATS[recordIndex].action = "[ CAMERA: RECORD VIDEO ]";
    CHEATS[recordIndex].code = "ACTION_RECORD";
  }
  renderPhoneScreen();

  // Restore status bar
  const iconsEl = document.querySelector(".vcc-phone-icons");
  if (iconsEl) {
    iconsEl.textContent = "📶 🔋 98%";
    iconsEl.style.color = "";
  }
}

// Toggles maximized browser-tab pseudo-fullscreen layout
let theaterActive = false;
function toggleTheaterMode() {
  theaterActive = !theaterActive;
  
  const gameElement = document.querySelector("iframe") || document.querySelector("canvas") || document.querySelector("embed");
  
  if (!gameElement) {
    console.warn("[GTA VICELAUNCHER] No active game element target found for Theater Mode.");
    return;
  }
  
  if (theaterActive) {
    gameElement.classList.add("vcc-theater-target");
    document.body.classList.add("vcc-theater-active");
    
    // Relocate overlay inside parent container so it sits on top in layout flow
    const phoneContainer = document.getElementById("vcc-phone-hud-container");
    if (phoneContainer && gameElement.parentElement) {
      gameElement.parentElement.appendChild(phoneContainer);
    }
    
    console.log("[GTA VICELAUNCHER] Theater Mode Enabled.");
  } else {
    gameElement.classList.remove("vcc-theater-target");
    document.body.classList.remove("vcc-theater-active");
    
    // Restore overlay back to document body
    const phoneContainer = document.getElementById("vcc-phone-hud-container");
    if (phoneContainer) {
      document.body.appendChild(phoneContainer);
    }
    
    console.log("[GTA VICELAUNCHER] Theater Mode Disabled.");
  }
}

// Binds native fullscreen listeners to dynamically relocate overlays
document.addEventListener("fullscreenchange", () => {
  const fsElement = document.fullscreenElement || document.webkitFullscreenElement;
  const phoneContainer = document.getElementById("vcc-phone-hud-container");
  const promptBadge = document.getElementById("vcc-top-left-badge");
  
  if (fsElement) {
    console.log("[GTA VICELAUNCHER] Native fullscreen detected on:", fsElement.tagName);
    
    // If the browser went fullscreen on a canvas/iframe leaf element directly,
    // redirect native fullscreen to its parent container to host overlay DOM elements.
    if ((fsElement.tagName === "CANVAS" || fsElement.tagName === "IFRAME") && fsElement.parentElement && !fsElement.dataset.fsRedirected) {
      const parent = fsElement.parentElement;
      fsElement.dataset.fsRedirected = "true";
      
      fsElement.style.width = "100%";
      fsElement.style.height = "100%";
      fsElement.style.position = "absolute";
      fsElement.style.top = "0";
      fsElement.style.left = "0";
      
      document.exitFullscreen().then(() => {
        parent.requestFullscreen().catch(err => {
          console.error("[GTA VICELAUNCHER] Parent fullscreen redirection failed:", err);
        });
      });
      return;
    }
    
    // Append overlays directly inside the active fullscreen container element
    if (phoneContainer) {
      fsElement.appendChild(phoneContainer);
    }
    if (promptBadge) {
      fsElement.appendChild(promptBadge);
    }
  } else {
    // Left fullscreen, restore overlay elements back to main document body
    const body = document.body;
    if (phoneContainer) {
      body.appendChild(phoneContainer);
    }
    if (promptBadge) {
      body.appendChild(promptBadge);
    }
    
    // Reset sizing overrides
    document.querySelectorAll("[data-fs-redirected]").forEach(el => {
      el.removeAttribute("data-fs-redirected");
      el.style.width = "";
      el.style.height = "";
      el.style.position = "";
    });
  }
});

