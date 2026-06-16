import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TagBadge from '../components/TagBadge.vue'

describe('TagBadge', () => {
  it('renders the tag text', () => {
    const wrapper = mount(TagBadge, { props: { tag: 'Vue' } })
    expect(wrapper.text()).toContain('Vue')
    expect(wrapper.classes()).toContain('tag-badge')
  })

  it('renders as a link when clickable is true', () => {
    const wrapper = mount(TagBadge, {
      props: { tag: 'React', clickable: true }
    })
    expect(wrapper.find('a').exists()).toBe(true)
    expect(wrapper.find('a').attributes('href')).toBe('#/tag/React')
  })

  it('renders as a span when clickable is false', () => {
    const wrapper = mount(TagBadge, {
      props: { tag: 'React', clickable: false }
    })
    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.find('span').exists()).toBe(true)
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(TagBadge, {
      props: { tag: 'Vue', clickable: true }
    })
    await wrapper.find('a').trigger('click')
    expect(wrapper.emitted('tag-click')).toBeTruthy()
    expect(wrapper.emitted('tag-click')[0]).toEqual(['Vue'])
  })
})
