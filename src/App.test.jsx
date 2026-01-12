import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { App } from './App'
import * as spaceNewsApi from './services/spaceNewsApi'

vi.mock('./services/spaceNewsApi')

describe('App', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Mock to return empty array by default to prevent auto-loading in tests
        spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue([])
    })

    it('should render the SpaceNewsPage component', () => {
        render(<App />)

        expect(
            screen.getByText('🚀 Spaceflight News Dashboard')
        ).toBeInTheDocument()
    })

    it('should render load articles button', async () => {
        render(<App />)

        // Wait for initial load to complete
        await waitFor(() => {
            const loadButton = screen.getByRole('button', { name: /load articles/i })
            expect(loadButton).toBeInTheDocument()
        })
    })
})
