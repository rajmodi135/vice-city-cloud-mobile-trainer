// popup.js - GTA VICELAUNCHER popup logic

const CHEATS = [
  {"action": "Full Health", "code": "aspirine", "key_desc": "Alt+Shift+H", "category": "player"},
  {"action": "Full Armor", "code": "preciousprotection", "key_desc": "Alt+Shift+A", "category": "player"},
  {"action": "Weapon Set 1 (Light)", "code": "thugstools", "key_desc": "Alt+Shift+1", "category": "weapons"},
  {"action": "Weapon Set 2 (Medium)", "code": "professionaltools", "key_desc": "Alt+Shift+2", "category": "weapons"},
  {"action": "Weapon Set 3 (Heavy)", "code": "nuttertools", "key_desc": "Alt+Shift+3", "category": "weapons"},
  {"action": "Lower Wanted Level", "code": "leavemealone", "key_desc": "Alt+Shift+L", "category": "player"},
  {"action": "Raise Wanted Level", "code": "youwonttakemealive", "key_desc": "Alt+Shift+U", "category": "player"},
  {"action": "Spawn Rhino (Tank)", "code": "panzer", "key_desc": "Alt+Shift+T", "category": "vehicles"},
  {"action": "Spawn Sabre Turbo", "code": "gettherefast", "key_desc": "Alt+Shift+C", "category": "vehicles"},
  {"action": "Spawn Hotring Racer", "code": "getthereamazinglyfast", "key_desc": "Alt+Shift+R", "category": "vehicles"},
  {"action": "Spawn Love Fist Limo", "code": "rockandrollcar", "key_desc": "Alt+Shift+O", "category": "vehicles"},
  {"action": "Drive on Water", "code": "seaways", "key_desc": "Alt+Shift+W", "category": "vehicles"},
  {"action": "Flying Cars", "code": "comeflywithme", "key_desc": "Alt+Shift+F", "category": "vehicles"},
  {"action": "Perfect Handling", "code": "gripiseverything", "key_desc": "Alt+Shift+G", "category": "player"},
  {"action": "Blow Up All Cars", "code": "bigbang", "key_desc": "Alt+Shift+B", "category": "vehicles"},
  {"action": "Clear Weather", "code": "alovelyday", "key_desc": "Alt+Shift+K", "category": "world"},
  {"action": "Speed Up Game", "code": "ontherunway", "key_desc": "Alt+Shift+S", "category": "world"},
  {"action": "Slow Down Game", "code": "booooooring", "key_desc": "Alt+Shift+M", "category": "world"},
];

let activeCategory = "all";
let searchQuery = "";
let audioCtx = null;

document.addEventListener("DOMContentLoaded", async () => {
  renderCheats();
  setupLauncher();
  setupFilters();
  await updateConnectionStatus();
});

// Initialize sound context
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Synthesize retro coin/beep sound effects dynamically
function playSound(type) {
  const checkbox = document.getElementById("sfx-checkbox");
  if (!checkbox || !checkbox.checked) return;

  try {
    initAudio();
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === "click") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    } else if (type === "success") {
      osc.type = "square";
      osc.frequency.setValueAtTime(987.77, audioCtx.currentTime); // Note B5
      osc.frequency.setValueAtTime(1318.51, audioCtx.currentTime + 0.07); // Note E6
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.25);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } else if (type === "tab") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    }
  } catch (err) {
    console.warn("SFX synthesis blocked:", err);
  }
}

// Query connection status
async function updateConnectionStatus() {
  const statusDot = document.querySelector(".status-dot");
  const statusText = document.getElementById("status-text");

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes("quenq.com/play/")) {
      statusDot.className = "status-dot connected";
      statusText.textContent = "CONNECTED";
    } else {
      statusDot.className = "status-dot pulsing";
      statusText.textContent = "DISCONNECTED";
    }
  } catch (err) {
    statusDot.className = "status-dot pulsing";
    statusText.textContent = "DISCONNECTED";
  }
}

// Render filtered cheats list
function renderCheats() {
  const container = document.getElementById("cheats-list");
  container.innerHTML = "";

  const filtered = CHEATS.filter(cheat => {
    const matchesCategory = activeCategory === "all" || cheat.category === activeCategory;
    const matchesSearch = cheat.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          cheat.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    const emptyMsg = document.createElement("div");
    emptyMsg.style.textAlign = "center";
    emptyMsg.style.padding = "20px";
    emptyMsg.style.fontSize = "11px";
    emptyMsg.style.color = "#8c8c9a";
    emptyMsg.textContent = "No cheat codes match your filters.";
    container.appendChild(emptyMsg);
    return;
  }

  filtered.forEach(cheat => {
    const row = document.createElement("div");
    row.className = "cheat-row";

    const actCol = document.createElement("span");
    actCol.className = "cheat-action";

    // Add category badge
    const badge = document.createElement("span");
    badge.className = `cheat-category-badge badge-${cheat.category}`;
    badge.textContent = cheat.category;
    actCol.appendChild(badge);

    const nameText = document.createTextNode(cheat.action);
    actCol.appendChild(nameText);

    const keyCol = document.createElement("span");
    keyCol.className = "cheat-shortcut";
    keyCol.textContent = cheat.key_desc;

    const btnCol = document.createElement("button");
    btnCol.className = "cheat-btn";
    btnCol.textContent = "Send";
    btnCol.addEventListener("click", async () => {
      playSound("success");
      await sendCheatToTab(cheat.code);
    });

    row.appendChild(actCol);
    row.appendChild(keyCol);
    row.appendChild(btnCol);
    container.appendChild(row);
  });
}

// Bind search and filter events
function setupFilters() {
  // Search box event
  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", (e) => {
    searchQuery = e.target.value;
    renderCheats();
  });

  // Category tab buttons
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      playSound("tab");
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.getAttribute("data-category");
      renderCheats();
    });
  });
}

// Bind launcher
function setupLauncher() {
  const btn = document.getElementById("launch-btn");
  btn.addEventListener("click", async () => {
    playSound("click");
    try {
      const response = await chrome.runtime.sendMessage({ action: "launchGame" });
      if (response && response.success) {
        console.log("Launched game status:", response.status);
        await updateConnectionStatus();
      }
    } catch (err) {
      console.error("Launch command failed:", err);
    }
  });
}

// Send cheat key events
async function sendCheatToTab(code) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      alert("No active tab found.");
      return;
    }

    if (!tab.url || !tab.url.includes("quenq.com/play/")) {
      alert("Please focus on the GTA Vice City web game page first, or click 'LAUNCH GAME'!");
      return;
    }

    // Locate the sub-iframe of the Wasm engine
    let targetFrameId = 0;
    try {
      const frames = await chrome.webNavigation.getAllFrames({ tabId: tab.id });
      const gameFrame = frames.find(f => f.url && f.url.includes("vc.quenq.com"));
      if (gameFrame) {
        targetFrameId = gameFrame.frameId;
      }
    } catch (e) {
      console.warn("webNavigation error:", e);
    }

    const response = await chrome.tabs.sendMessage(tab.id, { 
      action: "injectCheat", 
      code: code 
    }, { frameId: targetFrameId });
    
    if (response && response.success) {
      console.log(`Cheat ${code} injected successfully.`);
    }
  } catch (err) {
    console.error("Communication error:", err);
    alert("Could not communicate with the game tab. Please reload the game page and try again!");
  }
}
