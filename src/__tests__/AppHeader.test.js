import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '../components/AppHeader.vue'

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({ push: mockPush })),
  useRoute: vi.fn(() => ({ path: '/' })),
}))

describe('AppHeader', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('renders logo with dot as link to home', () => {
    const wrapper = mount(AppHeader)
    const logo = wrapper.find('.header__logo')
    expect(logo.exists()).toBe(true)
    expect(logo.attributes('href')).toBe('#/')
    expect(logo.text()).toBe('Hub.')
  })

  it('renders Home nav link', () => {
    const wrapper = mount(AppHeader)
    const links = wrapper.findAll('.header__nav a')
    const homeLink = links.find((l) => l.text() === 'Home')
    expect(homeLink).toBeTruthy()
    expect(homeLink.attributes('href')).toBe('#/')
  })

  it('renders About nav link', () => {
    const wrapper = mount(AppHeader)
    const links = wrapper.findAll('.header__nav a')
    const aboutLink = links.find((l) => l.text() === 'About')
    expect(aboutLink).toBeTruthy()
    expect(aboutLink.attributes('href')).toBe('#/about')
  })

  it('renders search trigger button', () => {
    const wrapper = mount(AppHeader)
    const trigger = wrapper.find('.header__search-trigger')
    expect(trigger.exists()).toBe(true)
  })

  it('shows search popover on trigger click', async () => {
    const wrapper = mount(AppHeader)
    const trigger = wrapper.find('.header__search-trigger')
    await trigger.trigger('click')
    const popover = wrapper.find('.header__search-popover')
    expect(popover.exists()).toBe(true)
    const input = wrapper.find('.header__search-input')
    expect(input.exists()).toBe(true)
  })

  it('navigates to search page on Enter key', async () => {
    const wrapper = mount(AppHeader)
    // Open popover and type
    await wrapper.find('.header__search-trigger').trigger('click')
    const input = wrapper.find('.header__search-input')
    await input.setValue('vue')
    await input.trigger('keydown.enter')
    expect(mockPush).toHaveBeenCalledWith({ name: 'search', query: { q: 'vue' } })
  })

  it('closes popover on Escape key', async () => {
    const wrapper = mount(AppHeader)
    await wrapper.find('.header__search-trigger').trigger('click')
    expect(wrapper.find('.header__search-popover').exists()).toBe(true)
    await wrapper.find('.header__search-input').trigger('keydown.escape')
    // After closeSearch, popover should be hidden
    expect(wrapper.find('.header__search-popover').exists()).toBe(false)
  })
})
