<template>
  <a :href="`#/project/${project.id}`" class="project-card">
    <h3 class="project-card__title">{{ project.title }}</h3>
    <p class="project-card__tagline">{{ project.tagline }}</p>
    <div class="project-card__footer">
      <span class="project-card__stars">⭐ {{ formatStars(project.stars) }}</span>
      <div class="project-card__tags">
        <TagBadge v-for="tag in project.tags" :key="tag" :tag="tag" clickable @tag-click.stop />
      </div>
      <span
        class="project-card__type"
        :class="`project-card__type--${project.type}`"
      >{{ project.type }}</span>
    </div>
  </a>
</template>

<script setup>
import TagBadge from './TagBadge.vue'
import { formatStars } from '../utils/format.js'

defineProps({
  project: { type: Object, required: true },
})
</script>

<style scoped>
.project-card {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  padding: 16px 18px;
  color: var(--text-primary);
  text-decoration: none;
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.07);
  text-decoration: none;
}

.project-card:active {
  transform: scale(0.98);
}

.project-card__title {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 4px;
  font-family: var(--font-sans);
}

.project-card__tagline {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-card__footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  font-size: 0.75rem;
}

.project-card__stars {
  color: var(--text-muted);
  white-space: nowrap;
  flex-shrink: 0;
}

.project-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  flex: 1;
  min-width: 0;
}

.project-card__type {
  font-size: 0.6rem;
  font-weight: 500;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
  white-space: nowrap;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

.project-card__type--own {
  background: rgba(37, 99, 235, 0.1);
  color: var(--accent-own);
}

.project-card__type--curated {
  background: rgba(124, 58, 237, 0.1);
  color: var(--accent-curated);
}
</style>
