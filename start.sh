#!/usr/bin/env bash
# ============================================================
# Pixel-Verse 快捷启动脚本
# 用法: bash start.sh [--dev|--start|--setup]
# 默认 --dev: 安装依赖并启动开发服务器
# ============================================================

# 如果已经安装（node_modules 存在），直接启动
if [ -d "node_modules" ]; then
  # 确保数据库已迁移
  node scripts/db-migrate.mjs 2>/dev/null || true

  DEV_PORT=4321

  # 颜色
  GREEN='\033[0;32m'
  YELLOW='\033[0;33m'
  CYAN='\033[0;36m'
  BOLD='\033[1m'
  RESET='\033[0m'

  log() { echo -e "${BOLD}[PixelVerse]${RESET} $1"; }

  echo ""
  log "${CYAN}PixelVerse 开发环境启动中...${RESET}"
  echo ""

  # 清理端口占用
  if lsof -Pi :$DEV_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    log "${YELLOW}端口 $DEV_PORT 已被占用，正在释放...${RESET}"
    lsof -ti :$DEV_PORT | xargs kill -9 2>/dev/null || true
    sleep 1
  fi

  # Ctrl+C 处理
  cleanup() {
    echo ""
    log "${YELLOW}正在停止开发服务器...${RESET}"
    if [ -n "$DEV_PID" ] && kill -0 "$DEV_PID" 2>/dev/null; then
      kill "$DEV_PID" 2>/dev/null || true
      sleep 1
      kill -9 "$DEV_PID" 2>/dev/null || true
    fi
    lsof -ti :$DEV_PORT | xargs kill -9 2>/dev/null || true
    log "${GREEN}已停止${RESET}"
    exit 0
  }
  trap cleanup SIGINT SIGTERM

  PORT=$DEV_PORT pnpm dev &
  DEV_PID=$!
  wait $DEV_PID
else
  # 首次安装，调用 setup.sh
  bash setup.sh "$@"
fi
