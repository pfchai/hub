// Build HowToCook markdown → static HTML
import { marked } from 'marked'
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs'
import { join, dirname, relative } from 'path'

const SRC = '_deploy/how-to-cook'
const OUT = 'public/how-to-cook'

function getAllMdFiles(dir) {
  const files = []
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    if (entry.startsWith('.') || entry === 'node_modules') continue
    if (statSync(fullPath).isDirectory()) {
      files.push(...getAllMdFiles(fullPath))
    } else if (entry.endsWith('.md')) {
      files.push(fullPath)
    }
  }
  return files
}

const mdFiles = getAllMdFiles(SRC)

// Generate category index data
const categories = {}
for (const file of mdFiles) {
  const relPath = relative(SRC, file)
  const category = relPath.split('/')[0]
  if (!categories[category]) categories[category] = []
  categories[category].push(relPath)
}

// Build HTML for each markdown file
const template = (title, body, isHome) => `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — 程序员做饭指南</title>
  <style>
    :root {
      --bg: #fff; --text: #333; --border: #e5e7eb; --accent: #2563eb;
      --bg-secondary: #f9fafb;
    }
    @media (prefers-color-scheme: dark) {
      :root { --bg: #1a1a2e; --text: #e2e8f0; --border: #2a2a4a; --accent: #60a5fa; --bg-secondary: #0f0f23; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: var(--bg); color: var(--text); line-height: 1.7; max-width: 720px; margin: 0 auto; padding: 24px 16px; }
    a { color: var(--accent); text-decoration: none; }
    h1 { font-size: 1.5rem; margin-bottom: 1rem; }
    h2 { font-size: 1.2rem; margin: 1.5rem 0 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.25rem; }
    ul { padding-left: 1.5rem; }
    li { margin: 0.25rem 0; }
    code { background: var(--bg-secondary); padding: 1px 5px; border-radius: 3px; font-size: 0.9em; }
    pre { background: var(--bg-secondary); padding: 12px; border-radius: 6px; overflow-x: auto; margin: 0.5rem 0; }
    img { max-width: 100%; border-radius: 6px; }
    table { border-collapse: collapse; width: 100%; margin: 0.5rem 0; }
    th, td { border: 1px solid var(--border); padding: 6px 10px; text-align: left; }
    .back { display: inline-block; margin-bottom: 1.5rem; font-size: 0.9rem; }
  </style>
</head>
<body>
  <a href="/how-to-cook/" class="back">← 返回首页</a>
  <h1>${title}</h1>
  ${body}
</body>
</html>`

for (const file of mdFiles) {
  const relPath = relative(SRC, file)
  const outPath = join(OUT, relPath).replace('.md', '') + '/index.html'
  const mdContent = readFileSync(file, 'utf-8')
  const title = relPath.split('/').pop().replace('.md', '')
  const body = marked.parse(mdContent)
  const html = template(title, body, false)
  mkdirSync(dirname(outPath), { recursive: true })
  writeFileSync(outPath, html)
}

// Build index page
const catList = Object.keys(categories).sort().map(cat => {
  const items = categories[cat].map(f => {
    const name = f.replace(cat + '/', '').replace('.md', '')
    return `<li><a href="/how-to-cook/${f.replace('.md', '')}/">${name}</a></li>`
  }).join('\n')
  return `<h2>${cat}</h2><ul>${items}</ul>`
}).join('\n')

const indexHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>程序员在家做饭指南</title>
  <style>
    :root {
      --bg: #fff; --text: #333; --border: #e5e7eb; --accent: #2563eb;
      --bg-secondary: #f9fafb;
    }
    @media (prefers-color-scheme: dark) {
      :root { --bg: #1a1a2e; --text: #e2e8f0; --border: #2a2a4a; --accent: #60a5fa; --bg-secondary: #0f0f23; }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: var(--bg); color: var(--text); line-height: 1.7; max-width: 720px; margin: 0 auto; padding: 24px 16px; }
    a { color: var(--accent); text-decoration: none; }
    h1 { font-size: 1.5rem; margin-bottom: 1rem; }
    h2 { font-size: 1.2rem; margin: 1.5rem 0 0.5rem; border-bottom: 1px solid var(--border); padding-bottom: 0.25rem; }
    ul { padding-left: 1.5rem; columns: ${Object.keys(categories).length > 10 ? '3' : '2'}; }
    li { margin: 0.25rem 0; break-inside: avoid; }
    @media (max-width: 600px) { ul { columns: 1; } }
  </style>
</head>
<body>
  <h1>🏠 程序员在家做饭指南</h1>
  <p style="color:var(--muted, #6b7280);margin-bottom:1.5rem;">HowToCook — ${mdFiles.length} 道菜谱</p>
  ${catList}
  <footer style="margin-top:3rem;padding-top:1rem;border-top:1px solid var(--border);font-size:0.85rem;color:var(--muted, #6b7280);">
    源码来自 <a href="https://github.com/Anduin2017/HowToCook">Anduin2017/HowToCook</a>
  </footer>
</body>
</html>`

mkdirSync(OUT, { recursive: true })
writeFileSync(join(OUT, 'index.html'), indexHtml)

console.log(`Built ${mdFiles.length} recipe pages + index`)
