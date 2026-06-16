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
</style>
