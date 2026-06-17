<template>
  <div class="app">
    <AppHeader />
    <main class="main-content">
      <Transition name="page" mode="out-in">
        <router-view />
      </Transition>
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
</script>

<style>
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
