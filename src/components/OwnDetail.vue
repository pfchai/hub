<template>
  <DetailLayout :project="project" class="OwnDetail">
    <section v-if="project.story" class="detail__section">
      <h2 class="detail__section-title">背景故事</h2>
      <div class="detail__story markdown-body" v-html="renderMarkdown(project.story)" />
    </section>

    <section v-if="project.techDecisions?.length" class="detail__section">
      <h2 class="detail__section-title">技术选型</h2>
      <ul class="detail__decisions">
        <li v-for="(td, i) in project.techDecisions" :key="i">
          <strong>{{ td.choice }}</strong>: {{ td.reason }}
        </li>
      </ul>
    </section>

    <section v-if="project.screenshots?.length" class="detail__section">
      <h2 class="detail__section-title">截图</h2>
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
      <h2 class="detail__section-title">心得 &amp; 教训</h2>
      <div class="detail__lessons markdown-body" v-html="renderMarkdown(project.lessons)" />
    </section>

    <template #sidebar-links>
      <a v-if="project.demo" :href="project.demo" target="_blank" rel="noopener" class="sidebar__link">Live Demo</a>
    </template>
  </DetailLayout>
</template>

<script setup>
import DetailLayout from '../components/DetailLayout.vue'
import { renderMarkdown } from '../utils/markdown.js'
defineProps({ project: { type: Object, required: true } })
</script>

<style scoped>
.detail__decisions { list-style: none; padding: 0; }
.detail__decisions li { padding: 8px 0; font-size: 0.9rem; border-bottom: 1px solid var(--border); }
.detail__decisions li:last-child { border-bottom: none; }
.detail__screenshots { display: flex; flex-direction: column; gap: 12px; }
.detail__screenshot { width: 100%; border-radius: var(--radius); border: 1px solid var(--border); }

.markdown-body :deep(h2) { font-size: 1rem; margin-top: 12px; margin-bottom: 6px; }
.markdown-body :deep(h3) { font-size: 0.9rem; margin-top: 10px; margin-bottom: 4px; }
.markdown-body :deep(p) { margin-bottom: 8px; font-size: 0.9rem; line-height: 1.7; }
.markdown-body :deep(ul), .markdown-body :deep(ol) { padding-left: 20px; margin-bottom: 8px; }
.markdown-body :deep(li) { font-size: 0.9rem; margin-bottom: 4px; }
.markdown-body :deep(code) { font-size: 0.8rem; background: var(--bg-secondary); padding: 1px 5px; border-radius: var(--radius); }
.markdown-body :deep(pre) { background: var(--bg-secondary); padding: 12px; border-radius: var(--radius); overflow-x: auto; margin-bottom: 8px; }
</style>
