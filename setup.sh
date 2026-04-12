#!/usr/bin/env bash
# ============================================================
# Pixel-Verse 一键安装并启动脚本
# 用法: bash setup.sh [--dev|--start]
#   --dev    安装完成后启动开发服务器 (默认)
#   --start  安装完成后构建并启动生产服务器
#   --setup  仅安装不启动
# ============================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
RESET='\033[0m'

MODE="--dev"
for arg in "$@"; do
  case "$arg" in
    --start|--setup|--dev) MODE="$arg" ;;
    -h|--help)
      echo -e "${CYAN}${BOLD}Pixel-Verse 一键安装启动脚本${RESET}"
      echo ""
      echo "用法: bash setup.sh [选项]"
      echo ""
      echo "选项:"
      echo "  --dev    安装后启动开发服务器 (默认)"
      echo "  --start  安装后构建并启动生产服务器"
      echo "  --setup  仅安装，不启动"
      echo "  -h, --help  显示帮助"
      exit 0
      ;;
    *)
      error "未知参数: $arg"
      echo "使用 -h/--help 查看帮助"
      exit 1
      ;;
  esac
done

info()  { echo -e "${CYAN}${BOLD}[Pixel-Verse]${RESET} $1"; }
ok()    { echo -e "${GREEN}${BOLD}[Pixel-Verse]${RESET} ✓ $1"; }
warn()  { echo -e "${YELLOW}${BOLD}[Pixel-Verse]${RESET} ⚠ $1"; }
error() { echo -e "${RED}${BOLD}[Pixel-Verse]${RESET} ✗ $1"; }

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

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

# 3. 安装依赖
info "安装项目依赖..."
pnpm install
ok "依赖安装完成"

# 4. 确保原生模块已编译
info "检查原生模块..."
BSQLITE_DIR=$(find node_modules/.pnpm -maxdepth 1 -name 'better-sqlite3@*' -type d 2>/dev/null | head -1)
if [ -n "$BSQLITE_DIR" ] && [ ! -d "$BSQLITE_DIR/node_modules/better-sqlite3/build/Release" ]; then
  warn "better-sqlite3 原生模块未编译，正在编译..."
  node scripts/build-native.mjs
  ok "better-sqlite3 编译完成"
else
  ok "better-sqlite3 已就绪"
fi

# 5. 配置环境变量
if [ ! -f .env.local ]; then
  info "创建 .env.local 配置文件..."
  if [ -f .env.example ]; then
    cp .env.example .env.local
    warn "请编辑 .env.local 修改配置（数据库路径、管理员账号等）"
  else
    warn "未找到 .env.example，请手动创建 .env.local"
  fi
  ok ".env.local 已创建"
else
  ok ".env.local 已存在"
fi

# 6. 确保数据目录存在
mkdir -p data
ok "数据目录已就绪"

# 7. 数据库迁移
info "初始化数据库..."
node scripts/db-migrate.mjs
ok "数据库迁移完成"

# 8. 种子数据（仅在数据库为空时插入）
info "检查种子数据..."
if node scripts/db-seed.mjs 2>&1 | grep -q "已存在\|already\|skip"; then
  ok "种子数据已存在，跳过"
else
  ok "种子数据插入完成"
fi

echo ""
echo -e "${GREEN}${BOLD}========================================${RESET}"
echo -e "${GREEN}${BOLD}  Pixel-Verse 安装完成！${RESET}"
echo -e "${GREEN}${BOLD}========================================${RESET}"
echo ""

# 9. 根据模式启动
if [ "$MODE" = "--setup" ]; then
  info "安装完成，未启动服务器"
  info "启动开发服务器:  bash setup.sh --dev"
  info "启动生产服务器:  bash setup.sh --start"
  echo ""
  exit 0
fi

if [ "$MODE" = "--start" ]; then
  info "正在构建生产版本..."
  pnpm build
  ok "构建完成"
  info "启动生产服务器..."
  info "访问地址: http://localhost:\${PORT:-3000}"
  echo ""
  exec node scripts/start-server.mjs
fi

# 默认 --dev 模式
info "正在启动开发服务器..."
info "开发服务器:  http://localhost:4321"
info "管理员后台:  http://localhost:4321/admin"
info "按 Ctrl+C 停止服务器"
echo ""

# 清理端口占用
DEV_PORT=4321
if lsof -Pi :$DEV_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
  warn "端口 $DEV_PORT 已被占用，正在释放..."
  lsof -ti :$DEV_PORT | xargs kill -9 2>/dev/null || true
  sleep 1
fi

# Ctrl+C 处理
cleanup() {
  echo ""
  info "正在停止开发服务器..."
  if [ -n "$DEV_PID" ] && kill -0 "$DEV_PID" 2>/dev/null; then
    kill "$DEV_PID" 2>/dev/null || true
    sleep 1
    kill -9 "$DEV_PID" 2>/dev/null || true
  fi
  lsof -ti :$DEV_PORT | xargs kill -9 2>/dev/null || true
  ok "已停止"
  exit 0
}
trap cleanup SIGINT SIGTERM

PORT=$DEV_PORT pnpm dev &
DEV_PID=$!
wait $DEV_PID
