# Hub — Personal Project Showcase

**Hub** 是一个个人项目策展网站，展示自己的 vibe coding 项目和精选的 GitHub 开源项目。

A personal curation website showcasing vibe-coding projects and handpicked GitHub open-source projects.

🌐 **[hub.pfchai.com](https://hub.pfchai.com)**

## ✨ Features

- **HN-style list layout** — 一目了然的项目列表，支持过滤、搜索、排序
- **Own vs Curated** — 自己的项目深度展示（背景、技术决策、心得），精选项目简洁推荐
- **Light / Dark mode** — 跟随系统自动切换
- **Local deployments** — 精选开源项目本地化部署（HowToCook、Excalidraw、Slidev、Gift Book）
- **Static JSON data** — 零后端，纯静态数据驱动
- **Hash-mode SPA** — 兼容任何静态托管平台

## 🛠 Tech Stack

| 技术 | 用途 |
|------|------|
| Vue 3 + Vite | SPA 框架 & 构建 |
| vue-router (hash) | 路由 |
| CSS Custom Properties | 设计系统 & 深色模式 |
| marked | Markdown 渲染 |
| Vitest + @vue/test-utils | 测试 |
| Cloudflare Pages | 部署 |

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18

### Development
```bash
npm install
npm run dev          # 启动开发服务器 → http://localhost:5173
```

### Test
```bash
npm test             # 运行全部测试
npm run test:watch   # 监听模式
```

### Build
```bash
npm run build        # 构建到 dist/
npm run preview      # 预览构建产物
```

## 📦 Adding a Project

编辑 `src/data/projects.json`，参考已有项目的格式：

```json
{
  "id": "my-project",
  "type": "own|curated",
  "title": "My Project",
  "tagline": "A short one-liner",
  "tags": ["Vue", "Vite"],
  "stars": 1000,
  "url": "https://github.com/user/repo",
  "addedAt": "2026-06-17"
}
```

详情页面字段：

- **Own 项目**（`"type": "own"`）：`story`, `techDecisions`, `screenshots`, `lessons`
- **Curated 项目**（`"type": "curated"`）：`description`, `whyRecommend`, `highlights`

### Deploying Local Projects

部分项目可以本地化部署为子路径下的 SPA：

```bash
bash scripts/deploy-local.sh
```

这会将 4 个项目构建到 `public/` 目录下（已 gitignore，不会上传到 GitHub，由 CI 自动构建）。

## 📂 Project Structure

```
hub/
├── src/
│   ├── components/      AppHeader, FilterBar, ProjectItem, etc.
│   ├── views/           ListView, DetailView
│   ├── composables/     useProjects.js
│   ├── data/            projects.json
│   ├── router/          vue-router hash mode
│   ├── styles/          global.css (design system)
│   └── __tests__/       组件和逻辑测试
├── scripts/
│   ├── deploy-local.sh  本地项目构建脚本
│   └── build-howtocook.js  Markdown → HTML 渲染
├── public/             静态资源 & 本地部署项目（gitignored）
├── .github/workflows/  CI/CD → Cloudflare Pages
└── docs/superpowers/   设计文档和计划
```

## 🚢 Deployment

Push to `main` → GitHub Actions → build + deploy to **Cloudflare Pages** at [hub.pfchai.com](https://hub.pfchai.com).

CI 流程：
1. Checkout & Node setup
2. `npm ci`
3. `bash scripts/deploy-local.sh` — 构建本地部署项目
4. `npm test` — 运行全部测试
5. `npm run build` — 构建 SPA
6. `wrangler pages deploy` — 部署到 Cloudflare Pages

## 📄 License

MIT © pfchai
