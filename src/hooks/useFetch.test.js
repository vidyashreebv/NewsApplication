import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useFetch } from './useFetch'

describe('useFetch', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
        console.error.mockRestore()
    })

    it('should initialize with correct default states', async () => {
        const mockFetchFunction = vi.fn().mockResolvedValue([])
        const { result } = renderHook(() => useFetch(mockFetchFunction, []))

        // Wait for the effect to complete
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toEqual([])
        expect(result.current.error).toBeNull()
        expect(typeof result.current.refetch).toBe('function')
    })

    it('should fetch data successfully', async () => {
        const mockData = [{ id: 1, title: 'Test Article' }]
        const mockFetchFunction = vi.fn().mockResolvedValue(mockData)

        const { result } = renderHook(() => useFetch(mockFetchFunction, []))

        // Initially loading should be true
        expect(result.current.isLoading).toBe(true)

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toEqual(mockData)
        expect(result.current.error).toBeNull()
        expect(mockFetchFunction).toHaveBeenCalledTimes(1)
    })

    it('should handle fetch errors correctly', async () => {
        const mockError = new Error('Fetch failed')
        const mockFetchFunction = vi.fn().mockRejectedValue(mockError)

        const { result } = renderHook(() => useFetch(mockFetchFunction, []))

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toBeNull()
        expect(result.current.error).toBe('Fetch failed')
        expect(console.error).toHaveBeenCalledWith('Fetch error:', mockError)
    })

    it('should handle errors without message property', async () => {
        const mockFetchFunction = vi.fn().mockRejectedValue('String error')

        const { result } = renderHook(() => useFetch(mockFetchFunction, []))

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.error).toBe('An error occurred while fetching data')
    })

    it('should not set error for AbortError', async () => {
        const abortError = new Error('The operation was aborted')
        abortError.name = 'AbortError'
        const mockFetchFunction = vi.fn().mockRejectedValue(abortError)

        const { result } = renderHook(() => useFetch(mockFetchFunction, []))

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.error).toBeNull()
    })

    it('should cleanup on unmount and abort fetch', async () => {
        const mockFetchFunction = vi.fn(
            (signal) =>
                new Promise((resolve, reject) => {
                    signal.addEventListener('abort', () => {
                        const error = new Error('Aborted')
                        error.name = 'AbortError'
                        reject(error)
                    })
                    setTimeout(() => resolve([{ id: 1 }]), 100)
                })
        )

        const { result, unmount } = renderHook(() =>
            useFetch(mockFetchFunction, [])
        )

        expect(result.current.isLoading).toBe(true)

        // Unmount before fetch completes
        unmount()

        await waitFor(() => {
            expect(mockFetchFunction).toHaveBeenCalledTimes(1)
        })

        // Verify abort signal was passed
        expect(mockFetchFunction.mock.calls[0][0]).toBeInstanceOf(AbortSignal)
    })

    it('should handle refetch errors correctly', async () => {
        const mockData = [{ id: 1, title: 'Article 1' }]
        const mockError = new Error('Refetch failed')
        const mockFetchFunction = vi
            .fn()
            .mockResolvedValueOnce(mockData)
            .mockRejectedValueOnce(mockError)

        const { result } = renderHook(() => useFetch(mockFetchFunction, []))

        // Wait for initial fetch
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toEqual(mockData)
        expect(result.current.error).toBeNull()

        // Call refetch which will fail
        result.current.refetch()

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.error).toBe('Refetch failed')
        expect(console.error).toHaveBeenCalledWith('Fetch error:', mockError)
    })

    it('should refetch when dependencies change', async () => {
        const mockData1 = [{ id: 1, title: 'Article 1' }]
        const mockData2 = [{ id: 2, title: 'Article 2' }]
        const mockFetchFunction = vi
            .fn()
            .mockResolvedValueOnce(mockData1)
            .mockResolvedValueOnce(mockData2)

        const { result, rerender } = renderHook(
            ({ deps }) => useFetch(mockFetchFunction, deps),
            { initialProps: { deps: [1] } }
        )

        // Wait for initial fetch
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toEqual(mockData1)

        // Change dependencies
        rerender({ deps: [2] })

        // Wait for refetch
        await waitFor(() => {
            expect(result.current.isLoading).toBe(false)
        })

        expect(result.current.data).toEqual(mockData2)
        expect(mockFetchFunction).toHaveBeenCalledTimes(2)
    })

    it('should pass abort signal to fetch function', async () => {
        const mockFetchFunction = vi.fn().mockResolvedValue([])

        renderHook(() => useFetch(mockFetchFunction, []))

        await waitFor(() => {
            expect(mockFetchFunction).toHaveBeenCalledTimes(1)
        })

        const callArguments = mockFetchFunction.mock.calls[0]
        expect(callArguments[0]).toBeInstanceOf(AbortSignal)
    })
})
