<template>
  <div class="donut-item">
    <svg viewBox="0 0 80 80" class="donut-svg">
      <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border)" stroke-width="6" />
      <circle
        cx="40" cy="40" r="32" fill="none"
        :stroke="color"
        stroke-width="6" stroke-linecap="round"
        :stroke-dasharray="dashArray"
        stroke-dashoffset="0"
        transform="rotate(-90 40 40)"
        class="donut-ring"
      />
      <text x="40" y="38" text-anchor="middle" class="donut-value">{{ pct }}%</text>
    </svg>
    <span class="donut-label">{{ label }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const CIRCUM = 2 * Math.PI * 32

const props = defineProps({
  pct: { type: Number, default: 0 },
  label: { type: String, required: true },
  quality: { type: String, default: null },
})

const dashArray = computed(() => {
  const p = Math.min(100, Math.max(0, props.pct ?? 0))
  const fill = (p / 100) * CIRCUM
  return `${fill} ${CIRCUM - fill}`
})

const color = computed(() => {
  if (props.quality === 'good') return '#16a34a'
  if (props.quality === 'maybe') return '#ca8a04'
  return 'var(--text-muted)'
})
</script>

<style scoped>
.donut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.donut-svg { width: 80px; height: 80px; }
.donut-ring { transition: stroke-dasharray 0.6s ease, stroke 0.6s ease; }
.donut-value {
  font-family: var(--font-mono, monospace);
  font-size: 0.85rem;
  font-weight: 600;
  fill: var(--text-primary, #1c1917);
}
.donut-label {
  font-size: 0.75rem;
  color: var(--text-muted, #78716c);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
</style>
