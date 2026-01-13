import { useState, useEffect } from 'react'

/**
 * Custom hook for fetching data with loading, error, and cleanup handling
 * @param {Function} fetchFunction - The async function to fetch data
 * @param {Array} dependencies - Dependencies array for useEffect
 * @returns {Object} - Object containing data, loading state, error, and refetch function
 */
export const useFetch = (fetchFunction, dependencies = []) => {
    const [data, setData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const abortController = new AbortController()
        let isMounted = true

        const fetchData = async () => {
            setIsLoading(true)
            setError(null)

            try {
                const result = await fetchFunction(abortController.signal)
                
                // Only update state if component is still mounted
                if (isMounted && !abortController.signal.aborted) {
                    setData(result)
                }
            } catch (err) {
                // Don't set error if request was aborted
                if (isMounted && err.name !== 'AbortError') {
                    setError(err.message || 'An error occurred while fetching data')
                    console.error('Fetch error:', err)
                }
            } finally {
                // Only update loading state if component is still mounted
                if (isMounted && !abortController.signal.aborted) {
                    setIsLoading(false)
                }
            }
        }

        fetchData()

        // Cleanup function to abort fetch and prevent state updates on unmount
        return () => {
            isMounted = false
            abortController.abort()
        }
    }, dependencies)

    // Manual refetch function
    const refetch = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const result = await fetchFunction()
            setData(result)
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message || 'An error occurred while fetching data')
                console.error('Fetch error:', err)
            }
        } finally {
            setIsLoading(false)
        }
    }

    return { data, isLoading, error, refetch }
}
