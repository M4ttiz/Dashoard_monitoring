import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { usePolling } from './usePolling.js'

describe('usePolling', () => {
  it('runs polling task', async () => {
    const task = vi.fn().mockResolvedValue(undefined)
    renderHook(() => usePolling(task, { intervalMs: 1, retries: 0 }))
    await new Promise((resolve) => setTimeout(resolve, 5))
    expect(task).toHaveBeenCalled()
  })
})

