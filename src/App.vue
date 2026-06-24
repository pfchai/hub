<template>
  <div class="app">
    <a href="#main-content" class="skip-link">跳到主要内容</a>
    <AppHeader />
    <main id="main-content" class="main-content" tabindex="-1">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<style>
/* ── Skip link ── */
.app {
  position: relative;
}

.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  z-index: 1000;
  padding: 8px 16px;
  background: var(--accent-own);
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 0 0 var(--radius) 0;
  transition: top 0.2s;
}

.skip-link:focus {
  top: 0;
}

/* ── Page transitions ── */
.page-enter-active {
  transition: opacity 0.3s ease, transform 0.2s ease-out;
}
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease-in;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
