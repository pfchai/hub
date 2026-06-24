/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Serve static sub-SPAs from public/ in local dev (Cloudflare Pages handles this via _redirects in prod)
function staticSubSpas() {
  const PUBLIC_DIR = path.resolve(__dirname, 'public')
  const SUB_SPAS = ['tldraw', 'how-to-cook', 'gift-book']

  return {
    name: 'static-sub-spas',
    configureServer(server) {
      // Serve sub-SPA HTML raw — bypass Vite's transform to avoid resolving CDN importmaps
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`)
        const base = url.pathname.split('/')[1]

        if (!base || !SUB_SPAS.includes(base)) return next()

        // /tldraw → redirect to /tldraw/
        if (url.pathname === `/${base}`) {
          res.writeHead(301, { Location: `/${base}/` })
          return res.end()
        }

        // /tldraw/* → serve index.html raw (no Vite HTML transform)
        const spaDir = path.join(PUBLIC_DIR, base)
        let filePath

        // Try exact path first (for CSS/JS/fonts), fallback to index.html
        const candidate = path.join(spaDir, url.pathname.slice(`/${base}`.length || 1))
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          filePath = candidate
        } else if (fs.existsSync(path.join(spaDir, 'index.html'))) {
          filePath = path.join(spaDir, 'index.html')
        } else {
          return next()
        }

        const ext = path.extname(filePath)
        const mime = {
          '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
          '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2',
        }[ext] || 'application/octet-stream'

        res.writeHead(200, { 'Content-Type': mime })
        res.end(fs.readFileSync(filePath))
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url, `http://${req.headers.host}`)
        const base = url.pathname.split('/')[1]

        if (!base || !SUB_SPAS.includes(base)) return next()

        // /tldraw → redirect to /tldraw/
        if (url.pathname === `/${base}`) {
          res.writeHead(301, { Location: `/${base}/` })
          return res.end()
        }

        // /tldraw/* → index.html SPA fallback
        if (!url.pathname.includes('.', url.pathname.lastIndexOf('/'))) {
          req.url = `/${base}/index.html`
        }

        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [vue(), staticSubSpas()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/__tests__/**/*.test.{js,ts}'],
  },
})
