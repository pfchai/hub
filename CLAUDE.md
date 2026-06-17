# CLAUDE.md

## Project: hub

A personal curation website for showcasing vibe-coding projects and handpicked GitHub projects. Primary audience: the author and friends.

### Tech Stack
- **Vue 3** (Composition API + SFC) + **Vite**
- **vue-router** (hash mode) for SPA routing
- Static JSON data source (`src/data/projects.json`), no backend
- Deploy to Cloudflare Pages (hub.pfchai.com) via GitHub Actions

### Directory
```
hub/
├── src/
│   ├── views/         ListView.vue, DetailView.vue, NotFound.vue
│   ├── components/    AppHeader, AppFooter, ProjectItem, FilterBar, TagBadge, OwnDetail, CuratedDetail
│   ├── composables/   useProjects.js (data loading, filter, search, sort)
│   ├── data/          projects.json (project data source)
│   ├── utils/         format.js, markdown.js
│   ├── router/        vue-router hash mode routes (lazy loaded)
│   ├── styles/        global.css (CSS variables, design tokens)
│   └── __tests__/     component and composable tests
├── scripts/           deploy-local.sh, build-howtocook.js
├── public/            static assets + local deployment projects (gitignored)
├── _deploy/           cloned repos for local builds (gitignored)
└── docs/superpowers/specs/   Design documents
```

### Key Design Decisions
- **Own vs Curated**: Two project types with different detail templates. Own = in-depth (story, tech decisions, screenshots, lessons). Curated = concise (description, recommendation, highlights).
- **List-first**: HN-style numbered list with filter/search. No card grid.
- **Modern design**: Clean, restrained, Linear/Vercel-inspired. Light/dark mode via `prefers-color-scheme`.
- **YAGNI**: No backend, no CMS, no analytics, no pagination, no i18n, no SSR.

### Workflow
- Edit `src/data/projects.json` → push → CI runs `deploy-local.sh` → `npm test` → `npm run build` → Cloudflare Pages deploy
- Local deployment projects: clone to `_deploy/`, build → `public/` (gitignored)
- Run `bash scripts/deploy-local.sh` to rebuild local projects locally
- Strict git workflow required
