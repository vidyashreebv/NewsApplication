import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SearchInput } from './SearchInput'

describe('SearchInput', () => {
    it('should render search input with label', () => {
        const mockOnChange = vi.fn()
        render(<SearchInput value="" onChange={mockOnChange} />)

        const label = screen.getByText('Search Articles')
        const input = screen.getByLabelText('Search space news articles by title')

        expect(label).toBeInTheDocument()
        expect(input).toBeInTheDocument()
    })

    it('should display the provided value', () => {
        const mockOnChange = vi.fn()
        render(<SearchInput value="SpaceX" onChange={mockOnChange} />)

        const input = screen.getByDisplayValue('SpaceX')
        expect(input).toBeInTheDocument()
    })

    it('should call onChange when user types', () => {
        const mockOnChange = vi.fn()
        render(<SearchInput value="" onChange={mockOnChange} />)

        const input = screen.getByLabelText('Search space news articles by title')
        fireEvent.change(input, { target: { value: 'NASA' } })

        expect(mockOnChange).toHaveBeenCalledWith('NASA')
        expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    it('should display custom placeholder when provided', () => {
        const mockOnChange = vi.fn()
        render(
            <SearchInput
                value=""
                onChange={mockOnChange}
                placeholder="Find articles..."
            />
        )

        const input = screen.getByPlaceholderText('Find articles...')
        expect(input).toBeInTheDocument()
    })

    it('should display default placeholder when not provided', () => {
        const mockOnChange = vi.fn()
        render(<SearchInput value="" onChange={mockOnChange} />)

        const input = screen.getByPlaceholderText('Search by title...')
        expect(input).toBeInTheDocument()
    })

    it('should have proper accessibility attributes', () => {
        const mockOnChange = vi.fn()
        render(<SearchInput value="" onChange={mockOnChange} />)

        const input = screen.getByRole('textbox', {
            name: /search space news articles by title/i,
        })
        const label = screen.getByLabelText('Search space news articles by title')

        expect(input).toHaveAttribute('id', 'search-articles')
        expect(label).toBeInTheDocument()
    })

    it('should handle multiple rapid changes', () => {
        const mockOnChange = vi.fn()
        render(<SearchInput value="" onChange={mockOnChange} />)

        const input = screen.getByLabelText('Search space news articles by title')

        fireEvent.change(input, { target: { value: 'S' } })
        fireEvent.change(input, { target: { value: 'Sp' } })
        fireEvent.change(input, { target: { value: 'Spa' } })

        expect(mockOnChange).toHaveBeenCalledTimes(3)
    })
})
