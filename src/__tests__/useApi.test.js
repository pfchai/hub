import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useApi } from '../composables/useApi.js'

const isApiError = (err, code) => err instanceof Error && err.code === code

describe('useApi', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns parsed JSON on success', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('{"hello":"world"}'),
    })

    const result = await useApi('https://example.com/api')
    expect(result).toEqual({ hello: 'world' })
  })

  it('throws error with code "http" on non-ok response', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: () => Promise.resolve(''),
    })

    await expect(useApi('https://example.com/api')).rejects.toMatchObject({
      code: 'http',
      status: 500,
    })
  })

  it('throws error with code "rate-limit" on 429', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      text: () => Promise.resolve(''),
    })

    await expect(useApi('https://example.com/api')).rejects.toMatchObject({
      code: 'rate-limit',
      status: 429,
    })
  })

  it('throws error with code "timeout" on slow requests', async () => {
    globalThis.fetch.mockImplementation(
      (url, { signal } = {}) =>
        new Promise((resolve, reject) => {
          const timer = setTimeout(() => resolve({ ok: true, status: 200, text: () => Promise.resolve('{}') }), 200)
          signal?.addEventListener('abort', () => {
            clearTimeout(timer)
            reject(new DOMException('Aborted', 'AbortError'))
          })
        })
    )

    await expect(useApi('https://example.com/api', { timeout: 50 })).rejects.toMatchObject({
      code: 'timeout',
    })
  })

  it('throws error with code "parse" on invalid JSON', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('not-json'),
    })

    await expect(useApi('https://example.com/api')).rejects.toMatchObject({
      code: 'parse',
    })
  })

  it('passes custom headers in the request', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('{}'),
    })

    await useApi('https://example.com/api', { headers: { Authorization: 'Bearer xyz' } })
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://example.com/api',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer xyz' }),
      })
    )
  })
})
