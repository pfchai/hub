<template>
  <DetailLayout :project="project" class="CuratedDetail">
    <section v-if="project.description" class="detail__section">
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
  </DetailLayout>
</template>

<script setup>
import DetailLayout from '../components/DetailLayout.vue'
defineProps({ project: { type: Object, required: true } })
</script>

<style scoped>
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
.detail__highlights { list-style: none; padding: 0; }
.detail__highlights li {
  padding: 6px 0;
  font-size: 0.9rem;
  border-bottom: 1px solid var(--border);
}
.detail__highlights li:last-child { border-bottom: none; }
.detail__highlights li::before { content: '· '; color: var(--accent-curated); font-weight: bold; }
</style>
