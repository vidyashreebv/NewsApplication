import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
	it("should render search input with label", () => {
		const mockOnChange = vi.fn();
		render(<SearchInput value="" onChange={mockOnChange} />);

		const label = screen.getByText("Search Articles");
		const input = screen.getByLabelText("Search space news articles by title");

		expect(label).toBeInTheDocument();
		expect(input).toBeInTheDocument();
	});

	it("should display the provided value", () => {
		const mockOnChange = vi.fn();
		render(<SearchInput value="SpaceX" onChange={mockOnChange} />);

		const input = screen.getByDisplayValue("SpaceX");
		expect(input).toBeInTheDocument();
	});

	it("should call onChange when user types", async () => {
		const onChangeSpy = vi.fn();

		function ControlledSearchInput({ onChangeSpy }) {
			const [value, setValue] = useState("");
			const handleChange = (nextValue) => {
				onChangeSpy(nextValue);
				setValue(nextValue);
			};
			return <SearchInput value={value} onChange={handleChange} />;
		}

		render(<ControlledSearchInput onChangeSpy={onChangeSpy} />);

		const input = screen.getByRole("textbox", {
			name: /search space news articles by title/i,
		});
		const user = userEvent.setup();

		await user.type(input, "NASA");

		expect(onChangeSpy).toHaveBeenLastCalledWith("NASA");
	});

	it("should display custom placeholder when provided", () => {
		const mockOnChange = vi.fn();
		render(
			<SearchInput
				value=""
				onChange={mockOnChange}
				placeholder="Find articles..."
			/>,
		);

		const input = screen.getByPlaceholderText("Find articles...");
		expect(input).toBeInTheDocument();
	});

	it("should display default placeholder when not provided", () => {
		const mockOnChange = vi.fn();
		render(<SearchInput value="" onChange={mockOnChange} />);

		const input = screen.getByPlaceholderText("Search by title...");
		expect(input).toBeInTheDocument();
	});

	it("should have proper accessibility attributes", () => {
		const mockOnChange = vi.fn();
		render(<SearchInput value="" onChange={mockOnChange} />);

		const input = screen.getByRole("textbox", {
			name: /search space news articles by title/i,
		});
		const label = screen.getByLabelText("Search space news articles by title");

		expect(input).toHaveAttribute("id", "search-articles");
		expect(label).toBeInTheDocument();
	});

	it("should handle multiple rapid changes", async () => {
		const mockOnChange = vi.fn();
		render(<SearchInput value="" onChange={mockOnChange} />);

		const input = screen.getByLabelText("Search space news articles by title");
		const user = userEvent.setup();

		await user.type(input, "S");
		await user.type(input, "p");
		await user.type(input, "a");

		expect(mockOnChange).toHaveBeenCalledTimes(3);
	});
});
