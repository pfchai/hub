<template>
  <div class="featured-card">
    <a
      :href="`#/project/${project.id}`"
      class="featured-card__main"
    >
      <div
        class="featured-card__preview"
        :style="{ background: gradientStyle }"
      >
        <h2 class="featured-card__preview-title">{{ project.title }}</h2>
        <div v-if="project.tags && project.tags.length" class="featured-card__preview-tags">
          <span v-for="tag in project.tags" :key="tag" class="featured-card__tag">{{ tag }}</span>
        </div>
      </div>
      <div class="featured-card__body">
        <h3 class="featured-card__title">{{ project.title }}</h3>
        <p class="featured-card__tagline">{{ project.tagline }}</p>
        <div class="featured-card__footer">
          <span class="featured-card__stars">⭐ {{ formatStars(project.stars) }}</span>
          <span
            class="featured-card__type"
            :class="`featured-card__type--${project.type}`"
          >{{ project.type }}</span>
          <span class="featured-card__action">→ 详情</span>
        </div>
      </div>
    </a>
    <a
      v-if="project.deployment && project.deployment.type === 'local'"
      :href="project.deployment.path"
      class="featured-card__live"
    >🌐 直接体验</a>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatStars } from '../utils/format.js'

const props = defineProps({
  project: { type: Object, required: true },
})

const gradientStyle = computed(() => {
  if (props.project.type === 'curated') {
    return 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)'
  }
  return 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
})
</script>

<style scoped>
.featured-card {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  background: var(--bg-card);
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
}

.featured-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.featured-card:active {
  transform: scale(0.98);
}

.featured-card__main {
  display: block;
  color: var(--text-primary);
  text-decoration: none;
}

.featured-card__main:hover {
  text-decoration: none;
}

.featured-card__preview {
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 24px;
  background-size: 120%;
  background-position: center;
  transition: background-position 400ms ease-out;
}

.featured-card:hover .featured-card__preview {
  background-position: 90% 10%;
}

.featured-card__preview-title {
  font-family: var(--font-sans);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #fff;
  line-height: 1.2;
  margin-bottom: 6px;
}

.featured-card__preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.featured-card__tag {
  font-family: var(--font-mono);
  font-size: 0.55rem;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.15);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
}

.featured-card__body {
  padding: 16px 20px 14px;
}

.featured-card__title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
  font-family: var(--font-sans);
}

.featured-card__tagline {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.featured-card__footer {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.75rem;
}

.featured-card__stars {
  color: var(--text-muted);
  white-space: nowrap;
}

.featured-card__type {
  font-size: 0.6rem;
  font-weight: 500;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  white-space: nowrap;
  letter-spacing: 0.04em;
}

.featured-card__type--own {
  background: rgba(37, 99, 235, 0.1);
  color: var(--accent-own);
}

.featured-card__type--curated {
  background: rgba(124, 58, 237, 0.1);
  color: var(--accent-curated);
}

.featured-card__action {
  margin-left: auto;
  font-weight: 500;
  color: var(--accent-own);
  transition: transform 200ms ease-out;
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.featured-card:hover .featured-card__action {
  transform: translateX(3px);
}

.featured-card__live {
  display: block;
  text-align: center;
  padding: 8px 16px 12px;
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--accent-success);
  border-top: 1px solid var(--border);
  text-decoration: none;
  transition: background 150ms;
}

.featured-card__live:hover {
  background: rgba(34, 197, 94, 0.06);
  text-decoration: none;
}
</style>
