import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DetailView from '../views/DetailView.vue'

vi.mock('../composables/useProjects.js', () => ({
  useProjects: vi.fn(() => ({
    getProject: vi.fn((id) => {
      if (id === 'my-project') return {
        id: 'my-project', type: 'own', title: 'My Project', tagline: 'test',
        tags: ['Vue'], stars: 10, url: 'https://a.com', addedAt: '2026-01-01',
        description: 'desc', story: '# Hi', techDecisions: [], screenshots: [], lessons: '',
      }
      if (id === 'curated') return {
        id: 'curated', type: 'curated', title: 'Curated', tagline: 'test',
        tags: ['React'], stars: 100, url: 'https://b.com', addedAt: '2026-01-01',
        description: 'desc', whyRecommend: 'good', highlights: ['fast'],
      }
      return undefined
    }),
  })),
}))

const mockRouterPush = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ params: { id: 'my-project' } })),
  useRouter: vi.fn(() => ({ push: mockRouterPush, back: vi.fn() })),
}))

describe('DetailView', () => {
  beforeEach(() => {
    mockRouterPush.mockClear()
  })

  it('renders OwnDetail for own-type projects', async () => {
    const { useRoute } = await import('vue-router')
    useRoute.mockReturnValue({ params: { id: 'my-project' } })
    const wrapper = mount(DetailView)
    expect(wrapper.text()).toContain('My Project')
    expect(wrapper.text()).toContain('📖')
  })

  it('renders CuratedDetail for curated-type projects', async () => {
    const { useRoute } = await import('vue-router')
    useRoute.mockReturnValue({ params: { id: 'curated' } })
    const wrapper = mount(DetailView)
    expect(wrapper.text()).toContain('Curated')
    expect(wrapper.text()).toContain('📝')
  })

  it('renders back-to-list link', async () => {
    const { useRoute } = await import('vue-router')
    useRoute.mockReturnValue({ params: { id: 'my-project' } })
    const wrapper = mount(DetailView)
    const backLink = wrapper.find('.detail-view__back')
    expect(backLink.exists()).toBe(true)
    expect(backLink.attributes('href')).toBe('#/')
  })

  it('shows "not found" message for unknown project id', async () => {
    const { useRoute } = await import('vue-router')
    useRoute.mockReturnValue({ params: { id: 'nonexistent' } })
    const wrapper = mount(DetailView)
    expect(wrapper.text()).toContain('找不到')
  })
})
