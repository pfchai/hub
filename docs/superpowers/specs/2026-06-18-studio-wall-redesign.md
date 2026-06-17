# Studio Wall Redesign

**Date:** 2026-06-18
**Status:** Approved
**Design ethos:** 工作室墙 + 技术杂志编辑品味 — 像走进一个人的工作间，有视觉冲击也有编辑态度。

## Goals

将 hub 从"功能性的 HN 风格列表"升级为有情感温度和个人辨识度的项目展示网站。核心理念：**热情向导的人格 + 杂志的排版讲究 + 工作室墙的视觉呈现**。

### Non-goals
- 不改动数据模型 (`projects.json` 结构不变)
- 不引入后端或 CMS
- 不增加外部分析/追踪
- 不做分页或无限滚动

---

## 1. Layout & Information Architecture

### Homepage (ListView)

```
┌────────────────────────────────────────────┐
│ HEADER: logo · nav · search (⌘K)            │
├────────────────────────────────────────────┤
│                                            │
│  FEATURED (2 张精选大卡片，渐变预览区)        │
│  ┌──────────────┐  ┌──────────────┐        │
│  │ 渐变背景      │  │ 渐变背景      │        │
│  │ 标题大字      │  │ 标题大字      │        │
│  │ 标签文字      │  │ 标签文字      │        │
│  │ 描述 + type   │  │ 描述 + type   │        │
│  └──────────────┘  └──────────────┘        │
│                                            │
│  ── 所有项目 (21) ── 分割线 + 计数          │
│                                            │
│  FILTER: pill 形态 inline                   │
│  [全部] [Own] [Curated]    [⭐ Stars ↓]     │
│                                            │
│  GRID (2 列卡片网格)                        │
│  ┌─────────┐ ┌─────────┐                  │
│  │ 标题     │ │ 标题     │                  │
│  │ 描述     │ │ 描述     │                  │
│  │ ⭐ + 标签 │ │ ⭐ + 标签 │                  │
│  └─────────┘ └─────────┘                  │
│  ...                                       │
│                                            │
├────────────────────────────────────────────┤
│ FOOTER: 个人介绍 + 社交链接 + 版权            │
└────────────────────────────────────────────┘
```

### Detail Page (DetailView)

```
┌────────────────────────────────────────────┐
│ 渐变 HERO 区 (全宽，项目标题 + 副标题)         │
├────────────────────────────────────────────┤
│  ← Back to projects                       │
│                                            │
│  MAIN (flex: 1)         │  SIDEBAR (140px)  │
│  背景故事                │  Stars            │
│  技术选型                │  Type             │
│  截图                   │  Tags             │
│  心得教训                │  Links            │
│  iframe 部署             │  (sticky)         │
└────────────────────────────────────────────┘
```

### Key Layout Changes

| Before | After |
|--------|-------|
| Max-width 720px single column | Max-width 960px, 2-column grid for cards |
| HN-style numbered list | Featured gradient cards + 2-column card grid |
| Filter bar as top section | Lightweight inline pill filters after featured |
| Detail page vertical stack | Hero gradient + 2-column (main/sidebar) |
| No hero/vibe element | Gradient hero on detail page |
| "Built with Vue + Vite" footer | Personal intro footer |

### Selection Logic
- **Featured projects:** 取 `projects.json` 中前 2 个标记了 `featured: true` 的项目。如果没有 featured 标记，取 `stars` 最高的 1 个 own + 1 个 curated。
- **Featured 卡片的渐变:** 根据 `project.type` 和 `project.tags` 生成色系。own → 蓝紫系；curated → 紫粉系。

---

## 2. Design Tokens

### Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `'Inter', -apple-system, sans-serif` | 所有文本 |
| `--font-mono` | `'JetBrains Mono', monospace` | 代码、标签 |
| `--font-size-base` | `15px` (↑ from 14px) | Body text |
| `--font-weight-headline` | `800` | Featured titles, H1 |
| `--font-weight-body` | `400`–`500` | Body, captions |
| `--letter-spacing-headline` | `-0.02em`–`-0.03em` | H1, featured cards |
| `--letter-spacing-label` | `+0.05em`–`+0.06em` | Section labels |

Hierarchy:
- **H1 / Display:** Inter 800, 22-26px, `-0.03em`
- **H2 / Section:** Inter 600, 10px, uppercase, `+0.06em`, color: muted
- **Body:** Inter 400-500, 11-13px, line-height 1.7-1.8
- **Code / Tags:** JetBrains Mono, 8-10px

### Color — Light Mode

| CSS Variable | Value | Usage |
|-------------|-------|-------|
| `--bg-primary` | `#fafaf9` | Page background (warm off-white) |
| `--bg-secondary` | `#f5f3ef` | Card backgrounds, code blocks, hover states |
| `--bg-card` | `#ffffff` | Card surfaces |
| `--text-primary` | `#1c1917` | Headings, body text (warm almost-black) |
| `--text-muted` | `#78716c` | Secondary text, captions (warm gray) |
| `--text-subtle` | `#a8a29e` | Labels, placeholders |
| `--border` | `#e7e5e4` | Borders, dividers (warm gray) |
| `--accent-own` | `#2563eb` | Own projects accent |
| `--accent-curated` | `#7c3aed` | Curated projects accent |
| `--accent-success` | `#16a34a` | Deploy/local badges |
| `--radius` | `8px`–`12px` (cards), `999px` (pills) | Border radius |

### Color — Dark Mode

Deep warm brown-black, like a desk lamp on a notebook at night.

| CSS Variable | Value | Usage |
|-------------|-------|-------|
| `--bg-primary` | `#1a1815` | Page background |
| `--bg-secondary` | `#24211d` | Card backgrounds |
| `--bg-card` | `#2a2723` | Card surfaces |
| `--text-primary` | `#e8e2d4` | Headings, body (warm light) |
| `--text-muted` | `#a69885` | Secondary text |
| `--text-subtle` | `#7a6e5e` | Labels, placeholders |
| `--border` | `#3a3530` | Borders |

### Gradient Generation for Featured Cards

- **Own type:** `linear-gradient(135deg, #2563eb, #7c3aed)` (blue → purple)
- **Curated type:** `linear-gradient(135deg, #7c3aed, #db2777)` (purple → pink)
- **Variation:** 每个卡片微调 hue 角度 (±10°) 确保视觉差异

---

## 3. Component Changes

### 3.1 AppHeader.vue
- Logo: "Hub" → "Hub." (serif 或 Inter 800, 加粗)
- 导航: "Home" + "About" (目前只有一个，加 About 链接)
- 搜索: 从 input 变成 ⌘K 小触发按钮（点击展开搜索面板或弹窗）

### 3.2 ListView.vue
- 新增 FeaturedSection: 渲染前 2 张大卡片
- 原 FilterBar 降级为 inline pill (不再是顶部焦点)
- 原单列 ProjectItem 替换为双列卡片网格
- 添加 "所有项目" 分割线 + 计数

### 3.3 ProjectItem.vue → ProjectCard.vue
- 从行式编号列表项 → 卡片组件
- 不再显示编号
- 卡片结构: 标题 → 描述（一行截断） → 底部 (stars + tags + type badge)
- Hover: `translateY(-2px)` + `box-shadow` 提升

### 3.4 FeaturedCard.vue (新组件)
- 大尺寸卡片，顶部渐变预览区（120px+ 高）
- 预览区内: 项目标题大字 (Inter 800, 22px) + 标签文字
- 预览区下: 标题(再次) + 编辑描述 + stars + type badge + "查看 →"
- Hover: 渐变背景位置微移 (background-position shift)

### 3.5 FilterBar.vue
- 重新设计为单行 inline pill
- 布局: `[全部] [Own] [Curated] — flex spacer — [sort toggle]`
- 搜索框合并到 header 的 ⌘K 按钮 (点击展开搜索 popover)
- Tag 筛选 pill 移除。理由: 每个卡片已显示标签可扫描；点击标签仍可通过 URL 路由过滤 (`#/tag/vue`)；简化视觉负担

### 3.6 OwnDetail.vue & CuratedDetail.vue
- 顶部新增 HeroGradient 区 (全宽渐变，标题 + 副标题)
- 正文区改为 flex row: 主文 (flex:1) + 侧边栏 (140px, sticky)
- 章节标题从 `📖 背景故事` → `背景故事` (uppercase label, no emoji)
- 标签从浅色 pill → 黑底白字 pill (有编辑态)
- 技术选型列表增加视觉分隔和加粗 key

### 3.7 AppFooter.vue
- 从 "Built with Vue + Vite · Curated by hand" → 三段式:
  1. 一行个人介绍: "👋 我是 pfchai — 写代码，也挑好东西。"
  2. 社交链接: GitHub · Twitter · Blog · RSS
  3. 版权: "© 2026 Hub. 手动策展，自动部署。"

---

## 4. Motion & Transitions

选用 **表达性动效** (B)。

### Page Transitions
- 列表 ↔ 详情: `<RouterView>` wrap with Vue `<Transition>`, fade 300ms + slide-up 200ms
- 筛选/排序变化: FLIP 列表动画 (使用 `v-move` + `transition-group`)

### Card Interactions
- **Hover lift:** `transform: translateY(-2px)` + `box-shadow` 提升, transition 200ms ease-out
- **Featured card hover:** 渐变 `background-position` 轻微移动 (parallax feel)
- **Click/tap:** `scale(0.98)` momentary press feedback

### Scroll Reveal
- 卡片 staggered reveal: `IntersectionObserver` + `translateY(20px)` → `translateY(0)` fade-in
- 每个卡片延迟 `index * 50ms`
- 只在首次可见时触发 (once: true)

### Implementation Notes
- 纯 CSS `transition` + Vue `<TransitionGroup>` 搞定 90%
- FLIP 用 `v-move` 自带，不需要额外库
- Scroll reveal 用 `IntersectionObserver` (无依赖)

---

## 5. Responsive Strategy

### Breakpoints
| Breakpoint | Layout |
|-----------|--------|
| ≥ 768px | 2-column grid, sidebar visible |
| < 768px | 1-column grid, sidebar below main |

### Mobile (< 768px)
- Featured cards 从双列 → 单列堆叠
- 双列网格 → 单列全宽卡片
- 详情页 sidebar → 放到主文下方，不再 sticky
- Filter pills 可能折行
- Header 导航压缩

### Tablet (768px–960px)
- 保持双列但卡片间距减小
- 详情页 sidebar 宽度缩小

---

## 6. Implementation Order

### Phase 1: Foundation (tokens + layout)
1. Update `global.css` — new CSS variables, Inter font loading
2. Update `App.vue` — wider container (960px)
3. Redesign `AppHeader.vue`
4. Redesign `AppFooter.vue`

### Phase 2: Homepage
5. Create `FeaturedCard.vue`
6. Refactor `ProjectItem.vue` → `ProjectCard.vue`
7. Rework `FilterBar.vue` → inline pills
8. Rework `ListView.vue` — feature section + card grid

### Phase 3: Detail pages
9. Refactor `OwnDetail.vue` — hero + sidebar layout
10. Refactor `CuratedDetail.vue` — hero + sidebar layout

### Phase 4: Motion
11. Add page transitions (Vue `<Transition>`)
12. Add card hover/click animations
13. Add scroll reveal (IntersectionObserver)

### Phase 5: Polish
14. Dark mode variants
15. Mobile QA and refinements
16. Update tests

---

## 7. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| 渐变生成算法产生不美观组合 | 预设 6-8 个已知好看的渐变，按 tag hash 分配 |
| Inter 字体加载 FOIT/FOUT | 使用 `font-display: swap` + 本地 fallback |
| FLIP 动画在低端设备卡顿 | `prefers-reduced-motion` 检测，关闭动效 |
| 双列网格在项目数奇数时不对称 | CSS Grid auto-fill，最后一张自然占满或留空 |
| 精选卡片需要视觉资产 | 抽象渐变方案不依赖截图，无外部资产需求 |

---

## 8. Design Sources

### Visual References
- 渐变卡片: Apple App Store "Today" tab, Linear changelog
- 排版: Linear blog, The Browser Company design
- 动效: Vercel dashboard transitions, Stripe docs
- 暖色调: Linear.app, Raycast website

### Typography
- Inter: Google Fonts (https://fonts.google.com/specimen/Inter)
- JetBrains Mono: Google Fonts (https://fonts.google.com/specimen/JetBrains+Mono)

---

## Appendix: Before / After Summary

| Aspect | Before | After |
|--------|--------|-------|
| First impression | Filter bar | 2 gradient featured cards |
| List style | HN-numbered single column | 2-column card grid |
| Container | 720px | 960px |
| Font | System defaults | Inter + JetBrains Mono |
| Base size | 14px | 15px |
| Color temp | Cold gray blue | Warm stone brown |
| Detail layout | Vertical stack | Hero + main/sidebar |
| Tags | Light pill | Black pill (edit attitude) |
| Footer | Dev-speak | Personal intro |
| Motion | None | FLIP + hover lift + scroll reveal |
| Dark mode | `#0f0f23` cold dark | `#1a1815` warm dark |
