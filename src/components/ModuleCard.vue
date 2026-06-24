<template>
  <a
    :href="`#/m/${module.id}`"
    class="module-card"
    :style="{ '--module-color': module.color, '--module-color-dim': moduleDimColor }"
  >
    <div class="module-card__accent"></div>
    <div class="module-card__body">
      <span class="module-card__icon">{{ module.icon }}</span>
      <h3 class="module-card__title">{{ module.title }}</h3>
      <p class="module-card__desc">{{ module.description }}</p>
    </div>
    <div class="module-card__meta">
      <span v-if="module.type === 'curation' && count != null" class="module-card__badge">
        {{ count }} 个项目
      </span>
      <span v-if="module.type === 'tool'" class="module-card__arrow">→</span>
    </div>
  </a>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  module: {
    type: Object,
    required: true,
  },
  count: {
    type: Number,
    default: null,
  },
})

// Dim the accent color for dark mode — lighter variant
const moduleDimColor = computed(() => {
  const c = props.module.color
  // Simple lighten: blend with white at 30%
  return `color-mix(in oklch, ${c} 70%, white)`
})
</script>

<style scoped>
.module-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  text-decoration: none;
  color: var(--text-primary);
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 150ms ease-out,
    box-shadow 150ms ease-out;
}

.module-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.module-card:focus-visible {
  outline: 2px solid var(--accent-own);
  outline-offset: 2px;
}

.module-card:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.module-card__accent {
  height: 3px;
  background: var(--module-color);
  flex-shrink: 0;
}

@media (prefers-color-scheme: dark) {
  .module-card__accent {
    background: var(--module-color-dim);
  }
}

.module-card__body {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.module-card__icon {
  font-size: 2rem;
  line-height: 1;
  margin-bottom: 2px;
}

.module-card__title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
  line-height: 1.3;
}

.module-card__desc {
  font-size: 0.85rem;
  color: var(--text-muted);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.module-card__meta {
  padding: 0 16px 12px;
  display: flex;
  align-items: center;
}

.module-card__badge {
  font-size: 0.75rem;
  color: var(--text-subtle);
  font-family: var(--font-mono);
}

.module-card__arrow {
  font-size: 1rem;
  color: var(--text-subtle);
  margin-left: auto;
}
</style>
