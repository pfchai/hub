<template>
  <footer class="footer">
    <div class="footer__inner">
      <p class="footer__intro">&#128075; 我是 pfchai &mdash; 写代码，也挑好东西。</p>
      <nav class="footer__social">
        <a href="https://github.com/pfchai" target="_blank" rel="noopener noreferrer" class="footer__link">GitHub</a>
        <span class="footer__sep">&middot;</span>
        <a href="https://twitter.com/pfchai" target="_blank" rel="noopener noreferrer" class="footer__link">Twitter</a>
        <span class="footer__sep">&middot;</span>
        <a href="https://blog.pfchai.com" target="_blank" rel="noopener noreferrer" class="footer__link">Blog</a>
        <span class="footer__sep">&middot;</span>
        <a href="/rss.xml" class="footer__link">RSS</a>
      </nav>
      <p class="footer__copyright">&copy; 2026 Hub. 手动策展，自动部署。</p>
    </div>
  </footer>
</template>

<script setup></script>

<style scoped>
.footer {
  border-top: 1px solid var(--border);
  padding: 32px 16px;
}

.footer__inner {
  max-width: var(--max-width);
  margin: 0 auto;
  text-align: center;
}

.footer__intro {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 8px;
  line-height: 1.6;
}

.footer__social {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 8px;
}

.footer__link {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-decoration: none;
  padding: 2px 8px;
  border-radius: var(--radius);
  transition:
    color 150ms,
    background 150ms;
}

.footer__link:hover {
  color: var(--text-primary);
  background: var(--bg-secondary);
  text-decoration: none;
}

.footer__sep {
  color: var(--border);
  font-size: 0.8rem;
}

.footer__copyright {
  font-size: 0.75rem;
  color: var(--text-subtle);
}
</style>
