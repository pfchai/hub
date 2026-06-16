# Inline Project Deployment — Design Spec

**Date:** 2026-06-17
**Status:** Approved
**Topic:** 将 curated 项目中的静态 SPA 项目部署为 hub 站内子路径

## 1. Purpose & Scope

Upgrade the Hub project so that curated projects which are deployable as static SPAs can be hosted directly inside hub.pfchai.com as sub-paths (local deployment), and projects too large to build locally can be experienced via iframe embed.

**In scope:**
- 4 curated projects: HowToCook (local), Gift Book (local), Excalidraw (iframe), Slidev (iframe)
- New `deployment` optional field in projects.json
- Visual indicators in list view and detail view for deployment type
- Build script to clone local projects into `public/`
- iframe embed area in detail view for iframe-type projects

**Out of scope:**
- Building large projects (Excalidraw/tldraw) from source
- Auto-updating cloned projects
- Any backend/proxy for iframe content

## 2. Data Model Changes

### New `deployment` field in projects.json

Optional field added to the common project schema:

```json
{
  "deployment": null
}
```

OR:

```json
{
  "deployment": {
    "type": "local",
    "path": "/how-to-cook",
    "deployedAt": "2026-06-17",
    "label": "做饭指南"
  }
}
```

OR:

```json
{
  "deployment": {
    "type": "iframe",
    "url": "https://excalidraw.com",
    "deployedAt": "2026-06-17",
    "label": "在线白板"
  }
}
```

**`deployment` object fields:**

| Field | Required | Description |
|-------|----------|-------------|
| `type` | yes | `"local"` or `"iframe"` |
| `deployedAt` | yes | ISO date of when deployed/added |
| `label` | yes | Short Chinese label used in UI badges and buttons |
| `path` | local only | Sub-path under `public/` |
| `url` | iframe only | External embed URL |

- `type`: `"local"` | `"iframe"`
- `path` (local only): sub-path under `public/`, served directly by Vite
- `url` (iframe only): external URL to embed
- When `deployment` is `null` or absent, no deployment badge or inline experience is shown

### Projects to update

| Project | Deployment |
|---------|-----------|
| HowToCook | `{ "type": "local", "path": "/how-to-cook", "deployedAt": "2026-06-17", "label": "做饭指南" }` |
| Gift Book | `{ "type": "local", "path": "/gift-book", "deployedAt": "2026-06-17", "label": "电子礼簿" }` |
| Excalidraw | `{ "type": "iframe", "url": "https://excalidraw.com", "deployedAt": "2026-06-17", "label": "在线白板" }` |
| Slidev | `{ "type": "iframe", "url": "https://sli.dev", "deployedAt": "2026-06-17", "label": "演示文稿" }` |

## 3. Build Script

A shell script `scripts/deploy-local.sh` clones the local-deployment projects into `public/`:

```bash
#!/bin/bash
set -e
cd "$(dirname "$0")/.."

# HowToCook
if [ ! -d "public/how-to-cook" ]; then
  git clone --depth 1 https://github.com/Anduin2017/HowToCook.git /tmp/HowToCook
  cp -r /tmp/HowToCook public/how-to-cook/
  rm -rf /tmp/HowToCook
fi

# Gift Book
if [ ! -d "public/gift-book" ]; then
  git clone --depth 1 https://github.com/jingguanzhang/gift-book.git /tmp/gift-book
  cp -r /tmp/gift-book public/gift-book/
  rm -rf /tmp/gift-book
fi
```

Run once: `bash scripts/deploy-local.sh`. Vite automatically serves everything under `public/` as static files. On `npm run build`, `public/` contents are copied verbatim into `dist/`.

Subsequently: `hub.pfchai.com/how-to-cook/` and `hub.pfchai.com/gift-book/` are served directly.

## 4. Component Changes

### 4.1 ProjectItem.vue — List Badge

Add a deployment badge next to the type badge in the list row:

- `deployment.type === "local"` → show `🏠 ` + `deployment.label` (green/blue tint pill)
- `deployment.type === "iframe"` → show `🌐 ` + `deployment.label` (purple tint pill)
- `null` / absent → no badge

The badge is small, same visual style as the type badge. Appears between the star count and the type badge.

### 4.2 CuratedDetail.vue — Deployment Section

Add a deployment section between the existing highlights section and the bottom. Include `deployedAt` as a date subtitle (e.g., `部署于 2026-06-17`).

- **local:** `🏠 已部署 · {{ deployment.label }}` header with deployment date. A CTA link `📖 打开 {{ deployment.label }} →` pointing to `deployment.path`.
- **iframe:** `🌐 在线体验 · {{ deployment.label }}` header with deployment date. Embedded iframe card with URL bar and `<iframe sandbox>`.
- **null:** Don't render the section.

The iframe should include `sandbox="allow-scripts allow-same-origin"` and `loading="lazy"` for security and performance.

### 4.3 OwnDetail.vue — Deployment Section

Same treatment as CuratedDetail. Own projects can also have deployment. The deployment section goes after the lessons section. Same local/iframe/null logic.

### 4.4 Tests

Update existing tests to handle the new `deployment` field:

- **ProjectItem.test.js:** Add 2 tests — renders `deployment.label` for local, renders `deployment.label` for iframe.
- **CuratedDetail.test.js:** Add 2 tests — renders iframe for iframe deployment, renders local link for local deployment.
- **OwnDetail.test.js:** Add similar tests for deployment display.
- **useProjects.test.js:** No changes needed (data field is transparent to the composable).

## 5. Routing

No new routes. Local projects are served directly by Vite's static file serving from `public/`. The existing router doesn't need to handle them — they are just file paths under the root.

## 6. Non-Goals (YAGNI)

- No auto-build pipeline for large projects (Excalidraw, tldraw, etc.)
- No iframe wrapper page — iframe is shown inline in the detail view
- No auto-update mechanism for cloned projects
- No proxy/CORS workarounds for iframe content
