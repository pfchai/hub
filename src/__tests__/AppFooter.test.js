import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFooter from '../components/AppFooter.vue'

describe('AppFooter', () => {
  it('renders personal intro', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.text()).toContain('pfchai')
    expect(wrapper.text()).toContain('写代码')
  })

  it('renders social links', () => {
    const wrapper = mount(AppFooter)
    const links = wrapper.findAll('.footer__link')
    const linkTexts = links.map((l) => l.text())
    expect(linkTexts).toContain('GitHub')
    expect(linkTexts).toContain('Twitter')
    expect(linkTexts).toContain('Blog')
    expect(linkTexts).toContain('RSS')
  })

  it('renders copyright', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.text()).toContain('2026')
    expect(wrapper.text()).toContain('Hub')
  })

  it('has footer class', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.find('.footer').exists()).toBe(true)
  })
})
