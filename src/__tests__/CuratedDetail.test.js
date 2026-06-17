import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CuratedDetail from '../components/CuratedDetail.vue'

const mockProject = {
  id: 'cool-project',
  type: 'curated',
  title: 'Cool Open Source',
  tagline: 'An amazing tool',
  description: 'A longer description of this cool project.',
  tags: ['React', 'TypeScript'],
  stars: 5000,
  url: 'https://github.com/cool/project',
  addedAt: '2026-02-01',
  whyRecommend: 'This project changed how I think about state management.',
  highlights: ['Blazing fast performance', 'Excellent developer experience', 'Great documentation'],
}

describe('CuratedDetail', () => {
  it('renders project title and tagline', () => {
    const wrapper = mount(CuratedDetail, { props: { project: mockProject } })
    expect(wrapper.text()).toContain('Cool Open Source')
    expect(wrapper.text()).toContain('An amazing tool')
  })

  it('renders tags in sidebar as dark pills', () => {
    const wrapper = mount(CuratedDetail, { props: { project: mockProject } })
    const tags = wrapper.findAll('.sidebar__tag')
    expect(tags.length).toBe(2)
    expect(tags[0].text()).toBe('React')
    expect(tags[1].text()).toBe('TypeScript')
  })

  it('renders formatted star count', () => {
    const wrapper = mount(CuratedDetail, { props: { project: mockProject } })
    expect(wrapper.text()).toContain('5k')
  })

  it('renders GitHub link', () => {
    const wrapper = mount(CuratedDetail, { props: { project: mockProject } })
    const links = wrapper.findAll('a')
    const ghLink = links.find((l) => l.attributes('href') === 'https://github.com/cool/project')
    expect(ghLink).toBeTruthy()
  })

  it('renders description section', () => {
    const wrapper = mount(CuratedDetail, { props: { project: mockProject } })
    expect(wrapper.text()).toContain('A longer description of this cool project.')
  })

  it('renders whyRecommend section', () => {
    const wrapper = mount(CuratedDetail, { props: { project: mockProject } })
    expect(wrapper.text()).toContain('This project changed how I think about state management.')
  })

  it('renders highlights list', () => {
    const wrapper = mount(CuratedDetail, { props: { project: mockProject } })
    const highlights = wrapper.find('.detail__highlights')
    expect(highlights.exists()).toBe(true)
    const items = highlights.findAll('li')
    expect(items.length).toBe(3)
    expect(items[0].text()).toContain('Blazing fast performance')
  })

  it('does not show demo link (curated projects have no demo)', () => {
    const wrapper = mount(CuratedDetail, { props: { project: mockProject } })
    const links = wrapper.findAll('a')
    const demoLink = links.find((l) => l.text().includes('Demo'))
    expect(demoLink).toBeFalsy()
  })

  it('renders iframe deployment section for iframe-type deployment', () => {
    const projectWithIframe = {
      ...mockProject,
      deployment: {
        type: 'iframe',
        url: 'https://example.com',
        deployedAt: '2026-06-17',
        label: '在线体验',
      },
    }
    const wrapper = mount(CuratedDetail, { props: { project: projectWithIframe } })
    const section = wrapper.find('.detail__deployment')
    expect(section.exists()).toBe(true)
    expect(section.text()).toContain('在线体验')
    expect(section.text()).toContain('2026-06-17')
    expect(wrapper.find('.detail__iframe').exists()).toBe(true)
  })

  it('renders local deployment link for local-type deployment', () => {
    const projectWithLocal = {
      ...mockProject,
      deployment: {
        type: 'local',
        path: '/test-tool',
        deployedAt: '2026-06-17',
        label: '测试工具',
      },
    }
    const wrapper = mount(CuratedDetail, { props: { project: projectWithLocal } })
    const section = wrapper.find('.detail__deployment')
    expect(section.exists()).toBe(true)
    const link = wrapper.find('.detail__deploy-link')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('/test-tool')
    expect(link.text()).toContain('测试工具')
  })
})
