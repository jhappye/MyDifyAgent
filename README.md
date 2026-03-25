# 垣码智慧蜂AI平台

垣码智慧蜂AI平台是基于 Dify 开源项目与 Dify-Plus 二次开发构建的企业级私有化 AI 平台。

## 技术栈
- Core: Python 3.11 + Flask + Next.js + TypeScript
- Admin: Go 1.22 + Gin + Vue3 + Element Plus
- DB: PostgreSQL + pgvector
- Deploy: Docker + Docker Compose

## 品牌化环境变量
```env
BRAND_NAME=垣码平台
BRAND_LOGO_URL=https://xxx.com/logo.png
BRAND_PRIMARY_COLOR=#1890ff
BRAND_FAVICON_URL=https://xxx.com/favicon.ico
COPYRIGHT_TEXT=Copyright © 2025 我方公司 版权所有
```

## 构建部署
```bash
cd docker
cp middleware.env.example middleware.env
docker compose -f docker-compose.middleware.yaml --env-file middleware.env up -d
docker compose -f docker-compose.yaml --env-file middleware.env up -d
```

## 合规说明
本项目保留 Apache-2.0 协议要求，产品 About 页面包含“基于 Dify 开发”的声明。
