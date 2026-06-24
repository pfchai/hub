import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Import the function we want to test, not the singleton module
import { validateRegistry } from '../modules/registry.js'

// Helper: minimal valid module
function validModule(overrides = {}) {
  return {
    id: 'test-module',
    title: 'Test Module',
    description: 'A test module for unit testing',
    icon: '🧪',
    color: '#ff0000',
    type: 'tool',
    featured: true,
    routes: [{ path: '', label: '首页', component: () => Promise.resolve({}) }],
    ...overrides,
  }
}

describe('validateRegistry', () => {
  let warnSpy

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  it('passes a valid single module without warnings', () => {
    validateRegistry([validModule()])
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('passes multiple valid modules without warnings', () => {
    validateRegistry([
      validModule({ id: 'alpha', title: 'Alpha', color: '#111111', icon: 'A' }),
      validModule({ id: 'beta', title: 'Beta', color: '#222222', icon: 'B' }),
    ])
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('warns on duplicate module ids', () => {
    validateRegistry([validModule({ id: 'dup' }), validModule({ id: 'dup' })])
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Duplicate module id'))
  })

  it('warns on non-kebab-case id', () => {
    validateRegistry([validModule({ id: 'CamelCase' })])
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('kebab-case'))
  })

  it('warns on missing title', () => {
    validateRegistry([validModule({ title: '' })])
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('missing a title'))
  })

  it('warns on missing icon', () => {
    validateRegistry([validModule({ icon: '' })])
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('missing an icon'))
  })

  it('warns on missing color', () => {
    validateRegistry([validModule({ color: '' })])
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('missing a color'))
  })

  it('warns on invalid color format', () => {
    validateRegistry([validModule({ color: 'red' })])
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('6-char hex'))
  })

  it('warns on unknown type', () => {
    validateRegistry([validModule({ type: 'unknown-type' })])
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('has unknown type'))
  })

  it('warns on missing featured flag', () => {
    validateRegistry([validModule({ featured: undefined })])
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('missing the featured flag'))
  })

  it('warns on empty routes', () => {
    validateRegistry([validModule({ routes: [] })])
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('has no routes'))
  })

  it('warns on routes missing a label', () => {
    validateRegistry([
      validModule({
        routes: [{ path: '', label: '', component: () => Promise.resolve({}) }],
      }),
    ])
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('missing a label'))
  })

  it('warns on duplicate route paths across modules', () => {
    validateRegistry([
      validModule({ id: 'a', routes: [{ path: 'foo', label: 'Foo', component: () => Promise.resolve({}) }] }),
      validModule({ id: 'b', routes: [{ path: 'foo', label: 'Foo', component: () => Promise.resolve({}) }] }),
    ])
    // /m/a/foo and /m/b/foo are different paths — no duplicate
    expect(warnSpy).not.toHaveBeenCalled()
  })

  it('warns on duplicate route paths within a module', () => {
    validateRegistry([
      validModule({
        id: 'same',
        routes: [
          { path: 'bar', label: 'Bar', component: () => Promise.resolve({}) },
          { path: 'bar', label: 'Bar again', component: () => Promise.resolve({}) },
        ],
      }),
    ])
    // /m/same/bar appears twice — full path collision is detected
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Duplicate route path'))
  })
})
