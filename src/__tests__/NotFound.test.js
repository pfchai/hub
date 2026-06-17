import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NotFound from '../views/NotFound.vue'

describe('NotFound', () => {
  it('renders not found heading', () => {
    const wrapper = mount(NotFound)
    expect(wrapper.text()).toContain('页面不存在')
  })

  it('has a link back to home', () => {
    const wrapper = mount(NotFound)
    const link = wrapper.find('a')
    expect(link.attributes('href')).toBe('#/')
    expect(link.text()).toContain('返回首页')
  })
})
