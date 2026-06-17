<template>
  <div class="not-found">
    <h2>页面不存在</h2>
    <p>Page not found</p>
    <a href="#/">← 返回首页</a>
  </div>
</template>

<script setup></script>

<style scoped>
.not-found {
  text-align: center;
  padding: 64px 16px;
  color: var(--text-muted);
}

.not-found h2 {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.not-found a {
  display: inline-block;
  margin-top: 16px;
  color: var(--accent);
}
</style>
