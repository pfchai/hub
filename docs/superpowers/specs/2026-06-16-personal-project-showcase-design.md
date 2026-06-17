# Personal Project Showcase Website — Design Spec

**Date:** 2026-06-16
**Status:** Approved
**Topic:** 个人项目展示网站 (Personal Project Showcase)

## 1. Purpose & Scope

A personal curation website for showcasing the author's own vibe-coding projects alongside handpicked GitHub projects. Primary audience is the author and friends — a curated space for browsing and discovering interesting projects.

- **Own projects (type: "own"):** In-depth case studies with backstory, tech decisions, screenshots, and lessons learned.
- **Curated projects (type: "curated"):** Concise recommendations — what the project is, why it's worth attention, and key technical highlights.
- **Scale:** 30+ projects, extensible.
- **Maintenance:** Edit a single JSON file, push, and the site auto-deploys.

## 2. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Vue 3 (Composition API + SFC) | Content-oriented SFC model, gentle learning curve, excellent Chinese docs |
| Build | Vite | First-class Vue support, fast dev/build |
| Routing | vue-router (hash mode) | SPA routing, GitHub Pages compatible |
| Styling | Plain CSS with CSS custom properties | No CSS framework overhead, design system via variables |
| Data | Static JSON (`src/data/projects.json`) | No backend needed, build-time import |
| Hosting | Cloudflare Pages | Free, auto-deploy on push, global CDN |
| CI/CD | GitHub Actions | Auto build + deploy on push to main |

### Dependencies (4 packages)

- `vue` — core framework
- `vue-router` — SPA routing
- `@vitejs/plugin-vue` — Vite integration
- `marked` — lightweight Markdown-to-HTML for story/lessons fields

Zero runtime dependencies beyond these. No state management library needed — a composable (`useProjects`) handles data loading, filtering, and search.

## 3. Data Model

### projects.json schema

All projects share a common base; type-specific fields extend it.

**Common fields:**

```json
{
  "id": "my-ai-tool",
  "type": "own",
  "title": "AI Code Reviewer",
  "tagline": "One-line summary shown in list view",
  "description": "Longer description for detail view",
  "tags": ["Vue", "OpenAI", "Vite"],
  "stars": 128,
  "url": "https://github.com/user/repo",
  "demo": "https://demo.example.com",
  "cover": "/screenshots/ai-tool.png",
  "addedAt": "2026-03-15"
}
```

- `id`: URL slug, unique. Routes to `/#/project/:id`.
- `type`: `"own"` or `"curated"` — determines which detail template to render.
- `tagline`: Single sentence, displayed in list view alongside title.
- `tags`: Array of strings, used for filtering and display as tag badges.
- `stars`: GitHub star count, used for default sort order.
- `url`: Link to GitHub repository.
- `demo`: Optional live demo link.
- `cover`: Optional screenshot path (relative to `public/`).
- `addedAt`: ISO date string, used for secondary sort.

**Own-project specific fields:**

```json
{
  "story": "## Why I built this\n\nMarkdown content...",
  "techDecisions": [
    { "choice": "Vue over React", "reason": "Better fit for content-heavy sites" }
  ],
  "screenshots": ["/screenshots/ai-tool-1.png", "/screenshots/ai-tool-2.png"],
  "lessons": "Key takeaways and pitfalls encountered..."
}
```

**Curated-project specific fields:**

```json
{
  "whyRecommend": "Why this project is worth attention, 1-2 sentences",
  "highlights": ["Hand-drawn style rendering algorithm", "Real-time collaboration architecture"]
}
```

### Markdown fields

`story` and `lessons` contain Markdown. Rendering uses a lightweight library such as `marked` (~20KB) to convert to HTML at render time.

### File location

`src/data/projects.json` — imported statically at build time by the `useProjects` composable.

## 4. Architecture

### Component Tree

```
App.vue
├── AppHeader.vue          (navigation, search box)
├── AppFooter.vue          (minimal footer)
├── ListView.vue           (route: /#/)
│   ├── FilterBar.vue      (type tabs + tag filter + sort toggle)
│   └── ProjectItem.vue    (single list row, repeated)
├── DetailView.vue         (route: /#/project/:id)
│   ├── OwnDetail.vue      (in-depth template for own projects)
│   └── CuratedDetail.vue  (concise template for curated projects)
├── TagBadge.vue           (reusable tag pill)
└── LoadingSpinner.vue     (cold-load skeleton, rarely shown)
```

### Data Flow

```
projects.json ──(static import)──> useProjects() composable
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
              ListView.vue        DetailView.vue       FilterBar.vue
              (full list)         (single project      (filter/search
                                   by route param)      controls)
```

1. `useProjects()` imports the JSON array, exposes reactive `filteredProjects`, `search()`, `filterByTag()`, `filterByType()`, `getProject(id)`.
2. `ListView` renders the filtered/sorted array as a numbered list.
3. `DetailView` calls `getProject(route.params.id)`, conditionally renders `OwnDetail` or `CuratedDetail` based on `project.type`.

### Routing

| Route | View | Description |
|-------|------|-------------|
| `/#/` | ListView | Main project list with filters |
| `/#/project/:id` | DetailView | SPA detail page for a single project |
| `/#/tag/:tag` | ListView (filtered) | Projects filtered by tag |
| `/#/search?q=xxx` | ListView (filtered) | Text search results |

Hash mode is used for GitHub Pages compatibility (no server-side redirect support).

### Scroll Position Recovery

When navigating from list → detail → list, the previous scroll position and active filters are preserved. Implemented by storing filter state in the composable (which persists across route changes since it's a singleton) and using `scrollBehavior` in vue-router or manual scroll restoration.

## 5. List View Design

### Layout

HN/Product Hunt style numbered list with modern aesthetic:

```
┌─────────────────────────────────────────────────┐
│  🏠 logo   全部 · Own · Curated    🔍 search... │  ← header
│  🏷 All  Vue  AI  Python  React  TypeScript...  │  ← tag filter bar
├─────────────────────────────────────────────────┤
│  1. AI Code Reviewer — GPT-4 自动 review 代码   │ ⭐ 128  own
│  2. Excalidraw — 手绘风格白板工具               │ ⭐ 98.2k curated
│  3. VibeCoding Hub — vibe coding 中文导航站     │ ⭐ 56   own
│  ...                                            │
└─────────────────────────────────────────────────┘
```

### List Item

Each row: **number + title + tagline** (left), **stars + type badge** (right). Hover shows a subtle left border indicator and background shift (150ms transition).

### Filtering & Search

- **Type tabs:** "全部" (All), "Own Projects", "Curated" — three tabs, instant switch.
- **Tag filter:** Click a tag to filter; click again to remove; multi-select supported. Active tags shown with count indicator.
- **Search:** Input filters in real-time against title, tagline, and tags. Client-side matching.
- **Sort:** Default by stars (descending), toggle to sort by `addedAt`.

### Empty State

When filters return zero results: "No projects match your filters. Try adjusting your search."

## 6. Detail View Design

SPA detail view at `/#/project/:id`. Two templates rendered conditionally on `project.type`.

### Own Project Detail (in-depth)

```
← Back to list
Title
Tagline
🏷 Tags  ⭐ Stars
🔗 GitHub  🌐 Live Demo

📖 Background Story
(markdown-rendered narrative about why and how)

🔧 Technical Decisions
· Choice: reason
· Choice: reason

🖼 Screenshots
(image gallery / lightbox)

💡 Lessons & Takeaways
(key insights from building)
```

### Curated Project Detail (concise)

```
← Back to list
Title
Tagline
🏷 Tags  ⭐ Stars
🔗 GitHub

📝 About
(project description)

❤️ Why I Recommend
(author's personal recommendation, 1-2 sentences)

✨ Technical Highlights
· Highlight 1
· Highlight 2
· Highlight 3
```

### Interactions

- "← Back to list" link and browser back button both navigate to list view, restoring filter state and scroll position.
- Tags are clickable — navigate to `/#/tag/:tag` to see all projects with that tag.
- External links (GitHub, Demo) always open in new tab (`target="_blank"`).
- No loading spinner needed for same-origin navigation (JSON is already loaded). A minimal skeleton is shown only on first cold load.

## 7. Visual Design System

### Design Direction

Modern, clean, restrained. Linear/Vercel-inspired — white space, crisp typography, subtle interactions. Content-first, not decoration-first.

### Colors

**Light mode:**
- `bg-primary`: `#ffffff`
- `bg-secondary`: `#f9fafb`
- `text-primary`: `#111827`
- `text-muted`: `#6b7280`
- `accent`: `#2563eb` (blue)
- `border`: `#e5e7eb`

**Dark mode:**
- `bg-primary`: `#0f0f23`
- `bg-secondary`: `#1a1a2e`
- `text-primary`: `#e2e8f0`
- `text-muted`: `#94a3b8`
- `accent`: `#60a5fa` (light blue)
- `border`: `#2a2a4a`

Mode follows `prefers-color-scheme` system setting. Instant switch (no animation).

### Typography

- **Headings:** Inter, system sans-serif fallback
- **Body:** System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", ...`) for native rendering speed
- **Code/Tags:** JetBrains Mono, monospace fallback
- **Base size:** 14px, list items 15px, headings 24px, auxiliary text 12px

### Spacing

- Base unit: **4px**
- All spacing in multiples of 4: 4, 8, 12, 16, 24, 32, 48
- List item padding: 12px vertical
- Detail section spacing: 24px
- Max content width: **720px** (comfortable reading line length)

### Motion

- **Restrained:** No large animations. Only micro-interactions.
- Hover: 150ms background-color transition
- Tab switch: 200ms underline slide
- Route transitions: No animation (instant render for list ↔ detail)
- Dark/light: Instant switch (no transition)

### Type Badges

- `own` badge: subtle accent background, blue tint
- `curated` badge: subtle accent background, purple tint
- Small pill shape, 11–12px font

## 8. Deployment

### Primary: GitHub Pages

- Push to `main` branch triggers GitHub Actions workflow
- Workflow: checkout → `npm ci` → `npm run build` → deploy to `gh-pages` branch
- Custom domain supported via CNAME
- URL format: `https://<username>.github.io/<repo>/`

### Alternative: Vercel

- Connect GitHub repo → auto-detects Vite → deploys
- Preview deployments on PRs
- Edge network, analytics panel

### Update Workflow

```
1. Edit src/data/projects.json (add/edit/remove project)
2. Add screenshots to public/screenshots/ (optional)
3. git commit && git push
4. GitHub Actions auto-builds and deploys (~30 seconds)
5. Site is live with new content
```

## 9. Project Structure

```
project-site/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── screenshots/           # Project screenshots
├── src/
│   ├── main.js                # Vue app entry
│   ├── App.vue                # Root component
│   ├── router/
│   │   └── index.js           # Route definitions
│   ├── composables/
│   │   └── useProjects.js     # Data loading, filter, search logic
│   ├── data/
│   │   └── projects.json      # Project data source
│   ├── views/
│   │   ├── ListView.vue       # Main list page
│   │   └── DetailView.vue     # Project detail page
│   ├── components/
│   │   ├── AppHeader.vue      # Top navigation
│   │   ├── AppFooter.vue      # Footer
│   │   ├── ProjectItem.vue    # Single list row
│   │   ├── FilterBar.vue      # Type tabs + tag filter + sort
│   │   ├── TagBadge.vue        # Tag pill (shared)
│   │   ├── OwnDetail.vue      # In-depth detail template
│   │   └── CuratedDetail.vue  # Concise detail template
│   └── styles/
│       └── global.css         # CSS variables, reset, typography
└── .github/
    └── workflows/
        └── deploy.yml         # Auto-deploy to GitHub Pages
```

## 10. Non-Goals (YAGNI)

Explicitly excluded from this design:

- **No backend / CMS** — static JSON file is sufficient.
- **No analytics** — not needed for a personal curation site.
- **No comments / social features** — personal space, not a platform.
- **No pagination** — 30+ items is a comfortable single-page list with filters.
- **No i18n** — Chinese content only, no localization overhead.
- **No SSR / SSG framework** — SPA with static JSON is simpler and sufficient.

## 11. Open Questions

None. All design decisions are resolved.
