import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FilterBar from '../components/FilterBar.vue'

const defaultProps = {
  activeType: 'all',
  sortBy: 'stars',
}

describe('FilterBar', () => {
  it('renders type pills: 全部, Own, Curated', () => {
    const wrapper = mount(FilterBar, { props: defaultProps })
    expect(wrapper.text()).toContain('全部')
    expect(wrapper.text()).toContain('Own')
    expect(wrapper.text()).toContain('Curated')
  })

  it('highlights active type pill', () => {
    const wrapper = mount(FilterBar, {
      props: { ...defaultProps, activeType: 'own' },
    })
    const ownTab = wrapper.find('.filter-bar__tab--active')
    expect(ownTab.exists()).toBe(true)
    expect(ownTab.text()).toBe('Own')
  })

  it('emits "update:type" when a pill is clicked', async () => {
    const wrapper = mount(FilterBar, { props: defaultProps })
    await wrapper.findAll('.filter-bar__tab')[1].trigger('click')
    expect(wrapper.emitted('update:type')).toBeTruthy()
    expect(wrapper.emitted('update:type')[0]).toEqual(['own'])
  })

  it('emits "update:sortBy" when sort toggle is clicked', async () => {
    const wrapper = mount(FilterBar, { props: defaultProps })
    const sortBtn = wrapper.find('.filter-bar__sort')
    await sortBtn.trigger('click')
    expect(wrapper.emitted('update:sortBy')).toBeTruthy()
  })
})
