<template>
  <a :href="`#/project/${project.id}`" class="project-card">
    <div class="project-card__body">
      <span class="project-card__title">{{ project.title }}</span>
      <span class="project-card__tagline">{{ project.tagline }}</span>
    </div>
    <div class="project-card__footer">
      <span class="project-card__stars">⭐ {{ formatStars(project.stars) }}</span>
      <span class="project-card__tags">
        <TagBadge v-for="tag in project.tags" :key="tag" :tag="tag" clickable @tag-click.stop />
      </span>
      <span class="project-card__type" :class="`project-card__type--${project.type}`">{{
        project.type
      }}</span>
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
  display: block;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--bg-card);
  color: var(--text-primary);
  text-decoration: none;
  transition: transform 0.2s ease-out, box-shadow 0.2s ease-out;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  text-decoration: none;
}

.project-card:active {
  transform: scale(0.98);
}

.project-card__body {
  margin-bottom: 10px;
}

.project-card__title {
  display: block;
  font-weight: 600;
  font-size: 0.95rem;
  margin-bottom: 2px;
  color: var(--text-primary);
}

.project-card__tagline {
  display: block;
  color: var(--text-muted);
  font-size: 0.82rem;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-card__footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-card__stars {
  font-size: 0.78rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.project-card__tags {
  display: inline-flex;
  gap: 4px;
  flex-wrap: nowrap;
  overflow: hidden;
}

.project-card__type {
  margin-left: auto;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: var(--radius);
  white-space: nowrap;
  color: #fff;
}

.project-card__type--own {
  background: var(--accent-own);
}

.project-card__type--curated {
  background: var(--accent-curated);
}
</style>
