import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import * as spaceNewsApi from "./services/spaceNewsApi";

vi.mock("./services/spaceNewsApi");

describe("App", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Mock to return empty array by default to prevent auto-loading in tests
		spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue([]);
	});

	it("should render the SpaceNewsPage component", async () => {
		render(<App />);

		// Wait for effect to settle to avoid act warnings
		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: /load articles/i }),
			).toBeInTheDocument();
		});

		expect(screen.getByText("Spaceflight News Dashboard")).toBeInTheDocument();
	});

	it("should render load articles button", async () => {
		render(<App />);

		// Wait for initial load to complete
		await waitFor(() => {
			const loadButton = screen.getByRole("button", { name: /load articles/i });
			expect(loadButton).toBeInTheDocument();
		});
	});
});
