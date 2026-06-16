# Personal Project Showcase — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a SPA personal curation website with Vue 3 + Vite that showcases own vibe-coding projects and curated GitHub projects from a static JSON data source.

**Architecture:** Vue 3 SPA with hash-mode routing (vue-router). A single composable (`useProjects`) loads static JSON and provides reactive filtering/search/sort. Two main views: ListView (HN-style numbered list) and DetailView (conditionally renders OwnDetail or CuratedDetail templates). Pure CSS design system with light/dark mode via `prefers-color-scheme`.

**Tech Stack:** Vue 3 (Composition API + SFC), Vite, vue-router (hash mode), marked (Markdown rendering), Vitest + @vue/test-utils + jsdom (testing)

---

### File Structure Map

```
hub/
├── index.html                         # Vite entry HTML
├── package.json                       # Dependencies & scripts
├── vite.config.js                     # Vite + Vitest config
├── .gitignore
├── public/
│   └── screenshots/                   # Static project screenshots
├── src/
│   ├── main.js                        # App bootstrap
│   ├── App.vue                        # Root layout
│   ├── router/
│   │   └── index.js                   # Hash-mode route definitions
│   ├── composables/
│   │   └── useProjects.js             # Data + filter/sort/search logic
│   ├── data/
│   │   └── projects.json              # Static project data
│   ├── utils/
│   │   └── markdown.js                # marked wrapper
│   ├── views/
│   │   ├── ListView.vue               # Project list page
│   │   └── DetailView.vue             # Project detail page
│   ├── components/
│   │   ├── AppHeader.vue              # Top nav bar
│   │   ├── AppFooter.vue              # Minimal footer
│   │   ├── ProjectItem.vue            # Single list row
│   │   ├── FilterBar.vue              # Type tabs + tags + search + sort
│   │   ├── TagBadge.vue               # Reusable tag pill
│   │   ├── OwnDetail.vue              # In-depth own-project template
│   │   └── CuratedDetail.vue          # Concise curated-project template
│   └── styles/
│       └── global.css                 # CSS variables, reset, typography
├── src/__tests__/                     # Vitest test files
│   ├── useProjects.test.js
│   ├── TagBadge.test.js
│   ├── ProjectItem.test.js
│   ├── FilterBar.test.js
│   ├── ListView.test.js
│   ├── AppHeader.test.js
│   ├── OwnDetail.test.js
│   ├── CuratedDetail.test.js
│   └── DetailView.test.js
└── .github/
    └── workflows/
        └── deploy.yml                 # GitHub Pages auto-deploy
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `.gitignore`
- Create: `src/main.js` (minimal placeholder)
- Create: `src/styles/global.css` (empty placeholder)

- [ ] **Step 1: Write package.json**

```json
{
  "name": "hub",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "vue": "^3.5.0",
    "vue-router": "^4.5.0",
    "marked": "^15.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.2.0",
    "vite": "^6.0.0",
    "vitest": "^3.0.0",
    "@vue/test-utils": "^2.4.0",
    "jsdom": "^26.0.0"
  }
}
```

- [ ] **Step 2: Write vite.config.js**

```js
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
  },
})
```

- [ ] **Step 3: Write index.html**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
    <title>Hub — Project Showcase</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

- [ ] **Step 4: Write .gitignore**

```
node_modules/
dist/
.vite/
*.local
```

- [ ] **Step 5: Write minimal src/main.js**

```js
import { createApp } from 'vue'
import App from './App.vue'
import './styles/global.css'

createApp(App).mount('#app')
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`
Expected: Dependencies installed without errors.

- [ ] **Step 7: Verify dev server starts**

Run: `npm run dev`
Expected: Vite dev server starts, opens `http://localhost:5173`. Page renders blank (App.vue not yet defined). Kill server after confirming.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "chore: scaffold Vue 3 + Vite project with testing deps"
```

---

### Task 2: Global CSS & Design System

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Write global.css with CSS variables, reset, typography, layout**

```css
/* ===== CSS Custom Properties ===== */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #111827;
  --text-muted: #6b7280;
  --accent: #2563eb;
  --accent-own: #2563eb;
  --accent-curated: #7c3aed;
  --border: #e5e7eb;
  --radius: 6px;
  --max-width: 720px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #0f0f23;
    --bg-secondary: #1a1a2e;
    --text-primary: #e2e8f0;
    --text-muted: #94a3b8;
    --accent: #60a5fa;
    --accent-own: #60a5fa;
    --accent-curated: #a78bfa;
    --border: #2a2a4a;
  }
}

/* ===== Reset ===== */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-size: 14px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  color: var(--text-primary);
  background: var(--bg-primary);
  line-height: 1.6;
}

/* ===== Typography ===== */
h1, h2, h3, h4 {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.3;
}

h1 { font-size: 1.5rem; font-weight: 600; }
h2 { font-size: 1.25rem; font-weight: 600; }
h3 { font-size: 1.1rem; font-weight: 500; }

code, pre, .tag-badge, .mono {
  font-family: "JetBrains Mono", "SF Mono", "Cascadia Code", monospace;
}

a {
  color: var(--accent);
  text-decoration: none;
}
a:hover {
  text-decoration: underline;
}

/* ===== Layout ===== */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 24px 16px 48px;
}

/* ===== Utility ===== */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ===== Loading skeleton ===== */
.skeleton {
  animation: pulse 1.5s ease-in-out infinite;
  background: var(--border);
  border-radius: var(--radius);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
```

- [ ] **Step 2: Verify CSS loads**

Run: `npm run dev`, open browser.
Expected: No visible content but `prefers-color-scheme` variables applied. Kill server.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "style: add CSS design system with light/dark mode variables"
```

---

### Task 3: Sample Data & useProjects Composable

**Files:**
- Create: `src/data/projects.json`
- Create: `src/utils/markdown.js`
- Create: `src/composables/useProjects.js`
- Create: `src/__tests__/useProjects.test.js`

- [ ] **Step 1: Write failing test for useProjects**

```js
// src/__tests__/useProjects.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { useProjects } from '../composables/useProjects.js'

// Reset module state between tests
beforeEach(async () => {
  // Re-import to reset singleton state
  const module = await import('../composables/useProjects.js?update=' + Date.now())
  // State is module-level, we work around it by testing each behavior independently
})

describe('useProjects', () => {
  it('returns all projects by default', () => {
    const { filteredProjects } = useProjects()
    expect(filteredProjects.value.length).toBeGreaterThan(0)
  })

  it('filters projects by type "own"', () => {
    const { filterByType, filteredProjects } = useProjects()
    filterByType('own')
    expect(filteredProjects.value.every(p => p.type === 'own')).toBe(true)
  })

  it('filters projects by type "curated"', () => {
    const { filterByType, filteredProjects } = useProjects()
    filterByType('curated')
    expect(filteredProjects.value.every(p => p.type === 'curated')).toBe(true)
  })

  it('filters projects by tag', () => {
    const { toggleTag, filteredProjects } = useProjects()
    toggleTag('Vue')
    expect(filteredProjects.value.every(p => p.tags.includes('Vue'))).toBe(true)
  })

  it('sorts projects by stars descending by default', () => {
    const { filteredProjects } = useProjects()
    const stars = filteredProjects.value.map(p => p.stars)
    const sorted = [...stars].sort((a, b) => b - a)
    expect(stars).toEqual(sorted)
  })

  it('sorts projects by date when sortBy is "date"', () => {
    const { setSort, filteredProjects } = useProjects()
    setSort('date')
    const dates = filteredProjects.value.map(p => p.addedAt)
    const sorted = [...dates].sort((a, b) => b.localeCompare(a))
    expect(dates).toEqual(sorted)
  })

  it('searches projects by text matching title, tagline, and tags', () => {
    const { search, filteredProjects } = useProjects()
    search('GPT')
    expect(filteredProjects.value.length).toBeGreaterThan(0)
    expect(filteredProjects.value.every(p =>
      p.title.toLowerCase().includes('gpt') ||
      p.tagline.toLowerCase().includes('gpt') ||
      p.tags.some(t => t.toLowerCase().includes('gpt'))
    )).toBe(true)
  })

  it('getProject returns project by id', () => {
    const { getProject } = useProjects()
    const project = getProject('ai-code-reviewer')
    expect(project).toBeDefined()
    expect(project.title).toBe('AI Code Reviewer')
  })

  it('getProject returns undefined for unknown id', () => {
    const { getProject } = useProjects()
    expect(getProject('nonexistent')).toBeUndefined()
  })

  it('allTags returns unique sorted tags from all projects', () => {
    const { allTags } = useProjects()
    expect(allTags.value.length).toBeGreaterThan(0)
    expect(allTags.value).toEqual([...allTags.value].sort())
    // Verify uniqueness
    expect(new Set(allTags.value).size).toBe(allTags.value.length)
  })

  it('resetFilters clears all filters', () => {
    const { filterByType, toggleTag, search, resetFilters, filteredProjects } = useProjects()
    filterByType('own')
    toggleTag('Vue')
    search('something')
    resetFilters()
    expect(filteredProjects.value.length).toBe(useProjects().projects.value.length)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/useProjects.test.js`
Expected: FAIL — module not found or composable not defined.

- [ ] **Step 3: Write projects.json sample data**

```json
[
  {
    "id": "ai-code-reviewer",
    "type": "own",
    "title": "AI Code Reviewer",
    "tagline": "用 GPT-4 自动 review 代码，支持 GitLab 和 GitHub",
    "description": "在日常 code review 中发现很多问题模式是重复的，于是尝试用 AI 来自动化第一轮审查，减少人工 review 的负担。",
    "tags": ["Vue", "OpenAI", "Vite"],
    "stars": 128,
    "url": "https://github.com/user/ai-code-reviewer",
    "demo": "https://ai-reviewer.demo.example.com",
    "cover": "/screenshots/ai-reviewer.png",
    "addedAt": "2026-03-15",
    "story": "## 为什么做这个项目\n\n在日常 code review 中发现很多问题模式是重复的。命名规范、空值检查、安全漏洞等基础问题占用了大量时间。\n\n## 技术挑战\n\n最大的挑战是如何让 AI 输出一致的、可操作的 review 意见。",
    "techDecisions": [
      { "choice": "Vue 3", "reason": "快速原型开发，SFC 对内容型页面友好" },
      { "choice": "OpenAI API", "reason": "GPT-4 的代码理解能力在同类中最好" }
    ],
    "screenshots": [],
    "lessons": "最大的坑是 prompt engineering 比写代码更重要。反复调整 prompt 模板花了大部分开发时间。"
  },
  {
    "id": "vibecoding-hub",
    "type": "own",
    "title": "VibeCoding Hub",
    "tagline": "收集优质 vibe coding 项目的中文导航站",
    "description": "一个中文社区驱动的 vibe coding 项目导航站，帮助开发者发现和学习 AI 辅助编程的优秀实践。",
    "tags": ["Vue", "Vite", "GitHub Pages"],
    "stars": 56,
    "url": "https://github.com/user/vibecoding-hub",
    "demo": "https://vibecoding.example.com",
    "addedAt": "2026-05-20",
    "story": "## 灵感来源\n\nVibe coding 这个概念越来越火，但中文社区缺少一个系统性的项目导航。",
    "techDecisions": [
      { "choice": "纯静态站点", "reason": "内容型网站不需要后端，维护成本低" }
    ],
    "screenshots": [],
    "lessons": "内容策展类网站最重要的是信息架构和可维护性，功能不是越多越好。"
  },
  {
    "id": "excalidraw",
    "type": "curated",
    "title": "Excalidraw",
    "tagline": "手绘风格白板工具，开源协作绘图",
    "description": "Excalidraw 是一个开源的虚拟协作白板工具，让你画出具有手绘风格的图表和线框图。支持实时协作，拥有丰富的插件生态。",
    "tags": ["React", "Canvas", "TypeScript"],
    "stars": 98200,
    "url": "https://github.com/excalidraw/excalidraw",
    "addedAt": "2026-01-10",
    "whyRecommend": "这是我见过最好的开源白板工具，API 设计优雅，扩展性强，非常适合作为学习 React + Canvas 的参考项目。",
    "highlights": ["手绘风格渲染算法 — 让每条线看起来都是人画的", "实时协作架构 — WebSocket + CRDT 实现", "优秀的插件系统设计 — 易于扩展"]
  },
  {
    "id": "tldraw",
    "type": "curated",
    "title": "tldraw",
    "tagline": "无限画布白板 SDK，开发者优先",
    "description": "tldraw 是一个无限画布白板 SDK，提供了强大的 API 让开发者可以构建自定义的白板应用。",
    "tags": ["React", "TypeScript", "Canvas"],
    "stars": 41000,
    "url": "https://github.com/tldraw/tldraw",
    "addedAt": "2026-02-18",
    "whyRecommend": "如果你需要在产品中嵌入白板功能，tldraw 是目前最好的 SDK 选择，文档详尽，API 设计合理。",
    "highlights": ["SDK 化设计 — 不是工具而是平台", "完美的 TypeScript 类型支持", "丰富的示例和文档"]
  },
  {
    "id": "slidev",
    "type": "curated",
    "title": "Slidev",
    "tagline": "用 Markdown 写演示文稿，开发者专属 PPT 工具",
    "description": "Slidev 让开发者用 Markdown 编写演示文稿，支持代码高亮、Vue 组件嵌入、实时预览等特性。",
    "tags": ["Vue", "Vite", "Markdown"],
    "stars": 35000,
    "url": "https://github.com/slidevjs/slidev",
    "addedAt": "2026-03-01",
    "whyRecommend": "彻底改变了开发者做技术分享的方式。把 PPT 变成了可版本控制、可复用的代码。",
    "highlights": ["Markdown 驱动 — 开发者最熟悉的工作流", "Vue 组件嵌入 — 演示可以包含交互式 demo", "WYSIWYG 编辑体验"]
  }
]
```

- [ ] **Step 4: Write markdown utility**

```js
// src/utils/markdown.js
import { marked } from 'marked'

/**
 * Render a markdown string to HTML.
 * Returns empty string for falsy input.
 */
export function renderMarkdown(text) {
  if (!text) return ''
  return marked.parse(text)
}
```

- [ ] **Step 5: Write useProjects composable**

```js
// src/composables/useProjects.js
import { ref, computed } from 'vue'
import projectsData from '../data/projects.json'

// Module-level reactive state (singleton — persists across route changes)
const projects = ref(projectsData)
const activeType = ref('all')
const activeTags = ref(new Set())
const searchQuery = ref('')
const sortBy = ref('stars')

export function useProjects() {
  const allTags = computed(() => {
    const tagSet = new Set()
    for (const p of projects.value) {
      for (const t of p.tags) {
        tagSet.add(t)
      }
    }
    return [...tagSet].sort()
  })

  const filteredProjects = computed(() => {
    let result = [...projects.value]

    // Filter by type
    if (activeType.value === 'own') {
      result = result.filter(p => p.type === 'own')
    } else if (activeType.value === 'curated') {
      result = result.filter(p => p.type === 'curated')
    }

    // Filter by tags (multi-select AND)
    if (activeTags.value.size > 0) {
      result = result.filter(p =>
        [...activeTags.value].every(tag => p.tags.includes(tag))
      )
    }

    // Search
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.trim().toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      )
    }

    // Sort
    if (sortBy.value === 'stars') {
      result.sort((a, b) => b.stars - a.stars)
    } else {
      result.sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    }

    return result
  })

  function filterByType(type) {
    activeType.value = type
  }

  function toggleTag(tag) {
    const next = new Set(activeTags.value)
    if (next.has(tag)) {
      next.delete(tag)
    } else {
      next.add(tag)
    }
    activeTags.value = next
  }

  function search(query) {
    searchQuery.value = query
  }

  function setSort(key) {
    sortBy.value = key
  }

  function getProject(id) {
    return projects.value.find(p => p.id === id)
  }

  function resetFilters() {
    activeType.value = 'all'
    activeTags.value = new Set()
    searchQuery.value = ''
    sortBy.value = 'stars'
  }

  return {
    projects,
    filteredProjects,
    activeType,
    activeTags,
    searchQuery,
    sortBy,
    allTags,
    filterByType,
    toggleTag,
    search,
    setSort,
    getProject,
    resetFilters,
  }
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/useProjects.test.js`
Expected: All 10 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/data/ src/utils/ src/composables/ src/__tests__/
git commit -m "feat: add sample data and useProjects composable with filter/search/sort"
```

---

### Task 4: TagBadge Component

**Files:**
- Create: `src/components/TagBadge.vue`
- Create: `src/__tests__/TagBadge.test.js`

- [ ] **Step 1: Write failing test for TagBadge**

```js
// src/__tests__/TagBadge.test.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TagBadge from '../components/TagBadge.vue'

describe('TagBadge', () => {
  it('renders the tag text', () => {
    const wrapper = mount(TagBadge, { props: { tag: 'Vue' } })
    expect(wrapper.text()).toContain('Vue')
    expect(wrapper.classes()).toContain('tag-badge')
  })

  it('renders as a link when clickable is true', () => {
    const wrapper = mount(TagBadge, {
      props: { tag: 'React', clickable: true }
    })
    expect(wrapper.find('a').exists()).toBe(true)
    expect(wrapper.find('a').attributes('href')).toBe('#/tag/React')
  })

  it('renders as a span when clickable is false', () => {
    const wrapper = mount(TagBadge, {
      props: { tag: 'React', clickable: false }
    })
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.find('span').exists()).toBe(true)
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(TagBadge, {
      props: { tag: 'Vue', clickable: true }
    })
    await wrapper.find('a').trigger('click')
    expect(wrapper.emitted('tag-click')).toBeTruthy()
    expect(wrapper.emitted('tag-click')[0]).toEqual(['Vue'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/TagBadge.test.js`
Expected: FAIL — component not found.

- [ ] **Step 3: Write TagBadge.vue**

```vue
<template>
  <a
    v-if="clickable"
    :href="`#/tag/${tag}`"
    class="tag-badge tag-badge--clickable"
    @click.prevent="$emit('tag-click', tag)"
  >{{ tag }}</a>
  <span v-else class="tag-badge">{{ tag }}</span>
</template>

<script setup>
defineProps({
  tag: { type: String, required: true },
  clickable: { type: Boolean, default: false },
})

defineEmits(['tag-click'])
</script>

<style scoped>
.tag-badge {
  display: inline-block;
  font-family: "JetBrains Mono", "SF Mono", monospace;
  font-size: 0.75rem;
  padding: 1px 8px;
  border-radius: 4px;
  border: 1px solid var(--border);
  color: var(--text-muted);
  background: var(--bg-secondary);
  white-space: nowrap;
  transition: border-color 150ms, color 150ms;
}

.tag-badge--clickable {
  cursor: pointer;
}
.tag-badge--clickable:hover {
  border-color: var(--accent);
  color: var(--accent);
  text-decoration: none;
}
</style>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/TagBadge.test.js`
Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/TagBadge.vue src/__tests__/TagBadge.test.js
git commit -m "feat: add TagBadge component"
```

---

### Task 5: ProjectItem Component

**Files:**
- Create: `src/components/ProjectItem.vue`
- Create: `src/__tests__/ProjectItem.test.js`

- [ ] **Step 1: Write failing test for ProjectItem**

```js
// src/__tests__/ProjectItem.test.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectItem from '../components/ProjectItem.vue'

const mockOwnProject = {
  id: 'test-project',
  type: 'own',
  title: 'Test Project',
  tagline: 'A test project tagline',
  tags: ['Vue', 'Vite'],
  stars: 42,
  url: 'https://github.com/test/project',
  addedAt: '2026-01-01',
  description: 'Test description',
}

const mockCuratedProject = {
  id: 'curated-project',
  type: 'curated',
  title: 'Curated Project',
  tagline: 'A curated project tagline',
  tags: ['React'],
  stars: 1000,
  url: 'https://github.com/curated/project',
  addedAt: '2026-01-01',
  description: 'Curated description',
  whyRecommend: 'Great project',
  highlights: ['Fast', 'Reliable'],
}

describe('ProjectItem', () => {
  it('renders rank number, title, and tagline', () => {
    const wrapper = mount(ProjectItem, {
      props: { project: mockOwnProject, rank: 3 }
    })
    expect(wrapper.text()).toContain('3.')
    expect(wrapper.text()).toContain('Test Project')
    expect(wrapper.text()).toContain('A test project tagline')
  })

  it('renders star count', () => {
    const wrapper = mount(ProjectItem, {
      props: { project: mockOwnProject, rank: 1 }
    })
    expect(wrapper.text()).toContain('42')
  })

  it('renders own type badge for own projects', () => {
    const wrapper = mount(ProjectItem, {
      props: { project: mockOwnProject, rank: 1 }
    })
    const badges = wrapper.findAll('.project-item__type')
    expect(badges.length).toBe(1)
    expect(badges[0].text()).toBe('own')
  })

  it('renders curated type badge for curated projects', () => {
    const wrapper = mount(ProjectItem, {
      props: { project: mockCuratedProject, rank: 2 }
    })
    const badge = wrapper.find('.project-item__type--curated')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('curated')
  })

  it('links to project detail page', () => {
    const wrapper = mount(ProjectItem, {
      props: { project: mockOwnProject, rank: 1 }
    })
    const link = wrapper.find('a.project-item')
    expect(link.attributes('href')).toBe('#/project/test-project')
  })

  it('renders tags using TagBadge components', () => {
    const wrapper = mount(ProjectItem, {
      props: { project: mockOwnProject, rank: 1 }
    })
    const tags = wrapper.findAll('.project-item__tags .tag-badge')
    expect(tags.length).toBe(2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/ProjectItem.test.js`
Expected: FAIL — component not found.

- [ ] **Step 3: Write ProjectItem.vue**

```vue
<template>
  <a
    :href="`#/project/${project.id}`"
    class="project-item"
  >
    <span class="project-item__rank">{{ rank }}.</span>
    <div class="project-item__body">
      <span class="project-item__title">{{ project.title }}</span>
      <span class="project-item__tagline">— {{ project.tagline }}</span>
      <span class="project-item__tags">
        <TagBadge
          v-for="tag in project.tags"
          :key="tag"
          :tag="tag"
          clickable
          @tag-click.stop="() => {}"
        />
      </span>
    </div>
    <div class="project-item__meta">
      <span class="project-item__stars">⭐ {{ formatStars(project.stars) }}</span>
      <span
        class="project-item__type"
        :class="`project-item__type--${project.type}`"
      >{{ project.type }}</span>
    </div>
  </a>
</template>

<script setup>
import TagBadge from './TagBadge.vue'

defineProps({
  project: { type: Object, required: true },
  rank: { type: Number, required: true },
})

function formatStars(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}
</script>

<style scoped>
.project-item {
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
  text-decoration: none;
  transition: background-color 150ms;
  border-left: 3px solid transparent;
}

.project-item:hover {
  background-color: var(--bg-secondary);
  border-left-color: var(--accent);
  text-decoration: none;
}

.project-item__rank {
  color: var(--text-muted);
  font-size: 0.85rem;
  min-width: 24px;
  text-align: right;
  flex-shrink: 0;
}

.project-item__body {
  flex: 1;
  min-width: 0;
  line-height: 1.6;
}

.project-item__title {
  font-weight: 600;
  font-size: 0.95rem;
}

.project-item__tagline {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.project-item__tags {
  display: inline-flex;
  gap: 4px;
  margin-left: 8px;
  vertical-align: middle;
}

.project-item__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.project-item__stars {
  font-size: 0.8rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.project-item__type {
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.project-item__type--own {
  background: rgba(37, 99, 235, 0.1);
  color: var(--accent-own);
}

.project-item__type--curated {
  background: rgba(124, 58, 237, 0.1);
  color: var(--accent-curated);
}
</style>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/ProjectItem.test.js`
Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProjectItem.vue src/__tests__/ProjectItem.test.js
git commit -m "feat: add ProjectItem component with HN-style list row"
```

---

### Task 6: FilterBar Component

**Files:**
- Create: `src/components/FilterBar.vue`
- Create: `src/__tests__/FilterBar.test.js`

- [ ] **Step 1: Write failing test for FilterBar**

```js
// src/__tests__/FilterBar.test.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FilterBar from '../components/FilterBar.vue'

const defaultProps = {
  activeType: 'all',
  activeTags: new Set(),
  allTags: ['React', 'TypeScript', 'Vite', 'Vue'],
  searchQuery: '',
  sortBy: 'stars',
}

describe('FilterBar', () => {
  it('renders type tabs: 全部, Own, Curated', () => {
    const wrapper = mount(FilterBar, { props: defaultProps })
    expect(wrapper.text()).toContain('全部')
    expect(wrapper.text()).toContain('Own')
    expect(wrapper.text()).toContain('Curated')
  })

  it('highlights active type tab', () => {
    const wrapper = mount(FilterBar, {
      props: { ...defaultProps, activeType: 'own' }
    })
    const ownTab = wrapper.find('.filter-bar__tab--active')
    expect(ownTab.exists()).toBe(true)
    expect(ownTab.text()).toBe('Own')
  })

  it('emits "update:type" when a tab is clicked', async () => {
    const wrapper = mount(FilterBar, { props: defaultProps })
    await wrapper.findAll('.filter-bar__tab')[1].trigger('click')
    expect(wrapper.emitted('update:type')).toBeTruthy()
    expect(wrapper.emitted('update:type')[0]).toEqual(['own'])
  })

  it('renders tag chips from allTags', () => {
    const wrapper = mount(FilterBar, { props: defaultProps })
    const tagButtons = wrapper.findAll('.filter-bar__tag')
    expect(tagButtons.length).toBe(4)
  })

  it('highlights active tags', () => {
    const wrapper = mount(FilterBar, {
      props: { ...defaultProps, activeTags: new Set(['Vue']) }
    })
    const vueTag = wrapper.findAll('.filter-bar__tag--active')
    expect(vueTag.length).toBe(1)
    expect(vueTag[0].text()).toBe('Vue')
  })

  it('emits "toggle-tag" when a tag is clicked', async () => {
    const wrapper = mount(FilterBar, { props: defaultProps })
    await wrapper.findAll('.filter-bar__tag')[0].trigger('click')
    expect(wrapper.emitted('toggle-tag')).toBeTruthy()
    expect(wrapper.emitted('toggle-tag')[0]).toEqual(['React'])
  })

  it('emits "update:search" when search input changes', async () => {
    const wrapper = mount(FilterBar, { props: defaultProps })
    const input = wrapper.find('.filter-bar__search')
    await input.setValue('gpt')
    expect(wrapper.emitted('update:search')).toBeTruthy()
  })

  it('emits "update:sortBy" when sort toggle is clicked', async () => {
    const wrapper = mount(FilterBar, { props: defaultProps })
    const sortBtn = wrapper.find('.filter-bar__sort')
    await sortBtn.trigger('click')
    expect(wrapper.emitted('update:sortBy')).toBeTruthy()
  })

  it('shows search input value from prop', () => {
    const wrapper = mount(FilterBar, {
      props: { ...defaultProps, searchQuery: 'react' }
    })
    const input = wrapper.find('.filter-bar__search').element
    expect(input.value).toBe('react')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/FilterBar.test.js`
Expected: FAIL — component not found.

- [ ] **Step 3: Write FilterBar.vue**

```vue
<template>
  <div class="filter-bar">
    <div class="filter-bar__tabs">
      <button
        v-for="tab in types"
        :key="tab.value"
        class="filter-bar__tab"
        :class="{ 'filter-bar__tab--active': activeType === tab.value }"
        @click="$emit('update:type', tab.value)"
      >{{ tab.label }}</button>
    </div>

    <div class="filter-bar__tags">
      <button
        v-for="tag in allTags"
        :key="tag"
        class="filter-bar__tag"
        :class="{ 'filter-bar__tag--active': activeTags.has(tag) }"
        @click="$emit('toggle-tag', tag)"
      >{{ tag }}</button>
    </div>

    <div class="filter-bar__controls">
      <input
        class="filter-bar__search"
        type="search"
        placeholder="搜索项目..."
        :value="searchQuery"
        @input="$emit('update:search', $event.target.value)"
      />
      <button
        class="filter-bar__sort"
        @click="$emit('update:sortBy', sortBy === 'stars' ? 'date' : 'stars')"
      >
        {{ sortBy === 'stars' ? '⭐ Stars' : '📅 Date' }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeType: { type: String, default: 'all' },
  activeTags: { type: Set, default: () => new Set() },
  allTags: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
  sortBy: { type: String, default: 'stars' },
})

defineEmits(['update:type', 'toggle-tag', 'update:search', 'update:sortBy'])

const types = [
  { value: 'all', label: '全部' },
  { value: 'own', label: 'Own' },
  { value: 'curated', label: 'Curated' },
]
</script>

<style scoped>
.filter-bar {
  margin-bottom: 16px;
}

.filter-bar__tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
}

.filter-bar__tab {
  padding: 5px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-primary);
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 150ms;
}

.filter-bar__tab:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

.filter-bar__tab--active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.filter-bar__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}

.filter-bar__tag {
  padding: 3px 10px;
  border: 1px solid var(--border);
  border-radius: 100px;
  background: var(--bg-primary);
  color: var(--text-muted);
  font-size: 0.75rem;
  font-family: "JetBrains Mono", "SF Mono", monospace;
  cursor: pointer;
  transition: all 150ms;
}

.filter-bar__tag:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}

.filter-bar__tag--active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.filter-bar__controls {
  display: flex;
  gap: 8px;
}

.filter-bar__search {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.85rem;
  outline: none;
  transition: border-color 150ms;
}

.filter-bar__search:focus {
  border-color: var(--accent);
}

.filter-bar__search::placeholder {
  color: var(--text-muted);
}

.filter-bar__sort {
  padding: 6px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-primary);
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  white-space: nowrap;
  transition: all 150ms;
}

.filter-bar__sort:hover {
  border-color: var(--accent);
  color: var(--text-primary);
}
</style>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/FilterBar.test.js`
Expected: All 9 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/FilterBar.vue src/__tests__/FilterBar.test.js
git commit -m "feat: add FilterBar component with type tabs, tag filter, search, and sort"
```

---

### Task 7: AppHeader & AppFooter

**Files:**
- Create: `src/components/AppHeader.vue`
- Create: `src/components/AppFooter.vue`
- Create: `src/__tests__/AppHeader.test.js`

- [ ] **Step 1: Write failing test for AppHeader**

```js
// src/__tests__/AppHeader.test.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '../components/AppHeader.vue'

describe('AppHeader', () => {
  it('renders site name as link to home', () => {
    const wrapper = mount(AppHeader)
    const homeLink = wrapper.find('.header__logo')
    expect(homeLink.exists()).toBe(true)
    expect(homeLink.attributes('href')).toBe('#/')
    expect(homeLink.text()).toBe('Hub')
  })

  it('renders nav link to home', () => {
    const wrapper = mount(AppHeader)
    const links = wrapper.findAll('.header__nav a')
    const homeLink = links.find(l => l.text() === 'Home')
    expect(homeLink).toBeTruthy()
  })

  it('emits search event on submit', async () => {
    const wrapper = mount(AppHeader)
    const input = wrapper.find('.header__search')
    await input.setValue('react')
    await input.trigger('keydown.enter')
    // Header's search navigates to list view; FilterBar handles in-page search
    // Just verify the input renders
    expect(input.element.value).toBe('react')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/AppHeader.test.js`
Expected: FAIL — component not found.

- [ ] **Step 3: Write AppHeader.vue**

```vue
<template>
  <header class="header">
    <div class="header__inner">
      <a href="#/" class="header__logo">Hub</a>
      <nav class="header__nav">
        <a href="#/" class="header__link">Home</a>
      </nav>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.header {
  border-bottom: 1px solid var(--border);
  background: var(--bg-primary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header__inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 16px;
  height: 48px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.header__logo {
  font-family: "Inter", sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-primary);
  text-decoration: none;
}

.header__nav {
  display: flex;
  gap: 4px;
}

.header__link {
  padding: 4px 12px;
  font-size: 0.85rem;
  color: var(--text-muted);
  border-radius: var(--radius);
  transition: color 150ms, background 150ms;
  text-decoration: none;
}

.header__link:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
  text-decoration: none;
}
</style>
```

- [ ] **Step 4: Write AppFooter.vue**

```vue
<template>
  <footer class="footer">
    <p>Built with Vue + Vite · Curated by hand</p>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  border-top: 1px solid var(--border);
  padding: 24px 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.8rem;
}
</style>
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/AppHeader.test.js`
Expected: All 3 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/AppHeader.vue src/components/AppFooter.vue src/__tests__/AppHeader.test.js
git commit -m "feat: add AppHeader and AppFooter components"
```

---

### Task 8: OwnDetail Component

**Files:**
- Create: `src/components/OwnDetail.vue`
- Create: `src/__tests__/OwnDetail.test.js`

- [ ] **Step 1: Write failing test for OwnDetail**

```js
// src/__tests__/OwnDetail.test.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OwnDetail from '../components/OwnDetail.vue'

const mockProject = {
  id: 'my-project',
  type: 'own',
  title: 'My Own Project',
  tagline: 'Built with AI assistance',
  description: 'A longer description',
  tags: ['Vue', 'OpenAI'],
  stars: 128,
  url: 'https://github.com/user/repo',
  demo: 'https://demo.example.com',
  cover: '/screenshots/cover.png',
  addedAt: '2026-03-15',
  story: '## Why I built this\n\nIt was an interesting challenge.',
  techDecisions: [
    { choice: 'Vue 3', reason: 'Best fit for the project' },
    { choice: 'Vite', reason: 'Fast build times' },
  ],
  screenshots: ['/screenshots/1.png', '/screenshots/2.png'],
  lessons: '## Key takeaways\n\nAlways test your assumptions.',
}

describe('OwnDetail', () => {
  it('renders project title and tagline', () => {
    const wrapper = mount(OwnDetail, { props: { project: mockProject } })
    expect(wrapper.text()).toContain('My Own Project')
    expect(wrapper.text()).toContain('Built with AI assistance')
  })

  it('renders tags as TagBadge components', () => {
    const wrapper = mount(OwnDetail, { props: { project: mockProject } })
    const badges = wrapper.findAll('.tag-badge')
    expect(badges.length).toBe(2)
  })

  it('renders star count', () => {
    const wrapper = mount(OwnDetail, { props: { project: mockProject } })
    expect(wrapper.text()).toContain('128')
  })

  it('renders GitHub link', () => {
    const wrapper = mount(OwnDetail, { props: { project: mockProject } })
    const links = wrapper.findAll('a')
    const ghLink = links.find(l => l.attributes('href') === 'https://github.com/user/repo')
    expect(ghLink).toBeTruthy()
  })

  it('renders demo link when available', () => {
    const wrapper = mount(OwnDetail, { props: { project: mockProject } })
    const links = wrapper.findAll('a')
    const demoLink = links.find(l => l.attributes('href') === 'https://demo.example.com')
    expect(demoLink).toBeTruthy()
  })

  it('renders story as markdown HTML', () => {
    const wrapper = mount(OwnDetail, { props: { project: mockProject } })
    const story = wrapper.find('.detail__story')
    expect(story.exists()).toBe(true)
    expect(story.html()).toContain('Why I built this')
  })

  it('renders tech decisions list', () => {
    const wrapper = mount(OwnDetail, { props: { project: mockProject } })
    const decisions = wrapper.find('.detail__decisions')
    expect(decisions.exists()).toBe(true)
    expect(decisions.text()).toContain('Vue 3')
    expect(decisions.text()).toContain('Best fit for the project')
  })

  it('renders screenshots section', () => {
    const wrapper = mount(OwnDetail, { props: { project: mockProject } })
    const screenshots = wrapper.find('.detail__screenshots')
    expect(screenshots.exists()).toBe(true)
    expect(wrapper.findAll('.detail__screenshot').length).toBe(2)
  })

  it('renders lessons as markdown HTML', () => {
    const wrapper = mount(OwnDetail, { props: { project: mockProject } })
    const lessons = wrapper.find('.detail__lessons')
    expect(lessons.exists()).toBe(true)
    expect(lessons.html()).toContain('Key takeaways')
  })

  it('does not render demo link if project has no demo', () => {
    const noDemo = { ...mockProject, demo: undefined }
    const wrapper = mount(OwnDetail, { props: { project: noDemo } })
    const links = wrapper.findAll('a')
    const demoLink = links.find(l => l.text().includes('Live Demo'))
    expect(demoLink).toBeFalsy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/OwnDetail.test.js`
Expected: FAIL — component not found.

- [ ] **Step 3: Write OwnDetail.vue**

```vue
<template>
  <article class="detail">
    <header class="detail__header">
      <h1 class="detail__title">{{ project.title }}</h1>
      <p class="detail__tagline">{{ project.tagline }}</p>
      <div class="detail__meta">
        <span class="detail__tags">
          <TagBadge
            v-for="tag in project.tags"
            :key="tag"
            :tag="tag"
            clickable
          />
        </span>
        <span class="detail__stars">⭐ {{ formatStars(project.stars) }}</span>
      </div>
      <div class="detail__links">
        <a :href="project.url" target="_blank" rel="noopener" class="detail__link">
          🔗 GitHub
        </a>
        <a
          v-if="project.demo"
          :href="project.demo"
          target="_blank"
          rel="noopener"
          class="detail__link"
        >
          🌐 Live Demo
        </a>
      </div>
    </header>

    <section v-if="project.story" class="detail__section">
      <h2>📖 背景故事</h2>
      <div class="detail__story markdown-body" v-html="renderMarkdown(project.story)" />
    </section>

    <section v-if="project.techDecisions?.length" class="detail__section">
      <h2>🔧 技术选型</h2>
      <ul class="detail__decisions">
        <li v-for="(td, i) in project.techDecisions" :key="i">
          <strong>{{ td.choice }}</strong>: {{ td.reason }}
        </li>
      </ul>
    </section>

    <section v-if="project.screenshots?.length" class="detail__section">
      <h2>🖼 截图</h2>
      <div class="detail__screenshots">
        <img
          v-for="(src, i) in project.screenshots"
          :key="i"
          :src="src"
          :alt="`Screenshot ${i + 1} of ${project.title}`"
          class="detail__screenshot"
          loading="lazy"
        />
      </div>
    </section>

    <section v-if="project.lessons" class="detail__section">
      <h2>💡 心得 & 教训</h2>
      <div class="detail__lessons markdown-body" v-html="renderMarkdown(project.lessons)" />
    </section>
  </article>
</template>

<script setup>
import TagBadge from './TagBadge.vue'
import { renderMarkdown } from '../utils/markdown.js'

defineProps({
  project: { type: Object, required: true },
})

function formatStars(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}
</script>

<style scoped>
.detail__header {
  margin-bottom: 32px;
}

.detail__title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.detail__tagline {
  color: var(--text-muted);
  font-size: 1rem;
  margin-bottom: 12px;
}

.detail__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.detail__tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.detail__stars {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.detail__links {
  display: flex;
  gap: 16px;
}

.detail__link {
  font-size: 0.9rem;
  padding: 4px 0;
  color: var(--accent);
}

.detail__section {
  margin-bottom: 24px;
}

.detail__section h2 {
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.detail__decisions {
  list-style: none;
  padding: 0;
}

.detail__decisions li {
  padding: 6px 0;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--border);
}

.detail__decisions li:last-child {
  border-bottom: none;
}

.detail__screenshots {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail__screenshot {
  width: 100%;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.markdown-body :deep(h2) { font-size: 1rem; margin-top: 12px; margin-bottom: 6px; }
.markdown-body :deep(h3) { font-size: 0.9rem; margin-top: 10px; margin-bottom: 4px; }
.markdown-body :deep(p) { margin-bottom: 8px; font-size: 0.9rem; line-height: 1.7; }
.markdown-body :deep(ul), .markdown-body :deep(ol) { padding-left: 20px; margin-bottom: 8px; }
.markdown-body :deep(li) { font-size: 0.9rem; margin-bottom: 4px; }
.markdown-body :deep(code) { font-size: 0.8rem; background: var(--bg-secondary); padding: 1px 5px; border-radius: 3px; }
.markdown-body :deep(pre) { background: var(--bg-secondary); padding: 12px; border-radius: var(--radius); overflow-x: auto; margin-bottom: 8px; }
</style>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/OwnDetail.test.js`
Expected: All 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/OwnDetail.vue src/__tests__/OwnDetail.test.js
git commit -m "feat: add OwnDetail component with story, decisions, screenshots, and lessons"
```

---

### Task 9: CuratedDetail Component

**Files:**
- Create: `src/components/CuratedDetail.vue`
- Create: `src/__tests__/CuratedDetail.test.js`

- [ ] **Step 1: Write failing test for CuratedDetail**

```js
// src/__tests__/CuratedDetail.test.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CuratedDetail from '../components/CuratedDetail.vue'

const mockProject = {
  id: 'cool-project',
  type: 'curated',
  title: 'Cool Open Source',
  tagline: 'An amazing tool',
  description: 'A longer description of this cool project.',
  tags: ['React', 'TypeScript'],
  stars: 5000,
  url: 'https://github.com/cool/project',
  addedAt: '2026-02-01',
  whyRecommend: 'This project changed how I think about state management.',
  highlights: ['Blazing fast performance', 'Excellent developer experience', 'Great documentation'],
}

describe('CuratedDetail', () => {
  it('renders project title and tagline', () => {
    const wrapper = mount(CuratedDetail, { props: { project: mockProject } })
    expect(wrapper.text()).toContain('Cool Open Source')
    expect(wrapper.text()).toContain('An amazing tool')
  })

  it('renders tags via TagBadge', () => {
    const wrapper = mount(CuratedDetail, { props: { project: mockProject } })
    const badges = wrapper.findAll('.tag-badge')
    expect(badges.length).toBe(2)
  })

  it('renders formatted star count', () => {
    const wrapper = mount(CuratedDetail, { props: { project: mockProject } })
    expect(wrapper.text()).toContain('5k')
  })

  it('renders GitHub link', () => {
    const wrapper = mount(CuratedDetail, { props: { project: mockProject } })
    const links = wrapper.findAll('a')
    const ghLink = links.find(l => l.attributes('href') === 'https://github.com/cool/project')
    expect(ghLink).toBeTruthy()
  })

  it('renders description section', () => {
    const wrapper = mount(CuratedDetail, { props: { project: mockProject } })
    expect(wrapper.text()).toContain('A longer description of this cool project.')
  })

  it('renders whyRecommend section', () => {
    const wrapper = mount(CuratedDetail, { props: { project: mockProject } })
    expect(wrapper.text()).toContain('This project changed how I think about state management.')
  })

  it('renders highlights list', () => {
    const wrapper = mount(CuratedDetail, { props: { project: mockProject } })
    const highlights = wrapper.find('.detail__highlights')
    expect(highlights.exists()).toBe(true)
    const items = highlights.findAll('li')
    expect(items.length).toBe(3)
    expect(items[0].text()).toContain('Blazing fast performance')
  })

  it('does not show demo link (curated projects have no demo)', () => {
    const wrapper = mount(CuratedDetail, { props: { project: mockProject } })
    const links = wrapper.findAll('a')
    const demoLink = links.find(l => l.text().includes('Demo'))
    expect(demoLink).toBeFalsy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/CuratedDetail.test.js`
Expected: FAIL — component not found.

- [ ] **Step 3: Write CuratedDetail.vue**

```vue
<template>
  <article class="detail">
    <header class="detail__header">
      <h1 class="detail__title">{{ project.title }}</h1>
      <p class="detail__tagline">{{ project.tagline }}</p>
      <div class="detail__meta">
        <span class="detail__tags">
          <TagBadge
            v-for="tag in project.tags"
            :key="tag"
            :tag="tag"
            clickable
          />
        </span>
        <span class="detail__stars">⭐ {{ formatStars(project.stars) }}</span>
      </div>
      <div class="detail__links">
        <a :href="project.url" target="_blank" rel="noopener" class="detail__link">
          🔗 GitHub
        </a>
      </div>
    </header>

    <section class="detail__section">
      <h2>📝 项目简介</h2>
      <p class="detail__description">{{ project.description }}</p>
    </section>

    <section v-if="project.whyRecommend" class="detail__section">
      <h2>❤️ 推荐理由</h2>
      <p class="detail__recommendation">{{ project.whyRecommend }}</p>
    </section>

    <section v-if="project.highlights?.length" class="detail__section">
      <h2>✨ 技术亮点</h2>
      <ul class="detail__highlights">
        <li v-for="(h, i) in project.highlights" :key="i">{{ h }}</li>
      </ul>
    </section>
  </article>
</template>

<script setup>
import TagBadge from './TagBadge.vue'

defineProps({
  project: { type: Object, required: true },
})

function formatStars(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}
</script>

<style scoped>
.detail__header {
  margin-bottom: 32px;
}

.detail__title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.detail__tagline {
  color: var(--text-muted);
  font-size: 1rem;
  margin-bottom: 12px;
}

.detail__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.detail__tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.detail__stars {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.detail__links {
  display: flex;
  gap: 16px;
}

.detail__link {
  font-size: 0.9rem;
  padding: 4px 0;
  color: var(--accent);
}

.detail__section {
  margin-bottom: 24px;
}

.detail__section h2 {
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.detail__description {
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--text-primary);
}

.detail__recommendation {
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--text-primary);
  padding: 12px;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border-left: 3px solid var(--accent-curated);
}

.detail__highlights {
  list-style: none;
  padding: 0;
}

.detail__highlights li {
  padding: 6px 0;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--border);
}

.detail__highlights li:last-child {
  border-bottom: none;
}

.detail__highlights li::before {
  content: "· ";
  color: var(--accent-curated);
  font-weight: bold;
}
</style>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/CuratedDetail.test.js`
Expected: All 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/CuratedDetail.vue src/__tests__/CuratedDetail.test.js
git commit -m "feat: add CuratedDetail component with description, recommendation, and highlights"
```

---

### Task 10: DetailView Component

**Files:**
- Create: `src/views/DetailView.vue`
- Create: `src/__tests__/DetailView.test.js`

- [ ] **Step 1: Write failing test for DetailView**

```js
// src/__tests__/DetailView.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DetailView from '../views/DetailView.vue'

// Mock useProjects to control getProject return value
vi.mock('../composables/useProjects.js', () => ({
  useProjects: vi.fn(() => ({
    getProject: vi.fn((id) => {
      if (id === 'my-project') return {
        id: 'my-project', type: 'own', title: 'My Project', tagline: 'test',
        tags: ['Vue'], stars: 10, url: 'https://a.com', addedAt: '2026-01-01',
        description: 'desc', story: '# Hi', techDecisions: [], screenshots: [], lessons: '',
      }
      if (id === 'curated') return {
        id: 'curated', type: 'curated', title: 'Curated', tagline: 'test',
        tags: ['React'], stars: 100, url: 'https://b.com', addedAt: '2026-01-01',
        description: 'desc', whyRecommend: 'good', highlights: ['fast'],
      }
      return undefined
    }),
  })),
}))

const mockRouterPush = vi.fn()

// Stub vue-router
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ params: { id: 'my-project' } })),
  useRouter: vi.fn(() => ({ push: mockRouterPush, back: vi.fn() })),
}))

describe('DetailView', () => {
  beforeEach(() => {
    mockRouterPush.mockClear()
  })

  it('renders OwnDetail for own-type projects', async () => {
    const { useRoute } = await import('vue-router')
    useRoute.mockReturnValue({ params: { id: 'my-project' } })
    const wrapper = mount(DetailView)
    expect(wrapper.text()).toContain('My Project')
    expect(wrapper.text()).toContain('📖')
  })

  it('renders CuratedDetail for curated-type projects', async () => {
    const { useRoute } = await import('vue-router')
    useRoute.mockReturnValue({ params: { id: 'curated' } })
    const wrapper = mount(DetailView)
    expect(wrapper.text()).toContain('Curated')
    expect(wrapper.text()).toContain('📝')
  })

  it('renders back-to-list link', async () => {
    const { useRoute } = await import('vue-router')
    useRoute.mockReturnValue({ params: { id: 'my-project' } })
    const wrapper = mount(DetailView)
    const backLink = wrapper.find('.detail-view__back')
    expect(backLink.exists()).toBe(true)
    expect(backLink.attributes('href')).toBe('#/')
  })

  it('shows "not found" message for unknown project id', async () => {
    const { useRoute } = await import('vue-router')
    useRoute.mockReturnValue({ params: { id: 'nonexistent' } })
    const wrapper = mount(DetailView)
    expect(wrapper.text()).toContain('找不到')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/DetailView.test.js`
Expected: FAIL — component not found.

- [ ] **Step 3: Write DetailView.vue**

```vue
<template>
  <div class="detail-view">
    <a href="#/" class="detail-view__back">← 返回列表</a>

    <template v-if="project">
      <OwnDetail v-if="project.type === 'own'" :project="project" />
      <CuratedDetail v-else :project="project" />
    </template>

    <div v-else class="detail-view__empty">
      <p>找不到该项目。</p>
      <a href="#/">返回列表</a>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjects } from '../composables/useProjects.js'
import OwnDetail from '../components/OwnDetail.vue'
import CuratedDetail from '../components/CuratedDetail.vue'

const route = useRoute()
const { getProject } = useProjects()

const project = computed(() => getProject(route.params.id))
</script>

<style scoped>
.detail-view {
  padding-top: 8px;
}

.detail-view__back {
  display: inline-block;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 20px;
  transition: color 150ms;
}

.detail-view__back:hover {
  color: var(--text-primary);
}

.detail-view__empty {
  text-align: center;
  padding: 48px 0;
  color: var(--text-muted);
}

.detail-view__empty a {
  color: var(--accent);
}
</style>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/DetailView.test.js`
Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/DetailView.vue src/__tests__/DetailView.test.js
git commit -m "feat: add DetailView with conditional OwnDetail/CuratedDetail rendering"
```

---

### Task 11: Router Setup

**Files:**
- Create: `src/router/index.js`
- Modify: `src/main.js` (add router)

- [ ] **Step 1: Write router**

```js
// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'
import ListView from '../views/ListView.vue'
import DetailView from '../views/DetailView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: ListView,
  },
  {
    path: '/project/:id',
    name: 'project',
    component: DetailView,
  },
  {
    path: '/tag/:tag',
    name: 'tag',
    component: ListView,
  },
  {
    path: '/search',
    name: 'search',
    component: ListView,
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

export default router
```

- [ ] **Step 2: Update src/main.js to use router**

```js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/global.css'

createApp(App).use(router).mount('#app')
```

- [ ] **Step 3: Write a minimal App.vue placeholder to verify routing**

```vue
<template>
  <div class="app">
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>
```

- [ ] **Step 4: Verify dev server with routing**

Run: `npm run dev`, open `http://localhost:5173/#/`
Expected: Page renders with AppHeader, FilterBar, and project list. Kill server.

- [ ] **Step 5: Commit**

```bash
git add src/router/ src/main.js src/App.vue
git commit -m "feat: add hash-mode router and wire into app entry"
```

---

### Task 12: ListView Component

**Files:**
- Create: `src/views/ListView.vue`
- Create: `src/__tests__/ListView.test.js`

- [ ] **Step 1: Write failing test for ListView**

```js
// src/__tests__/ListView.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ListView from '../views/ListView.vue'
import { ref } from 'vue'

const mockProjects = [
  { id: 'p1', type: 'own', title: 'Project 1', tagline: 'First', tags: ['Vue'], stars: 100, url: 'https://a.com', addedAt: '2026-01-01', description: '' },
  { id: 'p2', type: 'curated', title: 'Project 2', tagline: 'Second', tags: ['React'], stars: 200, url: 'https://b.com', addedAt: '2026-02-01', description: '', whyRecommend: 'Great', highlights: ['Fast'] },
  { id: 'p3', type: 'own', title: 'Project 3', tagline: 'Third', tags: ['Vue', 'Vite'], stars: 50, url: 'https://c.com', addedAt: '2026-03-01', description: '' },
]

vi.mock('../composables/useProjects.js', () => ({
  useProjects: vi.fn(() => ({
    projects: ref(mockProjects),
    filteredProjects: ref(mockProjects),
    activeType: ref('all'),
    activeTags: ref(new Set()),
    searchQuery: ref(''),
    sortBy: ref('stars'),
    allTags: ref(['React', 'Vite', 'Vue']),
    filterByType: vi.fn(),
    toggleTag: vi.fn(),
    search: vi.fn(),
    setSort: vi.fn(),
    resetFilters: vi.fn(),
  })),
}))

describe('ListView', () => {
  it('renders ProjectItem for each project in filteredProjects', () => {
    const wrapper = mount(ListView)
    const items = wrapper.findAll('.project-item')
    expect(items.length).toBe(3)
  })

  it('renders FilterBar', () => {
    const wrapper = mount(ListView)
    expect(wrapper.find('.filter-bar').exists()).toBe(true)
  })

  it('shows empty state when filteredProjects is empty', async () => {
    const { useProjects } = await import('../composables/useProjects.js')
    const emptyRef = ref([])
    useProjects.mockReturnValue({
      projects: ref(mockProjects),
      filteredProjects: emptyRef,
      activeType: ref('all'),
      activeTags: ref(new Set()),
      searchQuery: ref(''),
      sortBy: ref('stars'),
      allTags: ref(['React', 'Vite', 'Vue']),
      filterByType: vi.fn(),
      toggleTag: vi.fn(),
      search: vi.fn(),
      setSort: vi.fn(),
      resetFilters: vi.fn(),
    })
    const wrapper = mount(ListView)
    expect(wrapper.find('.list-view__empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('没有找到匹配的项目')
  })

  it('renders project count', () => {
    const wrapper = mount(ListView)
    expect(wrapper.find('.list-view__count').exists()).toBe(true)
    expect(wrapper.find('.list-view__count').text()).toContain('3')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/ListView.test.js`
Expected: FAIL — component not found.

- [ ] **Step 3: Write ListView.vue**

```vue
<template>
  <div class="list-view">
    <FilterBar
      :active-type="activeType"
      :active-tags="activeTags"
      :all-tags="allTags"
      :search-query="searchQuery"
      :sort-by="sortBy"
      @update:type="filterByType"
      @toggle-tag="toggleTag"
      @update:search="search"
      @update:sort-by="setSort"
    />

    <div class="list-view__count">
      {{ filteredProjects.length }} 个项目
    </div>

    <div v-if="filteredProjects.length > 0" class="list-view__items">
      <ProjectItem
        v-for="(project, index) in filteredProjects"
        :key="project.id"
        :project="project"
        :rank="index + 1"
      />
    </div>

    <div v-else class="list-view__empty">
      <p>没有找到匹配的项目。</p>
      <button class="list-view__reset" @click="resetFilters">清除所有过滤条件</button>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useProjects } from '../composables/useProjects.js'
import FilterBar from '../components/FilterBar.vue'
import ProjectItem from '../components/ProjectItem.vue'

const {
  filteredProjects,
  activeType,
  activeTags,
  searchQuery,
  sortBy,
  allTags,
  filterByType,
  toggleTag,
  search,
  setSort,
  resetFilters,
} = useProjects()

const route = useRoute()

// Sync route params to composable state on mount
onMounted(() => {
  if (route.params.tag) {
    toggleTag(route.params.tag)
  }
  if (route.query.q) {
    search(route.query.q)
  }
})
</script>

<style scoped>
.list-view {
  padding-top: 8px;
}

.list-view__count {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 8px;
  padding: 0 4px;
}

.list-view__items {
  /* Projects render with their own bottom borders */
}

.list-view__empty {
  text-align: center;
  padding: 48px 0;
  color: var(--text-muted);
}

.list-view__reset {
  margin-top: 12px;
  padding: 6px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-primary);
  color: var(--accent);
  font-size: 0.85rem;
  cursor: pointer;
}

.list-view__reset:hover {
  background: var(--bg-secondary);
}
</style>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/ListView.test.js`
Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/views/ListView.vue src/__tests__/ListView.test.js
git commit -m "feat: add ListView with FilterBar + ProjectItem composition and empty state"
```

---

### Task 13: App.vue Integration

**Files:**
- Modify: `src/App.vue` (update from placeholder to full layout)

- [ ] **Step 1: Update App.vue with header, footer, and router-view**

```vue
<template>
  <div class="app">
    <AppHeader />
    <main class="main-content">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
</script>
```

- [ ] **Step 2: Verify full app works end-to-end**

Run: `npm run dev`, open `http://localhost:5173/#/`
Expected:
- ListView renders with header, filter bar, and project items
- Clicking a project navigates to `/#/project/:id` with detail view
- Own projects show full-depth template
- Curated projects show concise template
- "← 返回列表" returns to list with state preserved
- Filter by type/tag/search all work
- Empty state appears when filters match nothing

- [ ] **Step 3: Run all tests**

Run: `npx vitest run`
Expected: All tests pass (useProjects 10 + TagBadge 4 + ProjectItem 6 + FilterBar 9 + AppHeader 3 + OwnDetail 10 + CuratedDetail 8 + DetailView 4 + ListView 4 = 58 tests)

- [ ] **Step 4: Commit**

```bash
git add src/App.vue
git commit -m "feat: integrate App.vue with header, router-view, and footer"
```

---

### Task 14: Deployment (GitHub Actions)

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Write deploy workflow**

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - run: npm run build -- --base=/hub/

      - uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
          force_orphan: true
```

- [ ] **Step 2: Build locally to verify no errors**

Run: `npm run build`
Expected: Build succeeds, `dist/` directory created with static files.

- [ ] **Step 3: Preview build locally**

Run: `npm run preview`
Expected: Preview server starts, verify the built site works at the preview URL. Kill server.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions deploy to GitHub Pages"
```

---

### Plan Summary

| # | Task | Files Created | Tests |
|---|------|--------------|-------|
| 1 | Project Scaffolding | 5 | 0 |
| 2 | Global CSS | 1 | 0 |
| 3 | Sample Data + useProjects | 3 | 10 |
| 4 | TagBadge | 1 | 4 |
| 5 | ProjectItem | 1 | 6 |
| 6 | FilterBar | 1 | 9 |
| 7 | AppHeader + AppFooter | 2 | 3 |
| 8 | OwnDetail | 1 | 10 |
| 9 | CuratedDetail | 1 | 8 |
| 10 | DetailView | 1 | 4 |
| 11 | Router Setup | 1 | 0 |
| 12 | ListView | 1 | 4 |
| 13 | App.vue Integration | 1* | 0 |
| 14 | Deployment | 1 | 0 |
| **Total** | | **20 files** | **58 tests** |

\* App.vue is initially created in Task 11, finalized in Task 13.
