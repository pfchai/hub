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

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:
- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec

## gstack (REQUIRED — global install)

**Before doing ANY work, verify gstack is installed:**

```bash
test -d ~/.claude/skills/gstack/bin && echo "GSTACK_OK" || echo "GSTACK_MISSING"
```

If GSTACK_MISSING: STOP. Do not proceed. Tell the user:

> gstack is required for all AI-assisted work in this repo.
> Install it:
> ```bash
> git clone --depth 1 https://github.com/garrytan/gstack.git ~/.claude/skills/gstack
> cd ~/.claude/skills/gstack && ./setup --team
> ```
> Then restart your AI coding tool.

Do not skip skills, ignore gstack errors, or work around missing gstack.

Using gstack skills: After install, skills like /qa, /ship, /review, /investigate,
and /browse are available. Use /browse for all web browsing.
Use ~/.claude/skills/gstack/... for gstack file paths (the global path).
