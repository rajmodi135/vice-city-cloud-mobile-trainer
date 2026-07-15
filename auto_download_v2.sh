#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════
#  GTA VICELAUNCHER — Ultra Fast Parallel Download Engine
#  Version 2.0  |  Powered by Mauxx AI
#  Based on aria2c with maximum parallel connections and auto-resume
# ═══════════════════════════════════════════════════════════════════════

# ── Branding ──────────────────────────────────────────────────────────
RED='\033[0;31m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'
GREEN='\033[0;32m'; PURPLE='\033[0;35m'; BOLD='\033[1m'; RESET='\033[0m'
BLINK='\033[5m'

print_banner() {
  echo -e "${RED}"
  echo "  ██████╗ ████████╗ █████╗     ██╗   ██╗██╗ ██████╗███████╗"
  echo "  ██╔════╝╚══██╔══╝██╔══██╗    ██║   ██║██║██╔════╝██╔════╝"
  echo "  ██║  ███╗  ██║   ███████║    ██║   ██║██║██║     █████╗  "
  echo "  ██║   ██║  ██║   ██╔══██║    ╚██╗ ██╔╝██║██║     ██╔══╝  "
  echo "  ╚██████╔╝  ██║   ██║  ██║     ╚████╔╝ ██║╚██████╗███████╗"
  echo "   ╚═════╝   ╚═╝   ╚═╝  ╚═╝      ╚═══╝  ╚═╝ ╚═════╝╚══════╝"
  echo -e "${YELLOW}"
  echo "        ██╗      █████╗ ██╗   ██╗███╗   ██╗ ██████╗██╗  ██╗███████╗██████╗ "
  echo "        ██║     ██╔══██╗██║   ██║████╗  ██║██╔════╝██║  ██║██╔════╝██╔══██╗"
  echo "        ██║     ███████║██║   ██║██╔██╗ ██║██║     ███████║█████╗  ██████╔╝"
  echo "        ██║     ██╔══██║██║   ██║██║╚██╗██║██║     ██╔══██║██╔══╝  ██╔══██╗"
  echo "        ███████╗██║  ██║╚██████╔╝██║ ╚████║╚██████╗██║  ██║███████╗██║  ██║"
  echo "        ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝"
  echo -e "${RESET}"
  echo -e "  ${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "  ${BOLD}${PURPLE}  ⚡ ULTRA-FAST PARALLEL DOWNLOAD ENGINE v2.0 — Powered by Mauxx AI${RESET}"
  echo -e "  ${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo ""
}

log_info()    { echo -e "  ${CYAN}[ℹ]${RESET} $1"; }
log_ok()      { echo -e "  ${GREEN}[✓]${RESET} $1"; }
log_warn()    { echo -e "  ${YELLOW}[⚠]${RESET} $1"; }
log_error()   { echo -e "  ${RED}[✗]${RESET} $1"; }
log_step()    { echo -e "\n  ${BOLD}${YELLOW}▶ $1${RESET}"; }
log_launch()  { echo -e "  ${BOLD}${PURPLE}🚀 $1${RESET}"; }

# ── Configuration ──────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOWNLOAD_DIR="${HOME}/Downloads/GTA-Vice-City"
TORRENT_FILE="${SCRIPT_DIR}/Grand-Theft-Auto-Vice-City-.torrent"
SESSION_FILE="${DOWNLOAD_DIR}/.aria2_session"
LOG_FILE="${DOWNLOAD_DIR}/.aria2_download.log"
PID_FILE="${DOWNLOAD_DIR}/.aria2_daemon.pid"

# ── Parallel download settings (Maximum Speed) ─────────────────────────
MAX_CONN_PER_SERVER=16          # Connections per server
SPLIT=16                        # Number of pieces to split file into
MAX_CONCURRENT=8                # Parallel torrent file downloads
MIN_SPLIT_SIZE="1M"           # Minimum chunk size per split
RPC_PORT=6800                   # aria2 RPC port for status checking
RETRY_WAIT=3                    # Seconds between retries
SAVE_INTERVAL=5                 # Session save interval in seconds

# ── Check dependencies ─────────────────────────────────────────────────
check_deps() {
  log_step "Checking dependencies..."
  local missing=()
  for dep in aria2c curl; do
    if ! command -v "$dep" &>/dev/null; then
      missing+=("$dep")
    fi
  done
  if [ ${#missing[@]} -gt 0 ]; then
    log_warn "Missing: ${missing[*]}"
    log_info "Installing missing tools..."
    if command -v apt-get &>/dev/null; then
      sudo apt-get install -y aria2 curl 2>/dev/null && log_ok "Installed via apt"
    elif command -v pacman &>/dev/null; then
      sudo pacman -S --noconfirm aria2 curl 2>/dev/null && log_ok "Installed via pacman"
    elif command -v dnf &>/dev/null; then
      sudo dnf install -y aria2 curl 2>/dev/null && log_ok "Installed via dnf"
    else
      log_error "Cannot auto-install. Please install aria2c and curl manually."
      exit 1
    fi
  else
    log_ok "All dependencies found (aria2c, curl)"
  fi
}

# ── Setup directories ──────────────────────────────────────────────────
setup_dirs() {
  log_step "Setting up download environment..."
  mkdir -p "$DOWNLOAD_DIR"
  log_ok "Download dir: ${CYAN}$DOWNLOAD_DIR${RESET}"

  # Check torrent file
  if [ ! -f "$TORRENT_FILE" ]; then
    log_warn "Torrent file not found at: $TORRENT_FILE"
    log_info "Searching for torrent file..."
    local found
    found=$(find "$HOME" -name "*.torrent" -path "*Vice*" -o -name "*.torrent" -path "*vice*" 2>/dev/null | head -1)
    if [ -n "$found" ]; then
      TORRENT_FILE="$found"
      log_ok "Found torrent: $TORRENT_FILE"
    else
      log_error "No Vice City torrent file found!"
      log_info "Place Grand-Theft-Auto-Vice-City-.torrent in: $SCRIPT_DIR"
      exit 1
    fi
  fi
  log_ok "Torrent file: ${CYAN}$(basename "$TORRENT_FILE")${RESET}"

  # Initialize session file
  if [ ! -s "$SESSION_FILE" ]; then
    log_info "Initializing new download session..."
    touch "$SESSION_FILE"
  else
    log_ok "Resuming from existing session"
  fi
}

# ── Kill any existing aria2c ───────────────────────────────────────────
kill_existing() {
  if [ -f "$PID_FILE" ]; then
    local old_pid
    old_pid=$(cat "$PID_FILE" 2>/dev/null)
    if [ -n "$old_pid" ] && kill -0 "$old_pid" 2>/dev/null; then
      log_info "Stopping previous aria2c (PID: $old_pid)..."
      kill "$old_pid" 2>/dev/null
      sleep 1
    fi
    rm -f "$PID_FILE"
  fi
  # Also kill any orphan processes
  pkill -f "aria2c.*${DOWNLOAD_DIR}" 2>/dev/null || true
}

# ── Start RPC status monitor ───────────────────────────────────────────
monitor_progress() {
  echo ""
  echo -e "  ${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  echo -e "  ${BOLD}📊 DOWNLOAD MONITOR — Querying aria2c RPC on port ${RPC_PORT}${RESET}"
  echo -e "  ${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
  sleep 3  # Wait for daemon to start

  local checks=0
  while true; do
    sleep 4
    checks=$((checks + 1))

    # Query active downloads via RPC
    local rpc_response
    rpc_response=$(curl -s --max-time 3 \
      --data '{"jsonrpc":"2.0","method":"aria2.getGlobalStat","id":"1"}' \
      "http://localhost:${RPC_PORT}/jsonrpc" 2>/dev/null)

    if [ -n "$rpc_response" ]; then
      local dl_speed ul_speed num_active num_stopped
      dl_speed=$(echo "$rpc_response" | grep -o '"downloadSpeed":"[^"]*"' | grep -o '[0-9]*' | head -1)
      num_active=$(echo "$rpc_response" | grep -o '"numActive":"[^"]*"' | grep -o '[0-9]*' | head -1)
      num_stopped=$(echo "$rpc_response" | grep -o '"numStopped":"[^"]*"' | grep -o '[0-9]*' | head -1)

      # Convert speed to human readable
      local dl_human
      if [ -n "$dl_speed" ] && [ "$dl_speed" -gt 0 ] 2>/dev/null; then
        if [ "$dl_speed" -gt 1048576 ]; then
          dl_human="$(echo "scale=1; $dl_speed/1048576" | bc) MB/s"
        elif [ "$dl_speed" -gt 1024 ]; then
          dl_human="$(echo "scale=1; $dl_speed/1024" | bc) KB/s"
        else
          dl_human="${dl_speed} B/s"
        fi
        echo -e "  ${GREEN}[${checks}]${RESET} ${BOLD}⬇ ${dl_human}${RESET}  |  Active: ${CYAN}${num_active:-0}${RESET}  |  Completed: ${GREEN}${num_stopped:-0}${RESET}"
      else
        echo -e "  ${YELLOW}[${checks}]${RESET} Connecting to torrent swarm... (${num_active:-0} active)"
      fi
    else
      echo -e "  ${YELLOW}[${checks}]${RESET} Starting up..."
      if [ "$checks" -gt 15 ]; then
        log_warn "RPC not responding — aria2c may have crashed. Check $LOG_FILE"
        break
      fi
    fi

    # Check if download dir has files growing
    local total_size
    total_size=$(du -sh "$DOWNLOAD_DIR" 2>/dev/null | cut -f1)
    [ -n "$total_size" ] && echo -e "          ${PURPLE}📦 Total downloaded: ${total_size}${RESET}"
  done
}

# ── Main download launcher ─────────────────────────────────────────────
start_download() {
  log_step "Launching Ultra-Fast Parallel Downloader..."
  echo ""
  log_launch "aria2c daemon starting with MAXIMUM performance settings:"
  echo -e "    ${CYAN}• Max connections per server: ${BOLD}${MAX_CONN_PER_SERVER}${RESET}"
  echo -e "    ${CYAN}• File split pieces:          ${BOLD}${SPLIT}${RESET}"
  echo -e "    ${CYAN}• Parallel downloads:         ${BOLD}${MAX_CONCURRENT}${RESET}"
  echo -e "    ${CYAN}• Min split size:             ${BOLD}${MIN_SPLIT_SIZE}${RESET}"
  echo -e "    ${CYAN}• RPC port:                   ${BOLD}${RPC_PORT}${RESET}"
  echo -e "    ${CYAN}• Auto-resume:                ${BOLD}ENABLED${RESET}"
  echo -e "    ${CYAN}• Retry on failure:           ${BOLD}INFINITE${RESET}"
  echo -e "    ${CYAN}• Seed after download:        ${BOLD}DISABLED (speed mode)${RESET}"
  echo ""
  echo -e "  ${BOLD}${YELLOW}Output: ${CYAN}${DOWNLOAD_DIR}${RESET}"
  echo -e "  ${BOLD}${YELLOW}Log:    ${CYAN}${LOG_FILE}${RESET}"
  echo ""

  # Auto-restart keep-alive loop
  while true; do
    echo -e "  ${GREEN}$(date '+%H:%M:%S')${RESET} Launching aria2c..."

    aria2c \
      --torrent-file="$TORRENT_FILE" \
      --save-session="$SESSION_FILE" \
      --save-session-interval="$SAVE_INTERVAL" \
      --input-file="$SESSION_FILE" \
      --dir="$DOWNLOAD_DIR" \
      --max-tries=0 \
      --retry-wait="$RETRY_WAIT" \
      --connect-timeout=20 \
      --timeout=30 \
      --max-file-not-found=0 \
      --enable-rpc \
      --rpc-listen-port="$RPC_PORT" \
      --rpc-listen-all \
      --rpc-allow-origin-all \
      --seed-time=0 \
      --max-connection-per-server="$MAX_CONN_PER_SERVER" \
      --split="$SPLIT" \
      --min-split-size="$MIN_SPLIT_SIZE" \
      --max-concurrent-downloads="$MAX_CONCURRENT" \
      --select-file=1,3,5,7,9,11,13,15,17,19,21,23 \
      --file-allocation=falloc \
      --disk-cache=64M \
      --bt-max-peers=200 \
      --bt-request-peer-speed-limit=0 \
      --download-result=full \
      --log="$LOG_FILE" \
      --log-level=notice \
      --console-log-level=warn \
      2>&1 &

    local ARIA_PID=$!
    echo "$ARIA_PID" > "$PID_FILE"
    log_ok "aria2c started (PID: $ARIA_PID)"

    # Start monitor in foreground
    monitor_progress &
    local MON_PID=$!

    # Wait for aria2c to finish
    wait "$ARIA_PID"
    local EXIT_CODE=$?
    kill "$MON_PID" 2>/dev/null

    if [ "$EXIT_CODE" -eq 0 ]; then
      echo ""
      echo -e "  ${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
      log_ok "${GREEN}${BOLD}✅ DOWNLOAD COMPLETE!${RESET}"
      echo -e "  ${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}"
      log_ok "Files saved to: ${CYAN}$DOWNLOAD_DIR${RESET}"
      log_info "Now paste the save file ${YELLOW}GTAVCsf1.b${RESET} into:"
      echo -e "  ${CYAN}  ~/Documents/GTA Vice City User Files/${RESET}"
      log_info "Run the game installer from the download folder."
      echo ""
      log_launch "Visit ${YELLOW}https://rajmodi135.github.io/vice-city-launcher/${RESET} for more!"
      echo ""
      break
    else
      echo -e "  ${YELLOW}$(date '+%H:%M:%S') aria2c exited (code: $EXIT_CODE). Auto-resuming in 5s...${RESET}"
      sleep 5
    fi
  done
}

# ── Trap CTRL+C cleanly ────────────────────────────────────────────────
cleanup() {
  echo ""
  log_warn "Download paused. Session saved — run script again to resume."
  log_info "Session file: $SESSION_FILE"
  [ -f "$PID_FILE" ] && kill "$(cat "$PID_FILE")" 2>/dev/null
  rm -f "$PID_FILE"
  exit 0
}
trap cleanup SIGINT SIGTERM

# ── Entry Point ────────────────────────────────────────────────────────
clear
print_banner
check_deps
kill_existing
setup_dirs
start_download
