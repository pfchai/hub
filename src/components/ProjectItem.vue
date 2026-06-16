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
