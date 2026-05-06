import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import Overview from './Overview.jsx'

describe('Overview page', () => {
  it('renders dashboard title', () => {
    render(
      <MemoryRouter>
        <Overview isConnected />
      </MemoryRouter>,
    )
    expect(screen.getByText('MISAT Monitor')).toBeInTheDocument()
  })
})

