import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDebounce } from "./useDebounce";

describe("useDebounce", () => {
	it("should return initial value immediately", () => {
		const { result } = renderHook(() => useDebounce("initial", 500));
		expect(result.current).toBe("initial");
	});

	it("should debounce value changes", async () => {
		const { result, rerender } = renderHook(
			({ value, delay }) => useDebounce(value, delay),
			{
				initialProps: { value: "initial", delay: 500 },
			},
		);
		expect(result.current).toBe("initial");
		rerender({ value: "updated", delay: 500 });
		expect(result.current).toBe("initial");
		await waitFor(
			() => {
				expect(result.current).toBe("updated");
			},
			{ timeout: 600 },
		);
	});

	it("should cancel previous timeout on rapid changes", async () => {
		const { result, rerender } = renderHook(
			({ value, delay }) => useDebounce(value, delay),
			{
				initialProps: { value: "first", delay: 500 },
			},
		);
		expect(result.current).toBe("first");
		rerender({ value: "second", delay: 500 });
		rerender({ value: "third", delay: 500 });
		rerender({ value: "fourth", delay: 500 });
		expect(result.current).toBe("first");
		await waitFor(
			() => {
				expect(result.current).toBe("fourth");
			},
			{ timeout: 600 },
		);
	});

	it("should use custom delay", async () => {
		const { result, rerender } = renderHook(
			({ value, delay }) => useDebounce(value, delay),
			{
				initialProps: { value: "initial", delay: 100 },
			},
		);
		rerender({ value: "updated", delay: 100 });
		await waitFor(
			() => {
				expect(result.current).toBe("updated");
			},
			{ timeout: 200 },
		);
	});
});
