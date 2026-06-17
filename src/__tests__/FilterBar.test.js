import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FilterBar from '../components/FilterBar.vue'

const defaultProps = {
  activeType: 'all',
  activeTags: new Set(),
  allTags: ['React', 'TypeScript', 'Vite', 'Vue'],
  searchQuery: '',
  sortBy: 'stars',
}

describe('FilterBar', () => {
  it('renders type tabs: 全部, Own, Curated', () => {
    const wrapper = mount(FilterBar, { props: defaultProps })
    expect(wrapper.text()).toContain('全部')
    expect(wrapper.text()).toContain('Own')
    expect(wrapper.text()).toContain('Curated')
  })

  it('highlights active type tab', () => {
    const wrapper = mount(FilterBar, {
      props: { ...defaultProps, activeType: 'own' },
    })
    const ownTab = wrapper.find('.filter-bar__tab--active')
    expect(ownTab.exists()).toBe(true)
    expect(ownTab.text()).toBe('Own')
  })

  it('emits "update:type" when a tab is clicked', async () => {
    const wrapper = mount(FilterBar, { props: defaultProps })
    await wrapper.findAll('.filter-bar__tab')[1].trigger('click')
    expect(wrapper.emitted('update:type')).toBeTruthy()
    expect(wrapper.emitted('update:type')[0]).toEqual(['own'])
  })

  it('renders tag chips from allTags', () => {
    const wrapper = mount(FilterBar, { props: defaultProps })
    const tagButtons = wrapper.findAll('.filter-bar__tag')
    expect(tagButtons.length).toBe(4)
  })

  it('highlights active tags', () => {
    const wrapper = mount(FilterBar, {
      props: { ...defaultProps, activeTags: new Set(['Vue']) },
    })
    const vueTag = wrapper.findAll('.filter-bar__tag--active')
    expect(vueTag.length).toBe(1)
    expect(vueTag[0].text()).toBe('Vue')
  })

  it('emits "toggle-tag" when a tag is clicked', async () => {
    const wrapper = mount(FilterBar, { props: defaultProps })
    await wrapper.findAll('.filter-bar__tag')[0].trigger('click')
    expect(wrapper.emitted('toggle-tag')).toBeTruthy()
    expect(wrapper.emitted('toggle-tag')[0]).toEqual(['React'])
  })

  it('emits "update:search" when search input changes', async () => {
    const wrapper = mount(FilterBar, { props: defaultProps })
    const input = wrapper.find('.filter-bar__search')
    await input.setValue('gpt')
    expect(wrapper.emitted('update:search')).toBeTruthy()
  })

  it('emits "update:sortBy" when sort toggle is clicked', async () => {
    const wrapper = mount(FilterBar, { props: defaultProps })
    const sortBtn = wrapper.find('.filter-bar__sort')
    await sortBtn.trigger('click')
    expect(wrapper.emitted('update:sortBy')).toBeTruthy()
  })

  it('shows search input value from prop', () => {
    const wrapper = mount(FilterBar, {
      props: { ...defaultProps, searchQuery: 'react' },
    })
    const input = wrapper.find('.filter-bar__search').element
    expect(input.value).toBe('react')
  })
})
