import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as spaceNewsApi from "../services/spaceNewsApi";
import { SpaceNewsPage } from "./SpaceNewsPage";

vi.mock("../services/spaceNewsApi");

const mockSpaceArticlesData = [
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

const PAGE_TITLE_TEXT = "Spaceflight News Dashboard";
const PAGE_DESCRIPTION_TEXT =
	"Discover the latest news from space exploration and science";
const EMPTY_STATE_TITLE_TEXT = "No Articles Loaded";
const EMPTY_STATE_MESSAGE_TEXT =
	'Click "Load Articles" to fetch the latest space news';
const LOAD_BUTTON_LABEL = /load articles/i;
const LOADING_BUTTON_LABEL = /loading articles/i;
const LOADING_TEXT = "Loading...";
const NETWORK_ERROR_MESSAGE = "Network error";
const NO_RESULTS_TITLE_TEXT = "No Results Found";
const SEARCH_INPUT_LABEL = /search/i;
const SPACEX_SEARCH_QUERY = "SpaceX";
const NASA_SEARCH_QUERY = "NASA";
const PLUTO_SEARCH_QUERY = "Pluto";
const SPACEX_LOWERCASE_QUERY = "spacex";

const THREE_OF_THREE_ARTICLES_TEXT = "Showing 3 of 3 articles";
const ONE_OF_THREE_ARTICLES_TEXT = "Showing 1 of 3 articles";

const API_DELAY_TIME = 100;

describe("SpaceNewsPage", () => {
	let user;

	beforeEach(() => {
		vi.clearAllMocks();
		user = userEvent.setup();
		spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue([]);
	});

	const renderSpaceNewsPage = () => {
		return render(<SpaceNewsPage />);
	};

	const waitForLoadButton = async () => {
		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: LOAD_BUTTON_LABEL }),
			).toBeInTheDocument();
		});
	};

	const clickLoadButton = async () => {
		const loadButton = screen.getByRole("button", { name: LOAD_BUTTON_LABEL });
		await user.click(loadButton);
	};

	it("should render page title and description", async () => {
		renderSpaceNewsPage();

		await waitForLoadButton();

		expect(screen.getByText(PAGE_TITLE_TEXT)).toBeInTheDocument();
		expect(screen.getByText(PAGE_DESCRIPTION_TEXT)).toBeInTheDocument();
	});

	it("should show empty state before loading articles", async () => {
		renderSpaceNewsPage();

		await waitFor(() => {
			expect(screen.getByText(EMPTY_STATE_TITLE_TEXT)).toBeInTheDocument();
		});

		expect(screen.getByText(EMPTY_STATE_MESSAGE_TEXT)).toBeInTheDocument();
	});

	it("should display load articles button", async () => {
		renderSpaceNewsPage();

		await waitForLoadButton();
	});

	it("should fetch and display articles when load button is clicked", async () => {
		renderSpaceNewsPage();

		await waitForLoadButton();

		spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(
			mockSpaceArticlesData,
		);

		await clickLoadButton();

		await waitFor(() => {
			expect(
				screen.getByText(mockSpaceArticlesData[0].title),
			).toBeInTheDocument();
			expect(
				screen.getByText(mockSpaceArticlesData[1].title),
			).toBeInTheDocument();
			expect(
				screen.getByText(mockSpaceArticlesData[2].title),
			).toBeInTheDocument();
		});

		expect(spaceNewsApi.fetchSpaceNewsArticles).toHaveBeenCalledTimes(2);
	});

	it("should show loading state while fetching articles", async () => {
		renderSpaceNewsPage();

		await waitForLoadButton();

		spaceNewsApi.fetchSpaceNewsArticles.mockImplementation(
			() =>
				new Promise((resolve) =>
					setTimeout(() => resolve(mockSpaceArticlesData), API_DELAY_TIME),
				),
		);

		await clickLoadButton();

		expect(screen.getByText(LOADING_TEXT)).toBeInTheDocument();
		const loadingButton = screen.getByRole("button", {
			name: LOADING_BUTTON_LABEL,
		});
		expect(loadingButton).toBeDisabled();

		await waitFor(() => {
			expect(
				screen.getByText(mockSpaceArticlesData[0].title),
			).toBeInTheDocument();
		});
	});

	it("should display error message when API call fails", async () => {
		renderSpaceNewsPage();

		await waitForLoadButton();

		spaceNewsApi.fetchSpaceNewsArticles.mockRejectedValue(
			new Error(NETWORK_ERROR_MESSAGE),
		);

		await clickLoadButton();

		await waitFor(() => {
			expect(screen.getByText(NETWORK_ERROR_MESSAGE)).toBeInTheDocument();
		});
	});

	it("should show search input after articles are loaded", async () => {
		renderSpaceNewsPage();

		await waitForLoadButton();

		expect(screen.queryByLabelText(SEARCH_INPUT_LABEL)).not.toBeInTheDocument();

		spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(
			mockSpaceArticlesData,
		);

		await clickLoadButton();

		await waitFor(() => {
			expect(screen.getByLabelText(SEARCH_INPUT_LABEL)).toBeInTheDocument();
		});
	});

	it("should filter articles based on search query", async () => {
		renderSpaceNewsPage();

		await waitForLoadButton();

		spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(
			mockSpaceArticlesData,
		);

		await clickLoadButton();

		await waitFor(() => {
			expect(
				screen.getByText(mockSpaceArticlesData[0].title),
			).toBeInTheDocument();
		});

		const searchInput = screen.getByLabelText(SEARCH_INPUT_LABEL);
		await user.type(searchInput, SPACEX_SEARCH_QUERY);

		expect(
			screen.getByText(mockSpaceArticlesData[0].title),
		).toBeInTheDocument();
		expect(
			screen.getByText(mockSpaceArticlesData[2].title),
		).toBeInTheDocument();
		expect(
			screen.queryByText(mockSpaceArticlesData[1].title),
		).not.toBeInTheDocument();
	});

	it("should show no results state when search has no matches", async () => {
		renderSpaceNewsPage();

		await waitForLoadButton();

		spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(
			mockSpaceArticlesData,
		);

		await clickLoadButton();

		await waitFor(() => {
			expect(
				screen.getByText(mockSpaceArticlesData[0].title),
			).toBeInTheDocument();
		});

		const searchInput = screen.getByLabelText(SEARCH_INPUT_LABEL);
		await user.type(searchInput, PLUTO_SEARCH_QUERY);

		expect(screen.getByText(NO_RESULTS_TITLE_TEXT)).toBeInTheDocument();
		expect(
			screen.getByText(
				`No articles match "${PLUTO_SEARCH_QUERY}". Try a different search term.`,
			),
		).toBeInTheDocument();
	});

	it("should display correct article count", async () => {
		renderSpaceNewsPage();

		await waitForLoadButton();

		spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(
			mockSpaceArticlesData,
		);

		await clickLoadButton();

		await waitFor(() => {
			expect(
				screen.getByText(THREE_OF_THREE_ARTICLES_TEXT),
			).toBeInTheDocument();
		});
	});

	it("should update article count when filtering", async () => {
		renderSpaceNewsPage();

		await waitForLoadButton();

		spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(
			mockSpaceArticlesData,
		);

		await clickLoadButton();

		await waitFor(() => {
			expect(
				screen.getByText(THREE_OF_THREE_ARTICLES_TEXT),
			).toBeInTheDocument();
		});

		const searchInput = screen.getByLabelText(SEARCH_INPUT_LABEL);
		await user.type(searchInput, NASA_SEARCH_QUERY);

		expect(screen.getByText(ONE_OF_THREE_ARTICLES_TEXT)).toBeInTheDocument();
	});

	it("should perform case-insensitive search", async () => {
		renderSpaceNewsPage();

		await waitForLoadButton();

		spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue(
			mockSpaceArticlesData,
		);

		await clickLoadButton();

		await waitFor(() => {
			expect(
				screen.getByText(mockSpaceArticlesData[0].title),
			).toBeInTheDocument();
		});

		const searchInput = screen.getByLabelText(SEARCH_INPUT_LABEL);
		await user.type(searchInput, SPACEX_LOWERCASE_QUERY);

		expect(
			screen.getByText(mockSpaceArticlesData[0].title),
		).toBeInTheDocument();
		expect(
			screen.getByText(mockSpaceArticlesData[2].title),
		).toBeInTheDocument();
	});
});
