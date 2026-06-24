import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useApi, ApiError } from '../composables/useApi.js'

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

  it('throws ApiError with code "http" on non-ok response', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: () => Promise.resolve(''),
    })

    await expect(useApi('https://example.com/api')).rejects.toThrow(ApiError)
    await expect(useApi('https://example.com/api')).rejects.toMatchObject({
      code: 'http',
      status: 500,
    })
  })

  it('throws ApiError with code "rate-limit" on 429', async () => {
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

  it('throws ApiError with code "timeout" on slow requests', async () => {
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

  it('throws ApiError with code "parse" on invalid JSON', async () => {
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

describe('ApiError', () => {
  it('is an Error with name ApiError', () => {
    const err = new ApiError('network', 'something went wrong')
    expect(err).toBeInstanceOf(Error)
    expect(err.name).toBe('ApiError')
  })

  it('carries code, message, and optional status', () => {
    const err = new ApiError('http', 'Not Found', 404)
    expect(err.code).toBe('http')
    expect(err.message).toBe('Not Found')
    expect(err.status).toBe(404)
  })

  it('works without a status code', () => {
    const err = new ApiError('timeout', 'timed out')
    expect(err.code).toBe('timeout')
    expect(err.status).toBeUndefined()
  })
})
