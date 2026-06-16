<template>
  <a
    v-if="clickable"
    :href="`#/tag/${tag}`"
    class="tag-badge tag-badge--clickable"
    @click.prevent="$emit('tag-click', tag)"
  >{{ tag }}</a>
  <span v-else class="tag-badge">{{ tag }}</span>
</template>

<script setup>
defineProps({
  tag: { type: String, required: true },
  clickable: { type: Boolean, default: false },
})

defineEmits(['tag-click'])
</script>

<style scoped>
.tag-badge {
  display: inline-block;
  font-family: "JetBrains Mono", "SF Mono", monospace;
  font-size: 0.75rem;
  padding: 1px 8px;
  border-radius: 4px;
  border: 1px solid var(--border);
  color: var(--text-muted);
  background: var(--bg-secondary);
  white-space: nowrap;
  transition: border-color 150ms, color 150ms;
}

.tag-badge--clickable {
  cursor: pointer;
}
.tag-badge--clickable:hover {
  border-color: var(--accent);
  color: var(--accent);
  text-decoration: none;
}
</style>
