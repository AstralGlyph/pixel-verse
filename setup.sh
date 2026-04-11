#!/usr/bin/env bash
# ============================================================
# Pixel-Verse 一键安装初始化脚本
# 用法: bash setup.sh
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

info()  { echo -e "${CYAN}${BOLD}[Pixel-Verse]${RESET} $1"; }
ok()    { echo -e "${GREEN}${BOLD}[Pixel-Verse]${RESET} ✓ $1"; }
warn()  { echo -e "${YELLOW}${BOLD}[Pixel-Verse]${RESET} ⚠ $1"; }
error() { echo -e "${RED}${BOLD}[Pixel-Verse]${RESET} ✗ $1"; }

echo ""
info "Pixel-Verse 安装初始化"
echo ""

# 1. 检查 Node.js
info "检查运行环境..."
if ! command -v node &>/dev/null; then
  error "未检测到 Node.js，请先安装 Node.js >= 20 LTS"
  error "https://nodejs.org/"
  exit 1
fi
NODE_MAJOR=$(node -v | cut -d. -f1 | sed 's/v//')
if [ "$NODE_MAJOR" -lt 20 ]; then
  error "Node.js 版本过低 (当前 v$(node -v))，需要 >= 20 LTS"
  exit 1
fi
ok "Node.js $(node -v)"

# 2. 检查 pnpm
if ! command -v pnpm &>/dev/null; then
  warn "未检测到 pnpm，正在通过 npm 安装..."
  npm install -g pnpm
fi
ok "pnpm $(pnpm -v)"

# 3. 安装依赖（postinstall 钩子会自动编译原生模块）
info "安装项目依赖..."
pnpm install
ok "依赖安装完成"

# 3.5 确保原生模块已编译（postinstall 可能因权限等原因失败）
info "检查原生模块..."
BSQLITE_DIR=$(find node_modules/.pnpm -maxdepth 1 -name 'better-sqlite3@*' -type d 2>/dev/null | head -1)
if [ -n "$BSQLITE_DIR" ] && [ ! -d "$BSQLITE_DIR/node_modules/better-sqlite3/build/Release" ]; then
  warn "better-sqlite3 原生模块未编译，正在编译..."
  node scripts/build-native.mjs
  ok "better-sqlite3 编译完成"
else
  ok "better-sqlite3 已就绪"
fi

# 4. 配置环境变量
if [ ! -f .env.local ]; then
  info "创建 .env.local 配置文件..."
  cp .env.example .env.local
  warn "请编辑 .env.local 修改配置（数据库路径、管理员账号等）"
  ok ".env.local 已创建"
else
  ok ".env.local 已存在"
fi

# 5. 确保数据目录存在
mkdir -p data
ok "数据目录已就绪"

# 6. 数据库迁移
info "初始化数据库..."
node scripts/db-migrate.mjs
ok "数据库迁移完成"

# 7. 种子数据
info "插入种子数据..."
node scripts/db-seed.mjs
ok "种子数据插入完成"

echo ""
echo -e "${GREEN}${BOLD}========================================${RESET}"
echo -e "${GREEN}${BOLD}  Pixel-Verse 安装完成！${RESET}"
echo -e "${GREEN}${BOLD}========================================${RESET}"
echo ""
info "启动开发服务器:  pnpm dev"
info "管理员后台:       http://localhost:4321/admin"
info "前台博客:         http://localhost:4321"
echo ""
