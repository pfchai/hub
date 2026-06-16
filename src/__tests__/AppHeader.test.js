import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '../components/AppHeader.vue'

describe('AppHeader', () => {
  it('renders site name as link to home', () => {
    const wrapper = mount(AppHeader)
    const homeLink = wrapper.find('.header__logo')
    expect(homeLink.exists()).toBe(true)
    expect(homeLink.attributes('href')).toBe('#/')
    expect(homeLink.text()).toBe('Hub')
  })

  it('renders nav link to home', () => {
    const wrapper = mount(AppHeader)
    const links = wrapper.findAll('.header__nav a')
    const homeLink = links.find(l => l.text() === 'Home')
    expect(homeLink).toBeTruthy()
  })

  it('renders search input', async () => {
    const wrapper = mount(AppHeader)
    const input = wrapper.find('.header__search')
    await input.setValue('react')
    expect(input.element.value).toBe('react')
  })
})
