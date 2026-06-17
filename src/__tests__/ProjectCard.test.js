import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProjectItem from '../components/ProjectItem.vue'

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

describe('ProjectItem', () => {
  it('renders rank number, title, and tagline', () => {
    const wrapper = mount(ProjectItem, {
      props: { project: mockOwnProject, rank: 3 },
    })
    expect(wrapper.text()).toContain('3.')
    expect(wrapper.text()).toContain('Test Project')
    expect(wrapper.text()).toContain('A test project tagline')
  })

  it('renders star count', () => {
    const wrapper = mount(ProjectItem, {
      props: { project: mockOwnProject, rank: 1 },
    })
    expect(wrapper.text()).toContain('42')
  })

  it('renders own type badge for own projects', () => {
    const wrapper = mount(ProjectItem, {
      props: { project: mockOwnProject, rank: 1 },
    })
    const badges = wrapper.findAll('.project-item__type')
    expect(badges.length).toBe(1)
    expect(badges[0].text()).toBe('own')
  })

  it('renders curated type badge for curated projects', () => {
    const wrapper = mount(ProjectItem, {
      props: { project: mockCuratedProject, rank: 2 },
    })
    const badge = wrapper.find('.project-item__type--curated')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('curated')
  })

  it('links to project detail page', () => {
    const wrapper = mount(ProjectItem, {
      props: { project: mockOwnProject, rank: 1 },
    })
    const link = wrapper.find('a.project-item')
    expect(link.attributes('href')).toBe('#/project/test-project')
  })

  it('renders tags using TagBadge components', () => {
    const wrapper = mount(ProjectItem, {
      props: { project: mockOwnProject, rank: 1 },
    })
    const tags = wrapper.findAll('.project-item__tags .tag-badge')
    expect(tags.length).toBe(2)
  })

  it('renders deployment badge for local deployment', () => {
    const projectWithLocal = {
      ...mockOwnProject,
      deployment: { type: 'local', path: '/test', deployedAt: '2026-06-17', label: '测试工具' },
    }
    const wrapper = mount(ProjectItem, {
      props: { project: projectWithLocal, rank: 1 },
    })
    const badge = wrapper.find('.project-item__deploy')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toContain('测试工具')
    expect(badge.classes()).toContain('project-item__deploy--local')
  })

  it('renders deployment badge for iframe deployment', () => {
    const projectWithIframe = {
      ...mockOwnProject,
      deployment: {
        type: 'iframe',
        url: 'https://example.com',
        deployedAt: '2026-06-17',
        label: '在线体验',
      },
    }
    const wrapper = mount(ProjectItem, {
      props: { project: projectWithIframe, rank: 1 },
    })
    const badge = wrapper.find('.project-item__deploy')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toContain('在线体验')
    expect(badge.classes()).toContain('project-item__deploy--iframe')
  })
})
