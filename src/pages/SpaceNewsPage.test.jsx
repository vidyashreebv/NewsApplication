import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as spaceNewsApi from "../services/spaceNewsApi";
import { SpaceNewsPage } from "./SpaceNewsPage";

vi.mock("../services/spaceNewsApi");

describe("SpaceNewsPage", () => {
	const mockArticles = [
		{
			id: 1,
			title: "SpaceX Launches Starship",
			news_site: "Space.com",
			url: "https://example.com/spacex",
		},
		{
			id: 2,
			title: "NASA Mars Rover Discovery",
			news_site: "NASA.gov",
			url: "https://example.com/nasa",
		},
		{
			id: 3,
			title: "SpaceX Dragon Returns to Earth",
			news_site: "SpaceNews",
			url: "https://example.com/dragon",
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();
		// Mock to return empty array by default to prevent auto-loading in tests
		spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue([]);
	});

	it("should render page title and description", async () => {
		render(<SpaceNewsPage />);

		// Wait for effect to settle to avoid act warnings
		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: /load articles/i }),
			).toBeInTheDocument();
		});

		expect(screen.getByText("Spaceflight News Dashboard")).toBeInTheDocument();
		expect(
			screen.getByText(
				"Discover the latest news from space exploration and science",
			),
		).toBeInTheDocument();
	});

	it("should show empty state before loading articles", async () => {
		render(<SpaceNewsPage />);

		// Wait for initial useEffect to complete
		await waitFor(() => {
			expect(screen.getByText("No Articles Loaded")).toBeInTheDocument();
		});

		expect(
			screen.getByText('Click "Load Articles" to fetch the latest space news'),
		).toBeInTheDocument();
	});

	it("should display load articles button", async () => {
		render(<SpaceNewsPage />);

		await waitFor(() => {
			const loadButton = screen.getByRole("button", { name: /load articles/i });
			expect(loadButton).toBeInTheDocument();
		});
	});

	it("should fetch and display articles when load button is clicked", async () => {
		render(<SpaceNewsPage />);

		// Wait for initial useEffect load to complete
		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: /load articles/i }),
			).toBeInTheDocument();
		});

		// Now set up mock for manual click
		spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(mockArticles);

		const loadButton = screen.getByRole("button", { name: /load articles/i });
		const user = userEvent.setup();
		await user.click(loadButton);

		await waitFor(() => {
			expect(screen.getByText("SpaceX Launches Starship")).toBeInTheDocument();
			expect(screen.getByText("NASA Mars Rover Discovery")).toBeInTheDocument();
			expect(
				screen.getByText("SpaceX Dragon Returns to Earth"),
			).toBeInTheDocument();
		});

		// Called once on mount + once on button click
		expect(spaceNewsApi.fetchSpaceNewsArticles).toHaveBeenCalledTimes(2);
	});

	it("should show loading state while fetching articles", async () => {
		render(<SpaceNewsPage />);

		// Wait for initial load to complete
		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: /load articles/i }),
			).toBeInTheDocument();
		});

		// Set up delayed mock for manual click
		spaceNewsApi.fetchSpaceNewsArticles.mockImplementation(
			() =>
				new Promise((resolve) => setTimeout(() => resolve(mockArticles), 100)),
		);

		const loadButton = screen.getByRole("button", { name: /load articles/i });
		const user = userEvent.setup();
		await user.click(loadButton);

		expect(screen.getByText("Loading...")).toBeInTheDocument();
		expect(loadButton).toBeDisabled();

		await waitFor(() => {
			expect(screen.getByText("SpaceX Launches Starship")).toBeInTheDocument();
		});
	});

	it("should display error message when API call fails", async () => {
		render(<SpaceNewsPage />);

		// Wait for initial load to complete
		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: /load articles/i }),
			).toBeInTheDocument();
		});

		// Set up error mock for manual click
		spaceNewsApi.fetchSpaceNewsArticles.mockRejectedValue(
			new Error("Network error"),
		);

		const loadButton = screen.getByRole("button", { name: /load articles/i });
		const user = userEvent.setup();
		await user.click(loadButton);

		await waitFor(() => {
			expect(screen.getByText("Network error")).toBeInTheDocument();
		});
	});

	it("should show search input after articles are loaded", async () => {
		render(<SpaceNewsPage />);

		// Wait for initial load (no articles)
		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: /load articles/i }),
			).toBeInTheDocument();
		});

		expect(screen.queryByLabelText(/search/i)).not.toBeInTheDocument();

		// Set up mock with articles for manual click
		spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(mockArticles);

		const loadButton = screen.getByRole("button", { name: /load articles/i });
		const user = userEvent.setup();
		await user.click(loadButton);

		await waitFor(() => {
			expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
		});
	});

	it("should filter articles based on search query", async () => {
		render(<SpaceNewsPage />);

		// Wait for initial load
		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: /load articles/i }),
			).toBeInTheDocument();
		});

		// Set up mock with articles
		spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(mockArticles);

		const loadButton = screen.getByRole("button", { name: /load articles/i });
		const user = userEvent.setup();
		await user.click(loadButton);

		await waitFor(() => {
			expect(screen.getByText("SpaceX Launches Starship")).toBeInTheDocument();
		});

		const searchInput = screen.getByLabelText(/search/i);
		await user.type(searchInput, "SpaceX");

		expect(screen.getByText("SpaceX Launches Starship")).toBeInTheDocument();
		expect(
			screen.getByText("SpaceX Dragon Returns to Earth"),
		).toBeInTheDocument();
		expect(
			screen.queryByText("NASA Mars Rover Discovery"),
		).not.toBeInTheDocument();
	});

	it("should show no results state when search has no matches", async () => {
		render(<SpaceNewsPage />);

		// Wait for initial load
		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: /load articles/i }),
			).toBeInTheDocument();
		});

		// Set up mock with articles
		spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(mockArticles);

		const loadButton = screen.getByRole("button", { name: /load articles/i });
		const user = userEvent.setup();
		await user.click(loadButton);

		await waitFor(() => {
			expect(screen.getByText("SpaceX Launches Starship")).toBeInTheDocument();
		});

		const searchInput = screen.getByLabelText(/search/i);
		await user.type(searchInput, "Pluto");

		expect(screen.getByText("No Results Found")).toBeInTheDocument();
		expect(
			screen.getByText(
				'No articles match "Pluto". Try a different search term.',
			),
		).toBeInTheDocument();
	});

	it("should display correct article count", async () => {
		render(<SpaceNewsPage />);

		// Wait for initial load
		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: /load articles/i }),
			).toBeInTheDocument();
		});

		// Set up mock with articles
		spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(mockArticles);

		const loadButton = screen.getByRole("button", { name: /load articles/i });
		const user = userEvent.setup();
		await user.click(loadButton);

		await waitFor(() => {
			expect(screen.getByText("Showing 3 of 3 articles")).toBeInTheDocument();
		});
	});

	it("should update article count when filtering", async () => {
		render(<SpaceNewsPage />);

		// Wait for initial load
		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: /load articles/i }),
			).toBeInTheDocument();
		});

		// Set up mock with articles
		spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(mockArticles);

		const loadButton = screen.getByRole("button", { name: /load articles/i });
		const user = userEvent.setup();
		await user.click(loadButton);

		await waitFor(() => {
			expect(screen.getByText("Showing 3 of 3 articles")).toBeInTheDocument();
		});

		const searchInput = screen.getByLabelText(/search/i);
		await user.type(searchInput, "NASA");

		expect(screen.getByText("Showing 1 of 3 articles")).toBeInTheDocument();
	});

	it("should perform case-insensitive search", async () => {
		render(<SpaceNewsPage />);

		// Wait for initial load
		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: /load articles/i }),
			).toBeInTheDocument();
		});

		// Set up mock with articles
		spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(mockArticles);

		const loadButton = screen.getByRole("button", { name: /load articles/i });
		const user = userEvent.setup();
		await user.click(loadButton);

		await waitFor(() => {
			expect(screen.getByText("SpaceX Launches Starship")).toBeInTheDocument();
		});

		const searchInput = screen.getByLabelText(/search/i);
		await user.type(searchInput, "spacex");

		expect(screen.getByText("SpaceX Launches Starship")).toBeInTheDocument();
		expect(
			screen.getByText("SpaceX Dragon Returns to Earth"),
		).toBeInTheDocument();
	});
});
