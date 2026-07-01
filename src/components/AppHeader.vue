<template>
  <header class="header">
    <div class="header__inner">
      <a href="#/" class="header__logo" aria-label="Home">Hub<span class="header__logo-dot">.</span></a>

      <nav class="header__nav" aria-label="Main navigation">
        <a
          v-for="link in navLinks"
          :key="link.key"
          :href="link.href"
          class="header__link"
          :class="{ 'header__link--active': link.active }"
        >{{ link.label }}</a>
      </nav>

      <!-- Hamburger toggle (mobile only) -->
      <button
        class="header__hamburger"
        :class="{ 'header__hamburger--open': mobileMenuOpen }"
        @click="toggleMobileMenu"
        @keydown.escape.stop="closeMobileMenu"
        aria-label="Toggle navigation menu"
        :aria-expanded="mobileMenuOpen"
      >
        <span class="header__hamburger-bar"></span>
        <span class="header__hamburger-bar"></span>
        <span class="header__hamburger-bar"></span>
      </button>

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

    <!-- Mobile menu -->
    <transition name="mobile-menu">
      <div
        v-if="mobileMenuOpen"
        class="header__mobile-backdrop"
        @click="closeMobileMenu"
        @keydown.escape="closeMobileMenu"
      />
    </transition>
    <div class="header__mobile-menu" :class="{ 'header__mobile-menu--open': mobileMenuOpen }">
      <nav class="header__mobile-nav" aria-label="Mobile navigation">
        <a
          v-for="link in navLinks"
          :key="link.key"
          :href="link.href"
          class="header__link"
          :class="{ 'header__link--active': link.active }"
          @click="closeMobileMenu"
        >{{ link.label }}</a>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { modules } from '../modules/registry.js'

const router = useRouter()
const route = useRoute()

const searchOpen = ref(false)
const searchValue = ref('')
const searchInput = ref(null)
const searchRef = ref(null)
const mobileMenuOpen = ref(false)

function toggleMobileMenu() { mobileMenuOpen.value = !mobileMenuOpen.value }
function closeMobileMenu() { mobileMenuOpen.value = false }

// ── Navigation links (shared by desktop & mobile) ──────────────
const navLinks = computed(() => {
  const links = [{ key: 'home', href: '#/', label: 'Home', active: route.path === '/' }]
  for (const m of modules) {
    links.push({
      key: m.id,
      href: `#/m/${m.id}`,
      label: `${m.icon} ${m.title}`,
      active: route.path.startsWith(`/m/${m.id}`),
    })
  }
  links.push({ key: 'about', href: '#/about', label: 'About', active: route.path === '/about' })
  return links
})

// ── Search ─────────────────────────────────────────────────────
function toggleSearch() {
  searchOpen.value = !searchOpen.value
  if (searchOpen.value) nextTick(() => searchInput.value?.focus())
}

function closeSearch() { searchOpen.value = false; searchValue.value = '' }

function onSearch() {
  if (searchValue.value.trim()) {
    router.push({ name: 'search', query: { q: searchValue.value.trim() } })
    closeSearch()
  }
}

let outsideClickHandler = null
watch(searchOpen, (open) => {
  if (open) {
    outsideClickHandler = (e) => { if (searchRef.value && !searchRef.value.contains(e.target)) searchOpen.value = false }
    document.addEventListener('click', outsideClickHandler, { once: true })
  } else if (outsideClickHandler) {
    document.removeEventListener('click', outsideClickHandler)
    outsideClickHandler = null
  }
})

function handleKeydown(e) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); toggleSearch() }
}

onMounted(() => { document.addEventListener('keydown', handleKeydown) })
onUnmounted(() => { document.removeEventListener('keydown', handleKeydown) })
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
@media (prefers-color-scheme: dark) { .header { background: rgba(26, 24, 21, 0.85); } }

.header__inner { max-width: var(--max-width); margin: 0 auto; padding: 0 16px; height: 52px; display: flex; align-items: center; gap: 16px; }
.header__logo { font-family: var(--font-sans); font-weight: 800; font-size: 1.2rem; letter-spacing: -0.03em; color: var(--text-primary); text-decoration: none; flex-shrink: 0; }
.header__logo-dot { color: var(--accent-own); }

.header__nav { display: flex; gap: 2px; overflow-x: auto; scrollbar-width: none; }
.header__nav::-webkit-scrollbar { display: none; }

.header__link {
  padding: 4px 10px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted);
  border-radius: var(--radius);
  transition: color 150ms, background 150ms;
  text-decoration: none;
  white-space: nowrap;
}
.header__link:hover { color: var(--text-primary); background: var(--bg-secondary); text-decoration: none; }
.header__link--active { color: var(--text-primary); }

.header__spacer { flex: 1; }

/* Search trigger button */
.header__search { position: relative; flex-shrink: 0; }
.header__search-trigger {
  display: flex; align-items: center; gap: 6px; padding: 6px 10px;
  font-family: var(--font-sans); font-size: 0.8rem; color: var(--text-muted);
  background: var(--bg-secondary); border: 1px solid var(--border);
  border-radius: var(--radius); cursor: pointer;
  transition: border-color 150ms, color 150ms; white-space: nowrap;
}
.header__search-trigger:hover { border-color: var(--text-subtle); color: var(--text-primary); }
.header__search-icon { flex-shrink: 0; }
.header__search-text { display: none; }
@media (min-width: 480px) { .header__search-text { display: inline; } }
.header__kbd { display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 18px; padding: 0 4px; font-family: var(--font-mono); font-size: 0.65rem; color: var(--text-subtle); background: var(--bg-primary); border: 1px solid var(--border); border-radius: 4px; line-height: 1; }

/* Search popover */
.header__search-popover { position: absolute; top: calc(100% + 8px); right: 0; width: 280px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: 0 4px 16px rgba(0,0,0,0.08); padding: 8px; z-index: 200; }
.header__search-input { width: 100%; padding: 8px 10px; font-family: var(--font-sans); font-size: 0.85rem; color: var(--text-primary); background: var(--bg-primary); border: 1px solid var(--border); border-radius: var(--radius); outline: none; transition: border-color 150ms; }
.header__search-input:focus { border-color: var(--accent-own); }
.header__search-input::placeholder { color: var(--text-subtle); }

@media (max-width: 639px) {
  .header__link { min-height: 44px; display: inline-flex; align-items: center; }
  .header__search-trigger { min-height: 44px; }
}

/* ===== Hamburger ===== */
.header__hamburger { display: none; flex-shrink: 0; width: 36px; height: 36px; padding: 8px 6px; background: none; border: none; cursor: pointer; flex-direction: column; justify-content: space-around; align-items: center; border-radius: 6px; transition: background 150ms; margin-left: auto; }
.header__hamburger:hover { background: var(--bg-secondary); }
.header__hamburger-bar { display: block; width: 20px; height: 2px; background: var(--text-muted); border-radius: 2px; transition: transform 200ms, opacity 200ms; }
.header__hamburger--open .header__hamburger-bar:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.header__hamburger--open .header__hamburger-bar:nth-child(2) { opacity: 0; }
.header__hamburger--open .header__hamburger-bar:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }
@media (max-width: 639px) { .header__hamburger { display: flex; } }

/* ===== Mobile menu ===== */
.header__mobile-backdrop { display: none; }
.header__mobile-menu { display: none; }
@media (max-width: 639px) {
  .header__nav { display: none; }
  .header__hamburger { display: flex; }
  .header__mobile-backdrop { display: block; position: fixed; inset: 0; top: 52px; background: rgba(0,0,0,0.3); z-index: 90; }
  .header__mobile-menu { display: block; position: absolute; top: 100%; left: 0; right: 0; background: var(--bg-primary); border-bottom: 1px solid var(--border); max-height: 0; overflow: hidden; transition: max-height 300ms ease; z-index: 91; }
  .header__mobile-menu--open { max-height: 500px; }
  .header__mobile-nav { display: flex; flex-direction: column; padding: 8px 16px 12px; gap: 2px; }
  .header__mobile-nav .header__link { padding: 10px 12px; font-size: 0.9rem; min-height: 44px; display: flex; align-items: center; }
  .header__mobile-backdrop { @media (prefers-color-scheme: dark) { background: rgba(0,0,0,0.5); } }
}
</style>
