<template>
  <div class="detail-view">
    <template v-if="project">
      <OwnDetail v-if="project.type === 'own'" :project="project" />
      <CuratedDetail v-else :project="project" />
    </template>

    <div v-else class="detail-view__empty">
      <p>找不到该项目。</p>
      <router-link to="/m/curation">返回列表</router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectsState } from '../../composables/useProjectsState.js'
import OwnDetail from '../../components/OwnDetail.vue'
import CuratedDetail from '../../components/CuratedDetail.vue'

const route = useRoute()
const { getProject } = useProjectsState()

const project = computed(() => getProject(route.params.id))
</script>

<style scoped>
.detail-view__empty {
  text-align: center;
  padding: 48px 0;
  color: var(--text-muted);
}

.detail-view__empty a {
  color: var(--accent);
}
</style>
