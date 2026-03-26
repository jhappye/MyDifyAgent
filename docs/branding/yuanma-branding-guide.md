# 垣码智慧蜂AI平台品牌化改造手册（基于 Dify-Plus）

> 目标：将 Dify-Plus 完全品牌化为“垣码智慧蜂AI平台（简称：垣码平台）”，并通过环境变量实现可维护、可回滚、可持续升级的品牌隔离层。

## 0. 实施策略（先做隔离，再做替换）

1. **新增品牌配置层**：优先通过环境变量注入，不直接硬编码品牌。
2. **最小侵入改造**：仅替换展示文案、图标、标题、响应头，不改变业务逻辑。
3. **补丁化管理**：所有品牌改动落在单独目录（`scripts/branding/`、`docs/branding/`）并建议使用独立 commit/patch。
4. **升级友好**：优先改入口文件和集中配置，避免散落修改冲突。

---

## 1. 文件修改清单（按优先级）

### 第一优先级：前端界面彻底换皮

#### Next.js（`web/`）

- `web/next.config.js`：统一 title / meta fallback。
- `web/app/layout.tsx`：读取品牌变量并写入 metadata。
- `web/app/components/header/index.tsx`：去掉 Dify logo 出口，改为品牌 Logo 组件。
- `web/app/components/header/logo.tsx`：读取 `BRAND_LOGO_URL` + fallback SVG。
- `web/app/components/login/*`：登录标题/欢迎语品牌化。
- `web/app/components/install/*`：安装页文案品牌化。
- `web/app/components/footer/*`：版权信息来自 `COPYRIGHT_TEXT`。
- `web/app/components/app-sidebar/*`：侧栏品牌名称/图标统一。
- `web/app/components/account/*`：账户页中的产品名称替换。
- `web/i18n/**/*.ts|json`：清理所有 “Dify / Dify-Plus” 文案。
- `web/public/*.svg|*.png|*.ico`：替换 logo / favicon / og image。

#### Vue 管理中心（`admin/web/`）

- `admin/web/index.html`：`<title>` 改为品牌名。
- `admin/web/src/settings.js`：`siteTitle` + 默认品牌配置。
- `admin/web/src/layout/components/Navbar.vue`：导航栏 logo 与名称。
- `admin/web/src/layout/components/Sidebar/Logo.vue`：侧栏 logo 与名称。
- `admin/web/src/views/login/index.vue`：登录页文案/图片替换。
- `admin/web/public/favicon.ico`：替换为公司 favicon。

### 第二优先级：后端接口去标识化

- `api/core/app/apps/base_app_generate_response_converter.py`：删 `X-Dify-*` 设置。
- `api/controllers/console/__init__.py`：统一注册响应头清洗中间件。
- `api/controllers/console/wraps.py`：确保错误封装不输出 Dify 文字。
- `api/controllers/console/version.py`：`/api/version` 改成品牌版本结构。
- `api/controllers/console/setup.py`：状态接口默认文案品牌化。
- `api/core/workflow/nodes/**`：节点 display_name 统一品牌命名体系。

### 第二优先级：数据库内容清理

- SQL 覆盖表：`apps`、`app_model_configs`、`workflows`、`users`、`tenants`。
- 新租户/新应用默认值改读取环境变量（品牌名）。

### 第三优先级：代码库内部清理

- `api/**/*.py`、`web/**/*.{ts,tsx}`、`admin/server/**/*.go` 文档字符串与注释清理。
- `.env.example`、`docker-compose*.yml`、`Makefile`、`README.md` 品牌化。

### 第四优先级：部署与运维去标识

- `api/Dockerfile`、`web/Dockerfile`、`admin/server/Dockerfile` LABEL 更新。
- `api/app.py`、`api/tasks/**`、`api/commands.py` 启动/任务日志文案清理。

### 第五优先级：合规与版本

- 根目录保留 `LICENSE`（Apache-2.0）。
- About 页添加“基于 Dify 开发”合规声明。
- 版本文件更新：`api/versions.py`、`web/package.json`、`admin/web/package.json`。

---

## 2. 关键代码示例（12 个核心文件）

> 以下是“改法模板”，用于你在对应文件中直接落地。

### 示例 1：`web/app/layout.tsx`

```tsx
const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || '垣码平台'
const faviconUrl = process.env.NEXT_PUBLIC_BRAND_FAVICON_URL || '/favicon.ico'

export const metadata = {
  title: brandName,
  description: `${brandName} - 企业级 AI 应用开发平台`,
  icons: {
    icon: faviconUrl,
  },
}
```

### 示例 2：`web/app/components/header/logo.tsx`

```tsx
export default function Logo() {
  const logoUrl = process.env.NEXT_PUBLIC_BRAND_LOGO_URL || '/logo-yuanma.svg'
  const brandName = process.env.NEXT_PUBLIC_BRAND_NAME || '垣码平台'

  return <img src={logoUrl} alt={brandName} className='h-8 w-auto' />
}
```

### 示例 3：`web/app/components/footer/index.tsx`

```tsx
const copyright =
  process.env.NEXT_PUBLIC_COPYRIGHT_TEXT || 'Copyright © 2025 我方公司 版权所有'
```

### 示例 4：`web/next.config.js`

```js
const nextConfig = {
  env: {
    NEXT_PUBLIC_BRAND_NAME: process.env.BRAND_NAME || '垣码平台',
    NEXT_PUBLIC_BRAND_LOGO_URL: process.env.BRAND_LOGO_URL || '/logo-yuanma.svg',
    NEXT_PUBLIC_BRAND_PRIMARY_COLOR: process.env.BRAND_PRIMARY_COLOR || '#1890ff',
    NEXT_PUBLIC_BRAND_FAVICON_URL: process.env.BRAND_FAVICON_URL || '/favicon.ico',
    NEXT_PUBLIC_COPYRIGHT_TEXT:
      process.env.COPYRIGHT_TEXT || 'Copyright © 2025 我方公司 版权所有',
  },
}

module.exports = nextConfig
```

### 示例 5：`admin/web/src/settings.js`

```js
const brandName = import.meta.env.VITE_BRAND_NAME || '垣码平台'

export default {
  title: brandName,
  siteTitle: brandName,
  logo: import.meta.env.VITE_BRAND_LOGO_URL || '/logo-yuanma.png',
}
```

### 示例 6：`admin/web/src/layout/components/Navbar.vue`

```vue
<script setup>
const brandName = import.meta.env.VITE_BRAND_NAME || '垣码平台'
const logoUrl = import.meta.env.VITE_BRAND_LOGO_URL || '/logo-yuanma.png'
</script>
```

### 示例 7：`api/controllers/console/__init__.py`（Flask 中间件）

```python
from flask import Flask, Response

SENSITIVE_HEADERS = {
    "X-Dify-Version",
    "X-Dify-Env",
    "Server",
}


def register_branding_middleware(app: Flask) -> None:
    @app.after_request
    def strip_brand_headers(response: Response) -> Response:
        for header in SENSITIVE_HEADERS:
            if header in response.headers:
                response.headers.pop(header, None)

        # 可选：设置统一平台响应头
        response.headers["X-Platform-Name"] = "垣码平台"
        return response
```

### 示例 8：`api/controllers/console/version.py`

```python
return {
    "platform": "垣码平台",
    "version": current_app.config.get("APP_VERSION", "1.0.0"),
    "edition": "private",
}
```

### 示例 9：`api/controllers/console/setup.py`

```python
return {
    "status": "ok",
    "message": "垣码平台初始化完成",
}
```

### 示例 10：`api/core/workflow/nodes/*`

```python
# 仅改显示名，不改内部 type key
NODE_DISPLAY_NAME = "垣码-知识检索"
```

### 示例 11：`docker-compose.yml`

```yaml
services:
  yuanma_api:
    container_name: yuanma_api
  yuanma_web:
    container_name: yuanma_web
  yuanma_admin:
    container_name: yuanma_admin
```

### 示例 12：`api/Dockerfile` / `web/Dockerfile` / `admin/server/Dockerfile`

```dockerfile
LABEL maintainer="your-company@example.com"
LABEL vendor="Your Company"
LABEL version="1.0.0"
LABEL description="垣码智慧蜂AI平台"
```

---

## 3. 环境变量设计与降级

### 标准变量

```env
BRAND_NAME=垣码平台
BRAND_LOGO_URL=https://xxx.com/logo.png
BRAND_PRIMARY_COLOR=#1890ff
BRAND_FAVICON_URL=https://xxx.com/favicon.ico
COPYRIGHT_TEXT=Copyright © 2025 我方公司 版权所有
```

### Next.js 注入

- 通过 `next.config.js` 将服务端变量映射为 `NEXT_PUBLIC_*`。
- 组件中只读 `NEXT_PUBLIC_*`，并提供 fallback。

### Vue 注入

- 在 `admin/web/.env.production` 定义：

```env
VITE_BRAND_NAME=垣码平台
VITE_BRAND_LOGO_URL=https://xxx.com/logo.png
VITE_BRAND_PRIMARY_COLOR=#1890ff
VITE_BRAND_FAVICON_URL=https://xxx.com/favicon.ico
VITE_COPYRIGHT_TEXT=Copyright © 2025 我方公司 版权所有
```

---

## 4. 数据库清理 SQL（完整模板）

```sql
BEGIN;

UPDATE apps
SET name = REPLACE(name, 'Dify', '垣码平台')
WHERE name ILIKE '%dify%';

UPDATE users
SET name = REPLACE(name, 'Dify', '垣码平台')
WHERE name ILIKE '%dify%';

UPDATE tenants
SET name = REPLACE(name, 'Dify', '垣码平台')
WHERE name ILIKE '%dify%';

UPDATE app_model_configs
SET config = REPLACE(config::text, 'Dify', '垣码平台')::jsonb
WHERE config::text ILIKE '%dify%';

UPDATE workflows
SET graph = REPLACE(graph::text, 'Dify', '垣码平台')::jsonb
WHERE graph::text ILIKE '%dify%';

COMMIT;
```

> 建议执行前创建快照：`pg_dump` 或事务回滚点。

---

## 5. 合规声明模板（Apache-2.0）

### 文件头模板

```text
Copyright (c) 2026 Your Company.

This file includes modifications based on the Dify project.
Original work Copyright (c) LangGenius, Inc.
Licensed under the Apache License, Version 2.0.
```

### About 页声明（可折叠）

```tsx
<details>
  <summary>开源合规信息</summary>
  <p>本平台基于 Dify 开源项目进行二次开发，遵循 Apache License 2.0。</p>
</details>
```

---

## 6. 回滚与升级策略

1. 单独分支：`feature/brand-yuanma`。
2. 每个优先级一个 commit（UI/API/DB/DevOps）。
3. 使用 patch 保存：

```bash
git format-patch origin/main --stdout > patches/brand-yuanma.patch
```

4. 回滚某阶段：

```bash
git revert <commit_sha>
```

5. 升级官方后重放 patch：

```bash
git am patches/brand-yuanma.patch
```

---

## 7. 测试与验证方法

- 静态扫描：`python3 scripts/branding/verify_branding.py --repo-root . --strict`
- 运行时 API：
  - `--api-base http://localhost:5001`
  - 检查 `/api/version`、`/api/console/api/status`、错误接口响应头。
- 前端页面：打开登录页/控制台/设置页，核对标题、logo、favicon、meta。

