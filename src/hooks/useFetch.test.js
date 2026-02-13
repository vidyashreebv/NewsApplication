import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFetch } from "./useFetch";

const mockArticleData = [{ id: 1, title: "Test Article" }];
const mockArticlesData = [{ id: 1, title: "Article 1" }];
const mockFirstFetchData = ["data1"];
const mockSecondFetchData = ["data2"];

const FETCH_ERROR_MESSAGE = "Fetch failed";
const REFETCH_ERROR_MESSAGE = "Refetch failed";
const ABORT_ERROR_MESSAGE = "The operation was aborted";
const ABORTED_ERROR_MESSAGE = "Aborted";
const DEFAULT_ERROR_MESSAGE = "An error occurred while fetching data";

describe("useFetch", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	const renderUseFetchHook = (fetchFunction) => {
		return renderHook(() => useFetch(fetchFunction));
	};

	it("should initialize with correct default states", async () => {
		const mockFetchFunction = vi.fn().mockResolvedValue([]);
		const { result } = renderUseFetchHook(mockFetchFunction);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toEqual([]);
		expect(result.current.error).toBeNull();
		expect(typeof result.current.refetch).toBe("function");
	});

	it("should fetch data successfully on mount", async () => {
		const mockFetchFunction = vi.fn().mockResolvedValue(mockArticleData);

		const { result } = renderUseFetchHook(mockFetchFunction);

		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toEqual(mockArticleData);
		expect(result.current.error).toBeNull();
		expect(mockFetchFunction).toHaveBeenCalledTimes(1);
	});

	it("should handle fetch errors with error message", async () => {
		const fetchError = new Error(FETCH_ERROR_MESSAGE);
		const mockFetchFunction = vi.fn().mockRejectedValue(fetchError);

		const { result } = renderUseFetchHook(mockFetchFunction);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toBeNull();
		expect(result.current.error).toBe(FETCH_ERROR_MESSAGE);
	});

	it("should handle errors without message property", async () => {
		const mockFetchFunction = vi.fn().mockRejectedValue("String error");

		const { result } = renderUseFetchHook(mockFetchFunction);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.error).toBe(DEFAULT_ERROR_MESSAGE);
	});

	it("should not set error state when AbortError occurs", async () => {
		const abortError = new Error(ABORT_ERROR_MESSAGE);
		abortError.name = "AbortError";
		const mockFetchFunction = vi.fn().mockRejectedValue(abortError);

		const { result } = renderUseFetchHook(mockFetchFunction);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.error).toBeNull();
	});

	it("should cleanup on unmount and abort ongoing fetch", async () => {
		const mockFetchFunction = vi.fn(
			(signal) =>
				new Promise((resolve, reject) => {
					signal.addEventListener("abort", () => {
						const error = new Error(ABORTED_ERROR_MESSAGE);
						error.name = "AbortError";
						reject(error);
					});
					setTimeout(() => resolve([{ id: 1 }]), 100);
				}),
		);

		const { result, unmount } = renderUseFetchHook(mockFetchFunction);

		expect(result.current.isLoading).toBe(true);

		unmount();

		await waitFor(() => {
			expect(mockFetchFunction).toHaveBeenCalledTimes(1);
		});

		expect(mockFetchFunction.mock.calls[0][0]).toBeInstanceOf(AbortSignal);
	});

	it("should handle refetch errors correctly", async () => {
		const refetchError = new Error(REFETCH_ERROR_MESSAGE);
		const mockFetchFunction = vi
			.fn()
			.mockResolvedValueOnce(mockArticlesData)
			.mockRejectedValueOnce(refetchError);

		const { result } = renderUseFetchHook(mockFetchFunction);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toEqual(mockArticlesData);
		expect(result.current.error).toBeNull();

		await act(async () => {
			await result.current.refetch();
		});

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.error).toBe(REFETCH_ERROR_MESSAGE);
	});

	it("should use updated fetchFunction when it changes", async () => {
		const mockFirstFetchFunction = vi
			.fn()
			.mockResolvedValue(mockFirstFetchData);
		const mockSecondFetchFunction = vi
			.fn()
			.mockResolvedValue(mockSecondFetchData);

		const { result, rerender } = renderHook(
			({ fetchFunction }) => useFetch(fetchFunction),
			{
				initialProps: { fetchFunction: mockFirstFetchFunction },
			},
		);

		await waitFor(() => {
			expect(result.current.data).toEqual(mockFirstFetchData);
		});

		rerender({ fetchFunction: mockSecondFetchFunction });

		await waitFor(() => {
			expect(result.current.data).toEqual(mockSecondFetchData);
		});
	});

	it("should abort in-flight refetch on unmount", async () => {
		let refetchAbortSignal;
		const consoleErrorSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		const mockFetchFunction = vi
			.fn()
			.mockResolvedValueOnce([])
			.mockImplementationOnce((signal) => {
				refetchAbortSignal = signal;
				return new Promise(() => {});
			});

		const { result, unmount } = renderUseFetchHook(mockFetchFunction);
		await waitFor(() => expect(result.current.isLoading).toBe(false));

		act(() => {
			void result.current.refetch();
		});

		unmount();

		expect(refetchAbortSignal).toBeTruthy();
		expect(refetchAbortSignal).toHaveProperty("aborted", true);
		expect(consoleErrorSpy).not.toHaveBeenCalled();

		consoleErrorSpy.mockRestore();
	});

	it("should pass abort signal to fetch function on refetch", async () => {
		const mockFetchFunction = vi.fn().mockResolvedValue([]);

		const { result } = renderUseFetchHook(mockFetchFunction);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		await act(async () => {
			await result.current.refetch();
		});

		expect(mockFetchFunction).toHaveBeenCalledTimes(2);
		expect(mockFetchFunction.mock.calls[1][0]).toBeInstanceOf(AbortSignal);
	});
});
