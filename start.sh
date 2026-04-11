#!/usr/bin/env bash

# PixelVerse 一键启动脚本
# 自动检查依赖安装、端口占用，Ctrl+C 快速终止

set -e

DEV_PORT=4321
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 颜色
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

log() {
  echo -e "${BOLD}[PixelVerse]${RESET} $1"
}

# Ctrl+C 处理
cleanup() {
  echo ""
  log "${YELLOW}正在停止开发服务器...${RESET}"
  if [ -n "$DEV_PID" ] && kill -0 "$DEV_PID" 2>/dev/null; then
    kill "$DEV_PID" 2>/dev/null || true
    # 等待 2 秒后强制终止
    sleep 2
    kill -9 "$DEV_PID" 2>/dev/null || true
  fi
  # 清理端口占用
  lsof -ti :$DEV_PORT | xargs kill -9 2>/dev/null || true
  log "${GREEN}已停止${RESET}"
  exit 0
}

trap cleanup SIGINT SIGTERM

echo ""
log "${CYAN}PixelVerse 开发环境启动中...${RESET}"
echo ""

# 1. 检查依赖
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
  log "${YELLOW}未检测到 node_modules，正在安装依赖...${RESET}"
  cd "$PROJECT_DIR"
  if command -v pnpm &> /dev/null; then
    pnpm install
  elif command -v npm &> /dev/null; then
    npm install
  else
    log "${RED}未找到包管理器，请先安装 pnpm 或 npm${RESET}"
    exit 1
  fi
  log "${GREEN}依赖安装完成${RESET}"
else
  log "${GREEN}依赖已就绪${RESET}"
fi

# 2. 检查端口占用
if lsof -Pi :$DEV_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
  log "${YELLOW}端口 $DEV_PORT 已被占用，正在释放...${RESET}"
  lsof -ti :$DEV_PORT | xargs kill -9 2>/dev/null || true
  sleep 1
fi

# 3. 启动开发服务器
log "${CYAN}启动开发服务器 http://localhost:$DEV_PORT${RESET}"
log "${YELLOW}按 Ctrl+C 停止服务器${RESET}"
echo ""

cd "$PROJECT_DIR"
PORT=$DEV_PORT pnpm dev &
DEV_PID=$!

# 等待子进程退出
wait $DEV_PID
