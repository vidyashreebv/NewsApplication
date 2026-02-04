import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Custom hook for fetching data with loading, error, and cleanup handling
 *
 * @param {(signal: AbortSignal) => Promise<unknown>} fetchFunction - Async function to fetch data.
 * Note: memoize `fetchFunction` (e.g., with `useCallback`) to avoid refetching on every render.
 * @returns {Object} - Object containing data, loading state, error, and refetch function
 */
export const useFetch = (fetchFunction) => {
	const [data, setData] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const activeControllerRef = useRef(null);

	const runFetch = useCallback(async () => {
		activeControllerRef.current?.abort();

		const abortController = new AbortController();
		activeControllerRef.current = abortController;

		setIsLoading(true);
		setError(null);

		try {
			const result = await fetchFunction(abortController.signal);
			if (!abortController.signal.aborted) setData(result);
		} catch (err) {
			if (!abortController.signal.aborted && err?.name !== "AbortError") {
				setError(err?.message || "An error occurred while fetching data");
			}
		} finally {
			if (!abortController.signal.aborted) setIsLoading(false);
		}
	}, [fetchFunction]);

	useEffect(() => {
		void runFetch();
		return () => activeControllerRef.current?.abort();
	}, [runFetch]);

	return { data, isLoading, error, refetch: runFetch };
};
