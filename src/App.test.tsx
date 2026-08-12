import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('renders the harness placeholder', () => {
    render(<App />)
    expect(screen.getByText(/harness scaffold/i)).toBeInTheDocument()
  })
})
