import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectCard from '../components/ProjectCard.vue'

const mockOwnProject = {
  id: 'test-project',
  type: 'own',
  title: 'Test Project',
  tagline: 'A test project tagline',
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

describe('ProjectCard', () => {
  it('renders title and tagline', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: mockOwnProject },
    })
    expect(wrapper.text()).toContain('Test Project')
    expect(wrapper.text()).toContain('A test project tagline')
  })

  it('renders star count', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: mockOwnProject },
    })
    expect(wrapper.text()).toContain('42')
  })

  it('renders formatted stars for 1000+', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: mockCuratedProject },
    })
    expect(wrapper.text()).toContain('1k')
  })

  it('renders own type badge for own projects', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: mockOwnProject },
    })
    const badge = wrapper.find('.project-card__type--own')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('own')
  })

  it('renders curated type badge for curated projects', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: mockCuratedProject },
    })
    const badge = wrapper.find('.project-card__type--curated')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('curated')
  })

  it('links to project detail page', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: mockOwnProject },
    })
    const link = wrapper.find('.project-card__main')
    expect(link.attributes('href')).toBe('#/m/curation/project/test-project')
  })

  it('renders tags using TagBadge components', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: mockOwnProject },
    })
    const tags = wrapper.findAll('.project-card__tags .tag-badge')
    expect(tags.length).toBe(2)
  })

  it('does not render a rank number', () => {
    const wrapper = mount(ProjectCard, {
      props: { project: mockOwnProject },
    })
    expect(wrapper.text()).not.toContain('1.')
  })
})
