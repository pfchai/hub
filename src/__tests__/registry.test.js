import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// validateRegistry is no longer exported — test via re-evaluating the module
// Since it only runs in DEV (import.meta.env.DEV), we test it inline.
// The logic is verified by the fact that if modules had duplicates or bad
// formatting, the dev build would log warnings. We validate the modules
// array is well-formed instead.

import { modules } from '../modules/registry.js'

describe('Module Registry', () => {
  const seenIds = new Set()
  const seenPaths = new Set()

  for (const m of modules) {
    it(`module "${m.id}" has a unique id`, () => {
      expect(seenIds.has(m.id)).toBe(false)
      seenIds.add(m.id)
    })

    it(`module "${m.id}" has kebab-case id`, () => {
      expect(m.id).toMatch(/^[a-z][a-z0-9-]*$/)
    })

    it(`module "${m.id}" has required fields`, () => {
      expect(m.title).toBeTruthy()
      expect(m.icon).toBeTruthy()
      expect(m.color).toBeTruthy()
      expect(m.type).toBeTruthy()
      expect(m.featured).not.toBeUndefined()
    })

    it(`module "${m.id}" has a valid type`, () => {
      expect(['curation', 'tool']).toContain(m.type)
    })

    it(`module "${m.id}" has valid hex color`, () => {
      expect(m.color).toMatch(/^#[0-9a-fA-F]{6}$/)
    })

    it(`module "${m.id}" has routes`, () => {
      expect(m.routes?.length).toBeGreaterThan(0)
    })

    if (m.routes) {
      for (const r of m.routes) {
        it(`module "${m.id}" route "${r.path || '(index)'}" has no path collision`, () => {
          const fullPath = `/m/${m.id}${r.path ? '/' + r.path : ''}`
          expect(seenPaths.has(fullPath)).toBe(false)
          seenPaths.add(fullPath)
        })

        it(`module "${m.id}" route "${r.path || '(index)'}" has a label`, () => {
          expect(r.label).toBeTruthy()
        })
      }
    }
  }
})
