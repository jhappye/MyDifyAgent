#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT_DIR"

BRAND_NAME="${BRAND_NAME:-垣码平台}"
BRAND_SLUG="${BRAND_SLUG:-yuanma}"
BRAND_PRIMARY_COLOR="${BRAND_PRIMARY_COLOR:-#1890ff}"
COPYRIGHT_TEXT="${COPYRIGHT_TEXT:-Copyright © 2025 我方公司 版权所有}"

log() {
  printf '[brandify] %s\n' "$*"
}

replace_text() {
  local target_dir="$1"
  shift
  local file_patterns=("$@")

  while IFS= read -r file; do
    python3 - "$file" "$BRAND_NAME" "$BRAND_SLUG" "$BRAND_PRIMARY_COLOR" "$COPYRIGHT_TEXT" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
brand_name = sys.argv[2]
brand_slug = sys.argv[3]
brand_color = sys.argv[4]
copyright_text = sys.argv[5]

text = path.read_text(encoding="utf-8", errors="ignore")
orig = text

replacements = {
    "Dify-Plus": brand_name,
    "Dify": brand_name,
    "dify": brand_slug,
    "DIFY": brand_slug.upper(),
    "#1C64F2": brand_color,
    "Copyright © 2025 Dify": copyright_text,
}

for old, new in replacements.items():
    text = text.replace(old, new)

if text != orig:
    path.write_text(text, encoding="utf-8")
    print(path)
PY
  done < <(find "$target_dir" -type f \( "${file_patterns[@]}" \) \
    -not -path '*/node_modules/*' \
    -not -path '*/.next/*' \
    -not -path '*/dist/*' \
    -not -path '*/.git/*')
}

log "品牌化开始: ${BRAND_NAME}"

log "1) 替换 web 文案"
replace_text web -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.json'

log "2) 替换 api 文案"
replace_text api -name '*.py' -o -name '*.md'

log "3) 替换 admin/server 文案"
replace_text admin/server -name '*.go' -o -name '*.md'

log "4) 替换 admin/web 文案"
replace_text admin/web -name '*.vue' -o -name '*.ts' -o -name '*.js' -o -name '*.json' -o -name '*.html'

log "5) 更新 docker compose 容器名（示例）"
if [[ -f docker-compose.yml ]]; then
  sed -i "s/container_name: dify_/container_name: ${BRAND_SLUG}_/g" docker-compose.yml || true
  sed -i "s/container_name: dify-/container_name: ${BRAND_SLUG}-/g" docker-compose.yml || true
fi

log "6) 写入品牌环境变量模板"
cat > .env.branding <<ENV
BRAND_NAME=${BRAND_NAME}
BRAND_LOGO_URL=/logo-yuanma.svg
BRAND_PRIMARY_COLOR=${BRAND_PRIMARY_COLOR}
BRAND_FAVICON_URL=/favicon.ico
COPYRIGHT_TEXT=${COPYRIGHT_TEXT}
ENV

log "品牌化脚本执行完成。请运行: python3 scripts/branding/verify_branding.py --repo-root . --strict"
