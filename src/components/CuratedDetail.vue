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
