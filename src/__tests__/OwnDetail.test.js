import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OwnDetail from '../components/OwnDetail.vue'

const mockProject = {
  id: 'my-project',
  type: 'own',
  title: 'My Own Project',
  tagline: 'Built with AI assistance',
  description: 'A longer description',
  tags: ['Vue', 'OpenAI'],
  stars: 128,
  url: 'https://github.com/user/repo',
  demo: 'https://demo.example.com',
  cover: '/screenshots/cover.png',
  addedAt: '2026-03-15',
  story: '## Why I built this\n\nIt was an interesting challenge.',
  techDecisions: [
    { choice: 'Vue 3', reason: 'Best fit for the project' },
    { choice: 'Vite', reason: 'Fast build times' },
  ],
  screenshots: ['/screenshots/1.png', '/screenshots/2.png'],
  lessons: '## Key takeaways\n\nAlways test your assumptions.',
}

describe('OwnDetail', () => {
  it('renders project title and tagline', () => {
    const wrapper = mount(OwnDetail, { props: { project: mockProject } })
    expect(wrapper.text()).toContain('My Own Project')
    expect(wrapper.text()).toContain('Built with AI assistance')
  })

  it('renders tags as TagBadge components', () => {
    const wrapper = mount(OwnDetail, { props: { project: mockProject } })
    const badges = wrapper.findAll('.tag-badge')
    expect(badges.length).toBe(2)
  })

  it('renders star count', () => {
    const wrapper = mount(OwnDetail, { props: { project: mockProject } })
    expect(wrapper.text()).toContain('128')
  })

  it('renders GitHub link', () => {
    const wrapper = mount(OwnDetail, { props: { project: mockProject } })
    const links = wrapper.findAll('a')
    const ghLink = links.find(l => l.attributes('href') === 'https://github.com/user/repo')
    expect(ghLink).toBeTruthy()
  })

  it('renders demo link when available', () => {
    const wrapper = mount(OwnDetail, { props: { project: mockProject } })
    const links = wrapper.findAll('a')
    const demoLink = links.find(l => l.attributes('href') === 'https://demo.example.com')
    expect(demoLink).toBeTruthy()
  })

  it('renders story as markdown HTML', () => {
    const wrapper = mount(OwnDetail, { props: { project: mockProject } })
    const story = wrapper.find('.detail__story')
    expect(story.exists()).toBe(true)
    expect(story.html()).toContain('Why I built this')
  })

  it('renders tech decisions list', () => {
    const wrapper = mount(OwnDetail, { props: { project: mockProject } })
    const decisions = wrapper.find('.detail__decisions')
    expect(decisions.exists()).toBe(true)
    expect(decisions.text()).toContain('Vue 3')
    expect(decisions.text()).toContain('Best fit for the project')
  })

  it('renders screenshots section', () => {
    const wrapper = mount(OwnDetail, { props: { project: mockProject } })
    const screenshots = wrapper.find('.detail__screenshots')
    expect(screenshots.exists()).toBe(true)
    expect(wrapper.findAll('.detail__screenshot').length).toBe(2)
  })

  it('renders lessons as markdown HTML', () => {
    const wrapper = mount(OwnDetail, { props: { project: mockProject } })
    const lessons = wrapper.find('.detail__lessons')
    expect(lessons.exists()).toBe(true)
    expect(lessons.html()).toContain('Key takeaways')
  })

  it('does not render demo link if project has no demo', () => {
    const noDemo = { ...mockProject, demo: undefined }
    const wrapper = mount(OwnDetail, { props: { project: noDemo } })
    const links = wrapper.findAll('a')
    const demoLink = links.find(l => l.text().includes('Live Demo'))
    expect(demoLink).toBeFalsy()
  })

  it('renders local deployment link when project has local deployment', () => {
    const projectWithLocal = {
      ...mockProject,
      deployment: { type: 'local', path: '/my-tool', deployedAt: '2026-06-17', label: '我的工具' },
    }
    const wrapper = mount(OwnDetail, { props: { project: projectWithLocal } })
    const section = wrapper.find('.detail__deployment')
    expect(section.exists()).toBe(true)
    expect(section.text()).toContain('我的工具')
    expect(wrapper.find('.detail__deploy-link').attributes('href')).toBe('/my-tool')
  })

  it('renders iframe for iframe-type deployment', () => {
    const projectWithIframe = {
      ...mockProject,
      deployment: { type: 'iframe', url: 'https://example.com', deployedAt: '2026-06-17', label: '在线工具' },
    }
    const wrapper = mount(OwnDetail, { props: { project: projectWithIframe } })
    expect(wrapper.find('.detail__iframe').exists()).toBe(true)
  })
})
