import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ListView from '../views/ListView.vue'
import { ref, reactive } from 'vue'

const mockProjects = [
  {
    id: 'p1',
    type: 'own',
    title: 'Project 1',
    tagline: 'First',
    tags: ['Vue'],
    stars: 100,
    url: 'https://a.com',
    addedAt: '2026-01-01',
    description: '',
  },
  {
    id: 'p2',
    type: 'curated',
    title: 'Project 2',
    tagline: 'Second',
    tags: ['React'],
    stars: 200,
    url: 'https://b.com',
    addedAt: '2026-02-01',
    description: '',
    whyRecommend: 'Great',
    highlights: ['Fast'],
  },
  {
    id: 'p3',
    type: 'own',
    title: 'Project 3',
    tagline: 'Third',
    tags: ['Vue', 'Vite'],
    stars: 50,
    url: 'https://c.com',
    addedAt: '2026-03-01',
    description: '',
  },
]

const mockToggleTag = vi.fn()
const mockSearch = vi.fn()

const defaultMockReturn = {
  projects: ref(mockProjects),
  filteredProjects: ref(mockProjects),
  activeType: ref('all'),
  activeTags: ref(new Set()),
  searchQuery: ref(''),
  sortBy: ref('stars'),
  allTags: ref(['React', 'Vite', 'Vue']),
  filterByType: vi.fn(),
  toggleTag: mockToggleTag,
  search: mockSearch,
  setSort: vi.fn(),
  resetFilters: vi.fn(),
}

vi.mock('../composables/useProjects.js', () => ({
  useProjects: vi.fn(() => defaultMockReturn),
}))

const mockRoute = reactive({ params: {}, query: {} })
vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => mockRoute),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

describe('ListView', () => {
  beforeEach(async () => {
    const { useProjects } = await import('../composables/useProjects.js')
    useProjects.mockReturnValue(defaultMockReturn)
    mockRoute.params = {}
    mockRoute.query = {}
    mockToggleTag.mockClear()
    mockSearch.mockClear()
  })

  it('renders a ProjectCard for each project in filteredProjects', () => {
    const wrapper = mount(ListView)
    const items = wrapper.findAll('.project-card')
    expect(items.length).toBe(3)
  })

  it('renders FilterBar', () => {
    const wrapper = mount(ListView)
    expect(wrapper.find('.filter-bar').exists()).toBe(true)
  })

  it('shows empty state when filteredProjects is empty', async () => {
    const { useProjects } = await import('../composables/useProjects.js')
    const emptyRef = ref([])
    useProjects.mockReturnValue({
      projects: ref(mockProjects),
      filteredProjects: emptyRef,
      activeType: ref('all'),
      activeTags: ref(new Set()),
      searchQuery: ref(''),
      sortBy: ref('stars'),
      allTags: ref(['React', 'Vite', 'Vue']),
      filterByType: vi.fn(),
      toggleTag: mockToggleTag,
      search: mockSearch,
      setSort: vi.fn(),
      resetFilters: vi.fn(),
    })
    const wrapper = mount(ListView)
    expect(wrapper.find('.list-view__empty').exists()).toBe(true)
    expect(wrapper.text()).toContain('没有找到匹配的项目')
  })

  it('renders project count', () => {
    const wrapper = mount(ListView)
    expect(wrapper.find('.list-view__count').exists()).toBe(true)
    expect(wrapper.find('.list-view__count').text()).toContain('3')
  })

  it('calls toggleTag with route tag param on mount', () => {
    mockRoute.params = { tag: 'Vue' }
    mount(ListView)
    expect(mockToggleTag).toHaveBeenCalledWith('Vue')
  })

  it('calls search with route query param on mount', () => {
    mockRoute.query = { q: 'react' }
    mount(ListView)
    expect(mockSearch).toHaveBeenCalledWith('react')
  })

  it('reacts when route tag param changes without remount', async () => {
    mockRoute.params = { tag: 'Vue' }
    const wrapper = mount(ListView)
    expect(mockToggleTag).toHaveBeenCalledWith('Vue')

    // Change route param without remounting
    mockRoute.params = { tag: 'React' }
    await wrapper.vm.$nextTick()
    expect(mockToggleTag).toHaveBeenCalledWith('React')
  })
})
