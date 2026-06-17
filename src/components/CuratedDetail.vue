<template>
  <article>
    <!-- Hero gradient -->
    <div
      class="detail__hero"
      :style="{ background: gradientStyle }"
    >
      <h1 class="detail__hero-title">{{ project.title }}</h1>
      <p class="detail__hero-tagline">{{ project.tagline }}</p>
    </div>

    <div class="detail__body">
      <a href="#/" class="detail__back">← Back to projects</a>

      <a
        :href="project.url"
        target="_blank"
        rel="noopener"
        class="detail__source"
      >
        <span class="detail__source-icon">⌘</span>
        <span class="detail__source-label">GitHub</span>
        <span class="detail__source-url">{{ cleanUrl(project.url) }}</span>
        <span class="detail__source-arrow">→</span>
      </a>

      <div class="detail__content">
        <!-- Main content column -->
        <div class="detail__main">
          <section class="detail__section">
            <h2 class="detail__section-title">项目简介</h2>
            <p class="detail__description">{{ project.description }}</p>
          </section>

          <section v-if="project.whyRecommend" class="detail__section">
            <h2 class="detail__section-title">推荐理由</h2>
            <p class="detail__recommendation">{{ project.whyRecommend }}</p>
          </section>

          <section v-if="project.highlights?.length" class="detail__section">
            <h2 class="detail__section-title">技术亮点</h2>
            <ul class="detail__highlights">
              <li v-for="(h, i) in project.highlights" :key="i">{{ h }}</li>
            </ul>
          </section>

          <section v-if="project.deployment" class="detail__section detail__deployment">
            <h2 class="detail__section-title">
              <template v-if="project.deployment.type === 'local'">部署 · {{ project.deployment.label }}</template>
              <template v-else>在线体验 · {{ project.deployment.label }}</template>
            </h2>
            <p class="detail__deploy-date">部署于 {{ project.deployment.deployedAt }}</p>

            <template v-if="project.deployment.type === 'local'">
              <a :href="project.deployment.path" class="detail__deploy-link"
                >打开 {{ project.deployment.label }} →</a
              >
            </template>

            <template v-else>
              <div class="detail__iframe-card">
                <div class="detail__iframe-bar">
                  <span class="detail__iframe-url">{{ project.deployment.url }}</span>
                  <a
                    :href="project.deployment.url"
                    target="_blank"
                    rel="noopener"
                    class="detail__iframe-ext"
                    >↗</a
                  >
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
        </div>

        <!-- Sidebar -->
        <aside class="detail__sidebar">
          <div class="sidebar__block">
            <span class="sidebar__label">Stars</span>
            <span class="sidebar__value">{{ formatStars(project.stars) }}</span>
          </div>

          <div class="sidebar__block">
            <span class="sidebar__label">Type</span>
            <span
              class="sidebar__type-badge"
              :class="`sidebar__type-badge--${project.type}`"
            >{{ project.type }}</span>
          </div>

          <div v-if="project.tags?.length" class="sidebar__block">
            <span class="sidebar__label">Tags</span>
            <div class="sidebar__tags">
              <span v-for="tag in project.tags" :key="tag" class="sidebar__tag">{{ tag }}</span>
            </div>
          </div>

          <div class="sidebar__block">
            <span class="sidebar__label">Links</span>
            <div class="sidebar__links">
              <a :href="project.url" target="_blank" rel="noopener" class="sidebar__link">GitHub</a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  project: { type: Object, required: true },
})

const gradientStyle = computed(() => {
  if (props.project.type === 'curated') {
    return 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)'
  }
  return 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
})

function cleanUrl(url) {
  return url.replace(/^https?:\/\//, '')
}

function formatStars(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return String(n)
}
</script>

<style scoped>
/* ===== Hero ===== */
.detail__hero {
  height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 24px;
  border-radius: var(--radius) var(--radius) 0 0;
  margin-bottom: 0;
}

.detail__hero-title {
  font-family: var(--font-sans);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 4px;
}

.detail__hero-tagline {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

/* ===== Body layout ===== */
.detail__body {
  padding-top: 24px;
}

.detail__back {
  display: inline-block;
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 20px;
  transition: color 150ms;
}

.detail__back:hover {
  color: var(--text-primary);
  text-decoration: none;
}

/* ===== Source link (GitHub) ===== */
.detail__source {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin-bottom: 24px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  color: var(--text-primary);
  text-decoration: none;
  font-size: 0.85rem;
  transition: background 150ms, border-color 150ms;
}

.detail__source:hover {
  background: var(--bg-card);
  border-color: var(--accent-curated);
  text-decoration: none;
}

.detail__source-icon {
  font-size: 1rem;
}

.detail__source-label {
  font-weight: 600;
  white-space: nowrap;
}

.detail__source-url {
  flex: 1;
  text-align: right;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail__source-arrow {
  font-weight: 500;
  color: var(--text-muted);
  transition: transform 150ms, color 150ms;
}

.detail__source:hover .detail__source-arrow {
  transform: translateX(2px);
  color: var(--accent-curated);
}

.detail__content {
  display: flex;
  gap: 28px;
}

.detail__main {
  flex: 1;
  min-width: 0;
}

.detail__sidebar {
  width: 140px;
  flex-shrink: 0;
  position: sticky;
  top: 24px;
  align-self: flex-start;
  font-family: var(--font-sans);
  font-size: 10px;
  line-height: 2;
}

/* ===== Sections ===== */
.detail__section {
  margin-bottom: 32px;
}

.detail__section-title {
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-label);
  color: var(--text-subtle);
  margin-bottom: 12px;
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
  padding: 12px 16px;
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
  content: '· ';
  color: var(--accent-curated);
  font-weight: bold;
}

/* ===== Deployment ===== */
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
  font-family: 'JetBrains Mono', monospace;
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

/* ===== Sidebar ===== */
.sidebar__block {
  margin-bottom: 20px;
}

.sidebar__label {
  display: block;
  color: var(--text-subtle);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-label);
  font-weight: 600;
  font-size: 10px;
  margin-bottom: 2px;
}

.sidebar__value {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}

.sidebar__type-badge {
  display: inline-block;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
}

.sidebar__type-badge--own {
  background: rgba(37, 99, 235, 0.1);
  color: var(--accent-own);
}

.sidebar__type-badge--curated {
  background: rgba(124, 58, 237, 0.1);
  color: var(--accent-curated);
}

.sidebar__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.sidebar__tag {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 9px;
  background: var(--text-primary);
  color: var(--bg-primary);
  padding: 3px 8px;
  border-radius: 4px;
}

.sidebar__links {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sidebar__link {
  font-size: 10px;
  color: var(--accent-own);
  text-decoration: none;
}

.sidebar__link:hover {
  text-decoration: underline;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .detail__content {
    flex-direction: column;
  }

  .detail__sidebar {
    width: 100%;
    position: static;
  }

  .detail__hero {
    height: 130px;
    padding: 0 16px;
  }

  .detail__hero-title {
    font-size: 22px;
  }
}
</style>
