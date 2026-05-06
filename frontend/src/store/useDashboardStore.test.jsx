import { describe, expect, it } from 'vitest'

import { useDashboardStore } from './useDashboardStore.js'

describe('useDashboardStore', () => {
  it('updates theme', () => {
    useDashboardStore.getState().setTheme('light')
    expect(useDashboardStore.getState().ui.theme).toBe('light')
  })
})

