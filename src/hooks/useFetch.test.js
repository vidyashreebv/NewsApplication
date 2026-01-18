import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useFetch } from "./useFetch";

describe("useFetch", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("should initialize with correct default states", async () => {
		const mockFetchFunction = vi.fn().mockResolvedValue([]);
		const { result } = renderHook(() => useFetch(mockFetchFunction));

		// Wait for the effect to complete
		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toEqual([]);
		expect(result.current.error).toBeNull();
		expect(typeof result.current.refetch).toBe("function");
	});

	it("should fetch data successfully", async () => {
		const mockData = [{ id: 1, title: "Test Article" }];
		const mockFetchFunction = vi.fn().mockResolvedValue(mockData);

		const { result } = renderHook(() => useFetch(mockFetchFunction));

		// Initially loading should be true
		expect(result.current.isLoading).toBe(true);

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toEqual(mockData);
		expect(result.current.error).toBeNull();
		expect(mockFetchFunction).toHaveBeenCalledTimes(1);
	});

	it("should handle fetch errors correctly", async () => {
		const mockError = new Error("Fetch failed");
		const mockFetchFunction = vi.fn().mockRejectedValue(mockError);

		const { result } = renderHook(() => useFetch(mockFetchFunction));

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toBeNull();
		expect(result.current.error).toBe("Fetch failed");
	});

	it("should handle errors without message property", async () => {
		const mockFetchFunction = vi.fn().mockRejectedValue("String error");

		const { result } = renderHook(() => useFetch(mockFetchFunction));

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.error).toBe("An error occurred while fetching data");
	});

	it("should not set error for AbortError", async () => {
		const abortError = new Error("The operation was aborted");
		abortError.name = "AbortError";
		const mockFetchFunction = vi.fn().mockRejectedValue(abortError);

		const { result } = renderHook(() => useFetch(mockFetchFunction));

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.error).toBeNull();
	});

	it("should cleanup on unmount and abort fetch", async () => {
		const mockFetchFunction = vi.fn(
			(signal) =>
				new Promise((resolve, reject) => {
					signal.addEventListener("abort", () => {
						const error = new Error("Aborted");
						error.name = "AbortError";
						reject(error);
					});
					setTimeout(() => resolve([{ id: 1 }]), 100);
				}),
		);

		const { result, unmount } = renderHook(() => useFetch(mockFetchFunction));

		expect(result.current.isLoading).toBe(true);

		// Unmount before fetch completes
		unmount();

		await waitFor(() => {
			expect(mockFetchFunction).toHaveBeenCalledTimes(1);
		});

		// Verify abort signal was passed
		expect(mockFetchFunction.mock.calls[0][0]).toBeInstanceOf(AbortSignal);
	});

	it("should handle refetch errors correctly", async () => {
		const mockData = [{ id: 1, title: "Article 1" }];
		const mockError = new Error("Refetch failed");
		const mockFetchFunction = vi
			.fn()
			.mockResolvedValueOnce(mockData)
			.mockRejectedValueOnce(mockError);

		const { result } = renderHook(() => useFetch(mockFetchFunction));

		// Wait for initial fetch
		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.data).toEqual(mockData);
		expect(result.current.error).toBeNull();

		// Call refetch which will fail (wrap in act)
		await act(async () => {
			await result.current.refetch();
		});

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		expect(result.current.error).toBe("Refetch failed");
	});

	// Dependency-based refetching tests removed; refetch via fetch function identity covered below

	it("should use updated fetchFunction when it changes", async () => {
		const mockFn1 = vi.fn().mockResolvedValue(["data1"]);
		const mockFn2 = vi.fn().mockResolvedValue(["data2"]);

		const { result, rerender } = renderHook(({ fn }) => useFetch(fn), {
			initialProps: { fn: mockFn1 },
		});

		await waitFor(() => {
			expect(result.current.data).toEqual(["data1"]);
		});

		rerender({ fn: mockFn2 });

		await waitFor(() => {
			expect(result.current.data).toEqual(["data2"]);
		});
	});

	it("should abort an in-flight refetch on unmount", async () => {
		let refetchSignal;
		const consoleErrorSpy = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		const mockFn = vi
			.fn()
			.mockResolvedValueOnce([])
			.mockImplementationOnce((signal) => {
				refetchSignal = signal;
				return new Promise(() => {}); // never resolves; should be aborted on unmount
			});

		const { result, unmount } = renderHook(() => useFetch(mockFn));
		await waitFor(() => expect(result.current.isLoading).toBe(false));

		act(() => {
			void result.current.refetch();
		});

		unmount();

		expect(refetchSignal).toBeInstanceOf(AbortSignal);
		expect(refetchSignal.aborted).toBe(true);
		expect(consoleErrorSpy).not.toHaveBeenCalled();

		consoleErrorSpy.mockRestore();
	});

	it("should pass abort signal to fetch function on refetch", async () => {
		const mockFn = vi.fn().mockResolvedValue([]);

		const { result } = renderHook(() => useFetch(mockFn));

		await waitFor(() => {
			expect(result.current.isLoading).toBe(false);
		});

		await act(async () => {
			await result.current.refetch();
		});

		expect(mockFn).toHaveBeenCalledTimes(2);
		expect(mockFn.mock.calls[1][0]).toBeInstanceOf(AbortSignal);
	});
});
