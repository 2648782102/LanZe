#!/bin/bash
# 常驻开发服务器：脱离终端会话，崩溃后自动重启。

APP_DIR="/Users/flowli/Developer/LanZe"
PORT="${DEV_PORT:-4399}"
LOG_DIR="$HOME/Library/Logs/LanZe"
LOG="$LOG_DIR/dev-$PORT.log"

mkdir -p "$LOG_DIR"
cd "$APP_DIR" || exit 1

echo "$$" > "$LOG_DIR/dev-$PORT.pid"

while true; do
  echo "[$(date '+%F %T')] starting vite on $PORT" >> "$LOG"
  node node_modules/vite/bin/vite.js --host 127.0.0.1 --port "$PORT" --strictPort >> "$LOG" 2>&1
  code=$?
  echo "[$(date '+%F %T')] vite exited with $code, restarting in 1s" >> "$LOG"
  sleep 1
done
