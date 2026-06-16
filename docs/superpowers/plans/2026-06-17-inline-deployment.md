# Inline Project Deployment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add deployment metadata to projects.json and update ProjectItem, CuratedDetail, and OwnDetail components to show deployment badges, iframe embeds, and local project links.

**Architecture:** A new optional `deployment` field in projects.json (type + path/url + metadata). ProjectItem shows a small colored badge in the list row. CuratedDetail and OwnDetail render a deployment section after existing content — either a local link or an iframe embed card with sandboxed iframe.

**Tech Stack:** Vue 3 (existing), no new dependencies.

---

### Task 1: Update projects.json with deployment fields

**Files:**
- Modify: `src/data/projects.json`

- [ ] **Step 1: Add deployment to HowToCook**

Read the file, find `"id": "how-to-cook"`. Add `deployment` after `addedAt`:

```json
  "addedAt": "2026-06-16",
  "deployment": {
    "type": "local",
    "path": "/how-to-cook",
    "deployedAt": "2026-06-17",
    "label": "做饭指南"
  },
```

Find the existing `addedAt` line for how-to-cook. After the `"addedAt": "2026-06-16",` line, insert the deployment block. Then add a comma after the preceding line and make the syntax valid.

The how-to-cook entry currently has this structure:
```
"addedAt": "2026-06-16",
"whyRecommend": "...",
...
```

Insert deployment after `addedAt` (or after the closing `}` of the whyRecommend/highlights block). Actually, place it right after `addedAt` for consistency:

```json
    "url": "https://github.com/Anduin2017/HowToCook",
    "addedAt": "2026-06-16",
    "deployment": {
      "type": "local",
      "path": "/how-to-cook",
      "deployedAt": "2026-06-17",
      "label": "做饭指南"
    },
    "whyRecommend": "最有趣的开源项目之一。用工程师思维解决日常问题，堪称程序员生活手册的标杆。",
```

- [ ] **Step 2: Add deployment to Gift Book**

Similarly for gift-book entry. After `addedAt`:

```json
    "url": "https://github.com/jingguanzhang/gift-book",
    "addedAt": "2026-06-16",
    "deployment": {
      "type": "local",
      "path": "/gift-book",
      "deployedAt": "2026-06-17",
      "label": "电子礼簿"
    },
    "whyRecommend": "接地气的实用工具，解决真实痛点。界面简洁，完全离线可用，适合不熟悉技术的用户。",
```

- [ ] **Step 3: Add deployment to Excalidraw**

For excalidraw entry. After `addedAt`:

```json
    "url": "https://github.com/excalidraw/excalidraw",
    "addedAt": "2026-01-10",
    "deployment": {
      "type": "iframe",
      "url": "https://excalidraw.com",
      "deployedAt": "2026-06-17",
      "label": "在线白板"
    },
    "whyRecommend": "最好的开源白板工具之一，API 设计优雅，扩展性强，是学习 React + Canvas 的绝佳参考项目。",
```

- [ ] **Step 4: Add deployment to Slidev**

For slidev entry. After `addedAt`:

```json
    "url": "https://github.com/slidevjs/slidev",
    "addedAt": "2026-03-01",
    "deployment": {
      "type": "iframe",
      "url": "https://sli.dev",
      "deployedAt": "2026-06-17",
      "label": "演示文稿"
    },
    "whyRecommend": "彻底改变了开发者做技术分享的方式。PPT 变成了可版本控制、可复用的代码。",
```

- [ ] **Step 5: Validate JSON**

```bash
python3 -c "import json; json.load(open('src/data/projects.json')); print('JSON valid')"
```

- [ ] **Step 6: Commit**

```bash
git add src/data/projects.json
git commit -m "feat: add deployment metadata to 4 curated projects"
```

---

### Task 2: ProjectItem.vue — Deployment Badge

**Files:**
- Modify: `src/components/ProjectItem.vue`
- Modify: `src/__tests__/ProjectItem.test.js`

- [ ] **Step 1: Write failing tests for deployment badge**

In `src/__tests__/ProjectItem.test.js`, add two tests after the existing test block, inside the `describe`:

```js
  it('renders deployment badge for local deployment', () => {
    const projectWithLocal = {
      ...mockOwnProject,
      deployment: { type: 'local', path: '/test', deployedAt: '2026-06-17', label: '测试工具' },
    }
    const wrapper = mount(ProjectItem, {
      props: { project: projectWithLocal, rank: 1 }
    })
    const badge = wrapper.find('.project-item__deploy')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toContain('测试工具')
    expect(badge.classes()).toContain('project-item__deploy--local')
  })

  it('renders deployment badge for iframe deployment', () => {
    const projectWithIframe = {
      ...mockOwnProject,
      deployment: { type: 'iframe', url: 'https://example.com', deployedAt: '2026-06-17', label: '在线体验' },
    }
    const wrapper = mount(ProjectItem, {
      props: { project: projectWithIframe, rank: 1 }
    })
    const badge = wrapper.find('.project-item__deploy')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toContain('在线体验')
    expect(badge.classes()).toContain('project-item__deploy--iframe')
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/ProjectItem.test.js`
Expected: 2 new tests FAIL — badge element not found.

- [ ] **Step 3: Add deployment badge to ProjectItem.vue template**

In `ProjectItem.vue`, add the deployment badge in the `project-item__meta` div, BETWEEN the stars span and the type badge span:

```vue
      <span class="project-item__stars">⭐ {{ formatStars(project.stars) }}</span>
      <span
        v-if="project.deployment"
        class="project-item__deploy"
        :class="`project-item__deploy--${project.deployment.type}`"
      >{{ project.deployment.type === 'local' ? '🏠 ' : '🌐 ' }}{{ project.deployment.label }}</span>
      <span
        class="project-item__type"
```

- [ ] **Step 4: Add CSS for deployment badge**

In the `<style scoped>` section of `ProjectItem.vue`, add after `project-item__stars` styles:

```css
.project-item__deploy {
  font-size: 0.65rem;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.project-item__deploy--local {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.project-item__deploy--iframe {
  background: rgba(124, 58, 237, 0.1);
  color: var(--accent-curated);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/ProjectItem.test.js`
Expected: All 8 tests PASS (6 existing + 2 new).

- [ ] **Step 6: Commit**

```bash
git add src/components/ProjectItem.vue src/__tests__/ProjectItem.test.js
git commit -m "feat: add deployment badge to ProjectItem list row"
```

---

### Task 3: CuratedDetail.vue — Deployment Section

**Files:**
- Modify: `src/components/CuratedDetail.vue`
- Modify: `src/__tests__/CuratedDetail.test.js`

- [ ] **Step 1: Write failing tests for deployment section**

In `src/__tests__/CuratedDetail.test.js`, add two tests inside the describe block:

```js
  it('renders iframe deployment section for iframe-type deployment', () => {
    const projectWithIframe = {
      ...mockProject,
      deployment: { type: 'iframe', url: 'https://example.com', deployedAt: '2026-06-17', label: '在线体验' },
    }
    const wrapper = mount(CuratedDetail, { props: { project: projectWithIframe } })
    const section = wrapper.find('.detail__deployment')
    expect(section.exists()).toBe(true)
    expect(section.text()).toContain('在线体验')
    expect(section.text()).toContain('2026-06-17')
    expect(wrapper.find('.detail__iframe').exists()).toBe(true)
  })

  it('renders local deployment link for local-type deployment', () => {
    const projectWithLocal = {
      ...mockProject,
      deployment: { type: 'local', path: '/test-tool', deployedAt: '2026-06-17', label: '测试工具' },
    }
    const wrapper = mount(CuratedDetail, { props: { project: projectWithLocal } })
    const section = wrapper.find('.detail__deployment')
    expect(section.exists()).toBe(true)
    const link = wrapper.find('.detail__deploy-link')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('/test-tool')
    expect(link.text()).toContain('测试工具')
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/CuratedDetail.test.js`
Expected: 2 new tests FAIL.

- [ ] **Step 3: Add deployment section to CuratedDetail.vue template**

In `CuratedDetail.vue`, add AFTER the highlights section and BEFORE the closing `</article>`. Insert this block:

```vue
    <section v-if="project.deployment" class="detail__section detail__deployment">
      <h2 v-if="project.deployment.type === 'local'">🏠 已部署 · {{ project.deployment.label }}</h2>
      <h2 v-else>🌐 在线体验 · {{ project.deployment.label }}</h2>
      <p class="detail__deploy-date">部署于 {{ project.deployment.deployedAt }}</p>

      <template v-if="project.deployment.type === 'local'">
        <a
          :href="project.deployment.path"
          class="detail__deploy-link"
        >📖 打开 {{ project.deployment.label }} →</a>
      </template>

      <template v-else>
        <div class="detail__iframe-card">
          <div class="detail__iframe-bar">
            <span class="detail__iframe-url">{{ project.deployment.url }}</span>
            <a :href="project.deployment.url" target="_blank" rel="noopener" class="detail__iframe-ext">↗</a>
          </div>
          <iframe
            :src="project.deployment.url"
            class="detail__iframe"
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
            allowfullscreen
          ></iframe>
        </div>
      </template>
    </section>
```

- [ ] **Step 4: Add CSS for deployment section**

In the `<style scoped>` of `CuratedDetail.vue`, add at the end:

```css
.detail__deploy-date {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.detail__deploy-link {
  display: inline-block;
  padding: 8px 20px;
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: background 150ms;
}

.detail__deploy-link:hover {
  background: rgba(34, 197, 94, 0.2);
  text-decoration: none;
}

.detail__iframe-card {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.detail__iframe-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.detail__iframe-url {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: "JetBrains Mono", monospace;
}

.detail__iframe-ext {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-decoration: none;
}

.detail__iframe-ext:hover {
  color: var(--accent);
}

.detail__iframe {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  border: none;
  background: #fff;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/CuratedDetail.test.js`
Expected: All 10 tests PASS (8 existing + 2 new).

- [ ] **Step 6: Commit**

```bash
git add src/components/CuratedDetail.vue src/__tests__/CuratedDetail.test.js
git commit -m "feat: add deployment section to CuratedDetail with iframe/local support"
```

---

### Task 4: OwnDetail.vue — Deployment Section

**Files:**
- Modify: `src/components/OwnDetail.vue`
- Modify: `src/__tests__/OwnDetail.test.js`

- [ ] **Step 1: Write failing tests**

In `src/__tests__/OwnDetail.test.js`, add two tests:

```js
  it('renders local deployment link when project has local deployment', () => {
    const projectWithLocal = {
      ...mockProject,
      deployment: { type: 'local', path: '/my-tool', deployedAt: '2026-06-17', label: '我的工具' },
    }
    const wrapper = mount(OwnDetail, { props: { project: projectWithLocal } })
    const section = wrapper.find('.detail__deployment')
    expect(section.exists()).toBe(true)
    expect(section.text()).toContain('我的工具')
    expect(wrapper.find('.detail__deploy-link').attributes('href')).toBe('/my-tool')
  })

  it('renders iframe for iframe-type deployment', () => {
    const projectWithIframe = {
      ...mockProject,
      deployment: { type: 'iframe', url: 'https://example.com', deployedAt: '2026-06-17', label: '在线工具' },
    }
    const wrapper = mount(OwnDetail, { props: { project: projectWithIframe } })
    expect(wrapper.find('.detail__iframe').exists()).toBe(true)
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/OwnDetail.test.js`
Expected: 2 new tests FAIL.

- [ ] **Step 3: Add deployment section to OwnDetail.vue template**

Same template code as CuratedDetail Task 3 Step 3. Add AFTER the lessons section and BEFORE `</article>`:

```vue
    <section v-if="project.deployment" class="detail__section detail__deployment">
      <h2 v-if="project.deployment.type === 'local'">🏠 已部署 · {{ project.deployment.label }}</h2>
      <h2 v-else>🌐 在线体验 · {{ project.deployment.label }}</h2>
      <p class="detail__deploy-date">部署于 {{ project.deployment.deployedAt }}</p>

      <template v-if="project.deployment.type === 'local'">
        <a
          :href="project.deployment.path"
          class="detail__deploy-link"
        >📖 打开 {{ project.deployment.label }} →</a>
      </template>

      <template v-else>
        <div class="detail__iframe-card">
          <div class="detail__iframe-bar">
            <span class="detail__iframe-url">{{ project.deployment.url }}</span>
            <a :href="project.deployment.url" target="_blank" rel="noopener" class="detail__iframe-ext">↗</a>
          </div>
          <iframe
            :src="project.deployment.url"
            class="detail__iframe"
            sandbox="allow-scripts allow-same-origin"
            loading="lazy"
            allowfullscreen
          ></iframe>
        </div>
      </template>
    </section>
```

- [ ] **Step 4: Add CSS for deployment section**

Add the SAME CSS as in Task 3 Step 4 to `OwnDetail.vue`'s `<style scoped>`:

```css
.detail__deploy-date {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.detail__deploy-link {
  display: inline-block;
  padding: 8px 20px;
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: background 150ms;
}

.detail__deploy-link:hover {
  background: rgba(34, 197, 94, 0.2);
  text-decoration: none;
}

.detail__iframe-card {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.detail__iframe-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border);
}

.detail__iframe-url {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-family: "JetBrains Mono", monospace;
}

.detail__iframe-ext {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-decoration: none;
}

.detail__iframe-ext:hover {
  color: var(--accent);
}

.detail__iframe {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  border: none;
  background: #fff;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run src/__tests__/OwnDetail.test.js`
Expected: All 12 tests PASS (10 existing + 2 new).

- [ ] **Step 6: Commit**

```bash
git add src/components/OwnDetail.vue src/__tests__/OwnDetail.test.js
git commit -m "feat: add deployment section to OwnDetail with iframe/local support"
```

---

### Task 5: Build Script & Local Project Files

**Files:**
- Create: `scripts/deploy-local.sh`

- [ ] **Step 1: Create scripts/deploy-local.sh**

```bash
#!/bin/bash
set -e
cd "$(dirname "$0")/.."

# HowToCook — 程序员在家做饭指南
if [ ! -d "public/how-to-cook" ]; then
  echo "Cloning HowToCook..."
  git clone --depth 1 https://github.com/Anduin2017/HowToCook.git /tmp/HowToCook
  cp -r /tmp/HowToCook public/how-to-cook/
  rm -rf /tmp/HowToCook
  echo "  Done: public/how-to-cook/"
else
  echo "  Skip: public/how-to-cook/ already exists"
fi

# Gift Book — 电子礼簿
if [ ! -d "public/gift-book" ]; then
  echo "Cloning Gift Book..."
  git clone --depth 1 https://github.com/jingguanzhang/gift-book.git /tmp/gift-book
  cp -r /tmp/gift-book public/gift-book/
  rm -rf /tmp/gift-book
  echo "  Done: public/gift-book/"
else
  echo "  Skip: public/gift-book/ already exists"
fi

echo "Done."
```

- [ ] **Step 2: Make script executable and run it**

```bash
chmod +x scripts/deploy-local.sh
bash scripts/deploy-local.sh
```

Expected: Two repos cloned, copied to `public/how-to-cook/` and `public/gift-book/`.

- [ ] **Step 3: Build and verify local files are served**

```bash
npm run build
ls dist/how-to-cook/  | head -5
ls dist/gift-book/  | head -5
```

Expected: Both directories exist in `dist/` with their static files.

- [ ] **Step 4: Commit**

```bash
git add scripts/deploy-local.sh public/how-to-cook/ public/gift-book/
git commit -m "feat: add deploy-local script and cloned static projects"
```

---

### Task 6: Final Verification

**Files:**
- None (verification only)

- [ ] **Step 1: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass. Current count should be 59 + 6 = 65 tests across 9 files.

- [ ] **Step 2: Build for production**

Run: `npm run build`
Expected: Build succeeds, `dist/` contains all assets plus `how-to-cook/` and `gift-book/` subdirectories.

- [ ] **Step 3: Commit any remaining changes**

```bash
git status
# Only commit if there are any uncommitted changes
```

- [ ] **Step 4: Push**

```bash
git push
```
