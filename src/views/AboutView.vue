<template>
  <div class="about">
    <div class="about__card">
      <h1 class="about__greeting">👋</h1>
      <h2 class="about__title">Hey, I'm pfchai</h2>
      <p class="about__text">
        I'm a developer and curator who loves discovering great projects
        and building things on the web. This is my personal hub — a
        collection of projects I've built myself and handpicked gems from
        across the open-source world that I think are worth sharing.
      </p>
      <p class="about__text">
        Everything here is curated manually. No algorithms, no noise —
        just good projects that caught my eye or taught me something.
      </p>
      <nav class="about__links">
        <a href="https://github.com/pfchai" target="_blank" rel="noopener noreferrer" class="about__link">GitHub</a>
        <a href="https://twitter.com/pfchai" target="_blank" rel="noopener noreferrer" class="about__link">Twitter</a>
        <a href="https://blog.pfchai.com" target="_blank" rel="noopener noreferrer" class="about__link">Blog</a>
        <a href="/rss.xml" class="about__link">RSS</a>
      </nav>
    </div>
  </div>
</template>

<script setup>
// About page — personal blurb with social links
</script>

<style scoped>
.about {
  display: flex;
  justify-content: center;
  padding: 48px 16px;
}

.about__card {
  max-width: 520px;
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 40px 36px;
  text-align: center;
}

.about__greeting {
  font-size: 2rem;
  margin-bottom: 8px;
  display: block;
}

.about__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 20px;
  letter-spacing: -0.02em;
}

.about__text {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.7;
  margin: 0 0 14px;
  text-align: left;
}

.about__text:last-of-type {
  margin-bottom: 24px;
}

.about__links {
  display: flex;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}

.about__link {
  display: inline-block;
  padding: 6px 14px;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  text-decoration: none;
  transition: color 150ms, border-color 150ms;
}

.about__link:hover {
  color: var(--text-primary);
  border-color: var(--text-subtle);
  text-decoration: none;
}

@media (max-width: 639px) {
  .about {
    padding: 32px 12px;
  }

  .about__card {
    padding: 32px 20px;
  }
}
</style>
