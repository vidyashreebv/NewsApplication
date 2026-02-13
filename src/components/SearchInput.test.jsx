import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SearchInput } from "./SearchInput";

const mockOnChange = vi.fn();

const defaultSearchInputProps = {
	value: "",
	onChange: mockOnChange,
};

const SEARCH_VALUE = "SpaceX";
const NASA_SEARCH_VALUE = "NASA";
const CUSTOM_PLACEHOLDER_TEXT = "Find articles...";
const DEFAULT_PLACEHOLDER_TEXT = "Search by title...";
const SEARCH_INPUT_ID = "search-articles";

describe("SearchInput", () => {
	let user;

	beforeEach(() => {
		vi.clearAllMocks();
		user = userEvent.setup();
	});

	const renderSearchInput = (additionalProps = {}) => {
		return render(
			<SearchInput {...defaultSearchInputProps} {...additionalProps} />,
		);
	};

	it("should render search input with label", () => {
		renderSearchInput();

		const label = screen.getByText("Search Articles");
		const input = screen.getByLabelText("Search space news articles by title");

		expect(label).toBeInTheDocument();
		expect(input).toBeInTheDocument();
	});

	it("should display the provided value", () => {
		renderSearchInput({ value: SEARCH_VALUE });

		const input = screen.getByDisplayValue(SEARCH_VALUE);
		expect(input).toBeInTheDocument();
	});

	it("should call onChange when user types", async () => {
		const onChangeHandlerSpy = vi.fn();

		function ControlledSearchInput({ onChangeHandlerSpy }) {
			const [searchValue, setSearchValue] = useState("");
			const handleOnChangeSearchInput = (nextValue) => {
				onChangeHandlerSpy(nextValue);
				setSearchValue(nextValue);
			};
			return (
				<SearchInput value={searchValue} onChange={handleOnChangeSearchInput} />
			);
		}

		render(<ControlledSearchInput onChangeHandlerSpy={onChangeHandlerSpy} />);

		const input = screen.getByRole("textbox", {
			name: /search space news articles by title/i,
		});

		await user.type(input, NASA_SEARCH_VALUE);

		expect(onChangeHandlerSpy).toHaveBeenLastCalledWith(NASA_SEARCH_VALUE);
	});

	it("should display custom placeholder when provided", () => {
		renderSearchInput({ placeholder: CUSTOM_PLACEHOLDER_TEXT });

		const input = screen.getByPlaceholderText(CUSTOM_PLACEHOLDER_TEXT);
		expect(input).toBeInTheDocument();
	});

	it("should display default placeholder when not provided", () => {
		renderSearchInput();

		const input = screen.getByPlaceholderText(DEFAULT_PLACEHOLDER_TEXT);
		expect(input).toBeInTheDocument();
	});

	it("should have proper accessibility attributes", () => {
		renderSearchInput();

		const input = screen.getByRole("textbox", {
			name: /search space news articles by title/i,
		});
		const label = screen.getByLabelText("Search space news articles by title");

		expect(input).toHaveAttribute("id", SEARCH_INPUT_ID);
		expect(label).toBeInTheDocument();
	});

	it("should handle multiple rapid changes", async () => {
		const onChangeHandlerMock = vi.fn();
		renderSearchInput({ onChange: onChangeHandlerMock });

		const input = screen.getByLabelText("Search space news articles by title");

		await user.type(input, "S");
		await user.type(input, "p");
		await user.type(input, "a");

		expect(onChangeHandlerMock).toHaveBeenCalledTimes(3);
	});
});
