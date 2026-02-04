import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import * as spaceNewsApi from "./services/spaceNewsApi";

vi.mock("./services/spaceNewsApi");

const PAGE_TITLE_TEXT = "Spaceflight News Dashboard";
const LOAD_BUTTON_LABEL = /load articles/i;

describe("App", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		spaceNewsApi.fetchSpaceNewsArticles.mockResolvedValue([]);
	});

	const renderApp = () => {
		return render(<App />);
	};

	const waitForLoadButton = async () => {
		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: LOAD_BUTTON_LABEL }),
			).toBeInTheDocument();
		});
	};

	it("should render the SpaceNewsPage component", async () => {
		renderApp();

		await waitForLoadButton();

		expect(screen.getByText(PAGE_TITLE_TEXT)).toBeInTheDocument();
	});

	it("should render load articles button", async () => {
		renderApp();

		await waitForLoadButton();
	});
});
