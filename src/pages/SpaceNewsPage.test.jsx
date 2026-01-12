import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SpaceNewsPage } from './SpaceNewsPage'
import * as spaceNewsApi from '../services/spaceNewsApi'

vi.mock('../services/spaceNewsApi')

describe('SpaceNewsPage', () => {
    const mockArticles = [
        {
            id: 1,
            title: 'SpaceX Launches Starship',
            news_site: 'Space.com',
            url: 'https://example.com/spacex',
        },
        {
            id: 2,
            title: 'NASA Mars Rover Discovery',
            news_site: 'NASA.gov',
            url: 'https://example.com/nasa',
        },
        {
            id: 3,
            title: 'SpaceX Dragon Returns to Earth',
            news_site: 'SpaceNews',
            url: 'https://example.com/dragon',
        },
    ]

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render page title and description', () => {
        render(<SpaceNewsPage />)

        expect(
            screen.getByText('🚀 Spaceflight News Dashboard')
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Discover the latest news from space exploration and science'
            )
        ).toBeInTheDocument()
    })

    it('should show empty state before loading articles', () => {
        render(<SpaceNewsPage />)

        expect(screen.getByText('No Articles Loaded')).toBeInTheDocument()
        expect(
            screen.getByText('Click "Load Articles" to fetch the latest space news')
        ).toBeInTheDocument()
    })

    it('should display load articles button', () => {
        render(<SpaceNewsPage />)

        const loadButton = screen.getByRole('button', { name: /load articles/i })
        expect(loadButton).toBeInTheDocument()
    })

    it('should fetch and display articles when load button is clicked', async () => {
        spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(mockArticles)

        render(<SpaceNewsPage />)

        const loadButton = screen.getByRole('button', { name: /load articles/i })
        fireEvent.click(loadButton)

        await waitFor(() => {
            expect(screen.getByText('SpaceX Launches Starship')).toBeInTheDocument()
            expect(
                screen.getByText('NASA Mars Rover Discovery')
            ).toBeInTheDocument()
            expect(
                screen.getByText('SpaceX Dragon Returns to Earth')
            ).toBeInTheDocument()
        })

        expect(spaceNewsApi.fetchSpaceNewsArticles).toHaveBeenCalledTimes(1)
    })

    it('should show loading state while fetching articles', async () => {
        spaceNewsApi.fetchSpaceNewsArticles.mockImplementation(
            () => new Promise((resolve) => setTimeout(() => resolve(mockArticles), 100))
        )

        render(<SpaceNewsPage />)

        const loadButton = screen.getByRole('button', { name: /load articles/i })
        fireEvent.click(loadButton)

        expect(screen.getByText('Loading...')).toBeInTheDocument()
        expect(loadButton).toBeDisabled()

        await waitFor(() => {
            expect(screen.getByText('SpaceX Launches Starship')).toBeInTheDocument()
        })
    })

    it('should display error message when API call fails', async () => {
        spaceNewsApi.fetchSpaceNewsArticles.mockRejectedValue(
            new Error('Network error')
        )

        render(<SpaceNewsPage />)

        const loadButton = screen.getByRole('button', { name: /load articles/i })
        fireEvent.click(loadButton)

        await waitFor(() => {
            expect(
                screen.getByText('Failed to load articles. Please try again.')
            ).toBeInTheDocument()
        })
    })

    it('should show search input after articles are loaded', async () => {
        spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(mockArticles)

        render(<SpaceNewsPage />)

        expect(screen.queryByLabelText(/search/i)).not.toBeInTheDocument()

        const loadButton = screen.getByRole('button', { name: /load articles/i })
        fireEvent.click(loadButton)

        await waitFor(() => {
            expect(screen.getByLabelText(/search/i)).toBeInTheDocument()
        })
    })

    it('should filter articles based on search query', async () => {
        spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(mockArticles)

        render(<SpaceNewsPage />)

        const loadButton = screen.getByRole('button', { name: /load articles/i })
        fireEvent.click(loadButton)

        await waitFor(() => {
            expect(screen.getByText('SpaceX Launches Starship')).toBeInTheDocument()
        })

        const searchInput = screen.getByLabelText(/search/i)
        fireEvent.change(searchInput, { target: { value: 'SpaceX' } })

        expect(screen.getByText('SpaceX Launches Starship')).toBeInTheDocument()
        expect(
            screen.getByText('SpaceX Dragon Returns to Earth')
        ).toBeInTheDocument()
        expect(
            screen.queryByText('NASA Mars Rover Discovery')
        ).not.toBeInTheDocument()
    })

    it('should show no results state when search has no matches', async () => {
        spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(mockArticles)

        render(<SpaceNewsPage />)

        const loadButton = screen.getByRole('button', { name: /load articles/i })
        fireEvent.click(loadButton)

        await waitFor(() => {
            expect(screen.getByText('SpaceX Launches Starship')).toBeInTheDocument()
        })

        const searchInput = screen.getByLabelText(/search/i)
        fireEvent.change(searchInput, { target: { value: 'Pluto' } })

        expect(screen.getByText('No Results Found')).toBeInTheDocument()
        expect(
            screen.getByText('No articles match "Pluto". Try a different search term.')
        ).toBeInTheDocument()
    })

    it('should display correct article count', async () => {
        spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(mockArticles)

        render(<SpaceNewsPage />)

        const loadButton = screen.getByRole('button', { name: /load articles/i })
        fireEvent.click(loadButton)

        await waitFor(() => {
            expect(screen.getByText('Showing 3 of 3 articles')).toBeInTheDocument()
        })
    })

    it('should update article count when filtering', async () => {
        spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(mockArticles)

        render(<SpaceNewsPage />)

        const loadButton = screen.getByRole('button', { name: /load articles/i })
        fireEvent.click(loadButton)

        await waitFor(() => {
            expect(screen.getByText('Showing 3 of 3 articles')).toBeInTheDocument()
        })

        const searchInput = screen.getByLabelText(/search/i)
        fireEvent.change(searchInput, { target: { value: 'NASA' } })

        expect(screen.getByText('Showing 1 of 3 articles')).toBeInTheDocument()
    })

    it('should perform case-insensitive search', async () => {
        spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(mockArticles)

        render(<SpaceNewsPage />)

        const loadButton = screen.getByRole('button', { name: /load articles/i })
        fireEvent.click(loadButton)

        await waitFor(() => {
            expect(screen.getByText('SpaceX Launches Starship')).toBeInTheDocument()
        })

        const searchInput = screen.getByLabelText(/search/i)
        fireEvent.change(searchInput, { target: { value: 'spacex' } })

        expect(screen.getByText('SpaceX Launches Starship')).toBeInTheDocument()
        expect(
            screen.getByText('SpaceX Dragon Returns to Earth')
        ).toBeInTheDocument()
    })
})
