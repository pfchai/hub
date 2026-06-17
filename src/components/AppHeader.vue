<template>
  <header class="header">
    <div class="header__inner">
      <a href="#/" class="header__logo">Hub<span class="header__logo-dot">.</span></a>
      <nav class="header__nav">
        <a href="#/" class="header__link" :class="{ 'header__link--active': isHome }">Home</a>
        <a href="#/about" class="header__link" :class="{ 'header__link--active': isAbout }">About</a>
      </nav>
      <div class="header__spacer"></div>
      <div class="header__search" ref="searchRef">
        <button class="header__search-trigger" @click="toggleSearch" aria-label="Search">
          <svg class="header__search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span class="header__search-text">Search</span>
          <kbd class="header__kbd">&#8984;K</kbd>
        </button>
        <div v-if="searchOpen" class="header__search-popover" @click.self="searchOpen = false">
          <input
            ref="searchInput"
            type="search"
            class="header__search-input"
            placeholder="Search projects..."
            v-model="searchValue"
            @keydown.enter="onSearch"
            @keydown.escape="closeSearch"
          />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const searchOpen = ref(false)
const searchValue = ref('')
const searchInput = ref(null)
const searchRef = ref(null)

const isHome = computed(() => route.path === '/')
const isAbout = computed(() => route.path === '/about')

function toggleSearch() {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) {
    nextTick(() => {
      searchInput.value?.focus()
    })
  }
}

function closeSearch() {
  searchOpen.value = false
  searchValue.value = ''
}

function onSearch() {
  if (searchValue.value.trim()) {
    router.push({ name: 'search', query: { q: searchValue.value.trim() } })
    closeSearch()
  }
}

// Close popover when clicking outside
watch(searchOpen, (open) => {
  if (open) {
    const handler = (e) => {
      if (searchRef.value && !searchRef.value.contains(e.target)) {
        searchOpen.value = false
      }
    }
    document.addEventListener('click', handler, { once: true })
  }
})

// Keyboard shortcut: Cmd+K / Ctrl+K
function handleKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    toggleSearch()
  }
}

if (typeof window !== 'undefined') {
  document.addEventListener('keydown', handleKeydown)
}
</script>

<style scoped>
.header {
  border-bottom: 1px solid var(--border);
  background: rgba(250, 250, 249, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 100;
}

@media (prefers-color-scheme: dark) {
  .header {
    background: rgba(26, 24, 21, 0.85);
  }
}

.header__inner {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 16px;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.header__logo {
  font-family: var(--font-sans);
  font-weight: 800;
  font-size: 1.2rem;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  text-decoration: none;
  flex-shrink: 0;
}

.header__logo-dot {
  color: var(--accent-own);
}

.header__nav {
  display: flex;
  gap: 2px;
}

.header__link {
  padding: 4px 10px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted);
  border-radius: var(--radius);
  transition:
    color 150ms,
    background 150ms;
  text-decoration: none;
}

.header__link:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
  text-decoration: none;
}

.header__link--active {
  color: var(--text-primary);
}

.header__spacer {
  flex: 1;
}

/* Search trigger button */
.header__search {
  position: relative;
  flex-shrink: 0;
}

.header__search-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  font-family: var(--font-sans);
  font-size: 0.8rem;
  color: var(--text-muted);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition:
    border-color 150ms,
    color 150ms;
  white-space: nowrap;
}

.header__search-trigger:hover {
  border-color: var(--text-subtle);
  color: var(--text-primary);
}

.header__search-icon {
  flex-shrink: 0;
}

.header__search-text {
  display: none;
}

@media (min-width: 480px) {
  .header__search-text {
    display: inline;
  }
}

.header__kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 18px;
  padding: 0 4px;
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--text-subtle);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 4px;
  line-height: 1;
}

/* Search popover */
.header__search-popover {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 280px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 8px;
  z-index: 200;
}

.header__search-input {
  width: 100%;
  padding: 8px 10px;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  color: var(--text-primary);
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  outline: none;
  transition: border-color 150ms;
}

.header__search-input:focus {
  border-color: var(--accent-own);
}

.header__search-input::placeholder {
  color: var(--text-subtle);
}
</style>
