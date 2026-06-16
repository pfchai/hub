# CLAUDE.md

## Project: hub

A personal curation website for showcasing vibe-coding projects and handpicked GitHub projects. Primary audience: the author and friends.

### Tech Stack
- **Vue 3** (Composition API + SFC) + **Vite**
- **vue-router** (hash mode) for SPA routing
- Static JSON data source (`src/data/projects.json`), no backend
- Deploy to GitHub Pages or Vercel

### Directory
```
hub/
├── src/
│   ├── views/         ListView.vue, DetailView.vue
│   ├── components/    ProjectItem, FilterBar, TagBadge, OwnDetail, CuratedDetail, etc.
│   ├── composables/   useProjects.js (data loading, filter, search)
│   ├── data/          projects.json (project data source)
│   ├── router/        vue-router hash mode routes
│   └── styles/        global.css (CSS variables, design tokens)
├── public/screenshots/
└── docs/superpowers/specs/   Design documents
```

### Key Design Decisions
- **Own vs Curated**: Two project types with different detail templates. Own = in-depth (story, tech decisions, screenshots, lessons). Curated = concise (description, recommendation, highlights).
- **List-first**: HN-style numbered list with filter/search. No card grid.
- **Modern design**: Clean, restrained, Linear/Vercel-inspired. Light/dark mode via `prefers-color-scheme`.
- **YAGNI**: No backend, no CMS, no analytics, no pagination, no i18n, no SSR.

### Workflow
- Edit `src/data/projects.json` → push → auto-deploy
- Strict git workflow required
