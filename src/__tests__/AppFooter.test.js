import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppFooter from '../components/AppFooter.vue'

describe('AppFooter', () => {
  it('renders footer text', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.text()).toContain('Built with Vue + Vite')
    expect(wrapper.text()).toContain('Curated by hand')
  })

  it('has footer class', () => {
    const wrapper = mount(AppFooter)
    expect(wrapper.find('.footer').exists()).toBe(true)
  })
})
