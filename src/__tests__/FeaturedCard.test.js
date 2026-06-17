import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FeaturedCard from '../components/FeaturedCard.vue'

const mockOwnProject = {
  id: 'test-project',
  type: 'own',
  title: 'Test Project',
  tagline: 'A test project tagline for testing',
  tags: ['Vue', 'Vite'],
  stars: 42,
  url: 'https://github.com/test/project',
  addedAt: '2026-01-01',
  description: 'Test description',
}

const mockCuratedProject = {
  id: 'curated-project',
  type: 'curated',
  title: 'Curated Project',
  tagline: 'A curated project tagline',
  tags: ['React'],
  stars: 1000,
  url: 'https://github.com/curated/project',
  addedAt: '2026-01-01',
  description: 'Curated description',
  whyRecommend: 'Great project',
  highlights: ['Fast', 'Reliable'],
}

describe('FeaturedCard', () => {
  it('renders the project title in the preview area', () => {
    const wrapper = mount(FeaturedCard, {
      props: { project: mockOwnProject },
    })
    expect(wrapper.find('.featured-card__preview-title').text()).toBe('Test Project')
  })

  it('renders the project title in the body', () => {
    const wrapper = mount(FeaturedCard, {
      props: { project: mockOwnProject },
    })
    expect(wrapper.find('.featured-card__title').text()).toBe('Test Project')
  })

  it('renders the tagline', () => {
    const wrapper = mount(FeaturedCard, {
      props: { project: mockOwnProject },
    })
    expect(wrapper.find('.featured-card__tagline').text()).toContain('A test project tagline')
  })

  it('renders tags in the preview area', () => {
    const wrapper = mount(FeaturedCard, {
      props: { project: mockOwnProject },
    })
    const tags = wrapper.findAll('.featured-card__tag')
    expect(tags.length).toBe(2)
    expect(tags[0].text()).toBe('Vue')
    expect(tags[1].text()).toBe('Vite')
  })

  it('renders star count', () => {
    const wrapper = mount(FeaturedCard, {
      props: { project: mockOwnProject },
    })
    expect(wrapper.text()).toContain('42')
  })

  it('formats star count with k suffix for large numbers', () => {
    const wrapper = mount(FeaturedCard, {
      props: { project: mockCuratedProject },
    })
    expect(wrapper.text()).toContain('1k')
  })

  it('renders own type badge for own projects', () => {
    const wrapper = mount(FeaturedCard, {
      props: { project: mockOwnProject },
    })
    const badge = wrapper.find('.featured-card__type--own')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('own')
  })

  it('renders curated type badge for curated projects', () => {
    const wrapper = mount(FeaturedCard, {
      props: { project: mockCuratedProject },
    })
    const badge = wrapper.find('.featured-card__type--curated')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('curated')
  })

  it('renders the action link text', () => {
    const wrapper = mount(FeaturedCard, {
      props: { project: mockOwnProject },
    })
    expect(wrapper.find('.featured-card__action').text()).toContain('查看')
  })

  it('links to the project detail page', () => {
    const wrapper = mount(FeaturedCard, {
      props: { project: mockOwnProject },
    })
    const link = wrapper.find('a.featured-card')
    expect(link.attributes('href')).toBe('#/project/test-project')
  })

  it('applies own gradient for own projects', () => {
    const wrapper = mount(FeaturedCard, {
      props: { project: mockOwnProject },
    })
    const preview = wrapper.find('.featured-card__preview')
    const style = preview.attributes('style')
    expect(style).toContain('linear-gradient')
    expect(style).toContain('#2563eb')
    expect(style).toContain('#7c3aed')
  })

  it('applies curated gradient for curated projects', () => {
    const wrapper = mount(FeaturedCard, {
      props: { project: mockCuratedProject },
    })
    const preview = wrapper.find('.featured-card__preview')
    const style = preview.attributes('style')
    expect(style).toContain('linear-gradient')
    expect(style).toContain('#7c3aed')
    expect(style).toContain('#db2777')
  })

  it('does not render tags when project has none', () => {
    const wrapper = mount(FeaturedCard, {
      props: {
        project: { ...mockOwnProject, tags: [] },
      },
    })
    expect(wrapper.find('.featured-card__preview-tags').exists()).toBe(false)
  })

  it('renders default own gradient for unknown type', () => {
    const wrapper = mount(FeaturedCard, {
      props: {
        project: { ...mockOwnProject, type: 'unknown' },
      },
    })
    const preview = wrapper.find('.featured-card__preview')
    const style = preview.attributes('style')
    expect(style).toContain('#2563eb')
  })
})
