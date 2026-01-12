import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from './App'

describe('App', () => {
    it('should render the SpaceNewsPage component', () => {
        render(<App />)

        expect(
            screen.getByText('🚀 Spaceflight News Dashboard')
        ).toBeInTheDocument()
    })

    it('should render load articles button', () => {
        render(<App />)

        const loadButton = screen.getByRole('button', { name: /load articles/i })
        expect(loadButton).toBeInTheDocument()
    })
})
