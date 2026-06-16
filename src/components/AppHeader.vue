<template>
  <header class="header">
    <div class="header__inner">
      <a href="#/" class="header__logo">Hub</a>
      <nav class="header__nav">
        <a href="#/" class="header__link">Home</a>
      </nav>
      <input type="search" class="header__search" placeholder="Search..." />
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.header {
  border-bottom: 1px solid var(--border);
  background: var(--bg-primary);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header__inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 16px;
  height: 48px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.header__logo {
  font-family: "Inter", sans-serif;
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-primary);
  text-decoration: none;
}

.header__nav {
  display: flex;
  gap: 4px;
}

.header__link {
  padding: 4px 12px;
  font-size: 0.85rem;
  color: var(--text-muted);
  border-radius: var(--radius);
  transition: color 150ms, background 150ms;
  text-decoration: none;
}

.header__link:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
  text-decoration: none;
}
</style>
