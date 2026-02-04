import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ArticleCard } from "./ArticleCard";

const mockArticleData = {
	title: "SpaceX Launches New Satellite",
	source: "Space.com",
	url: "https://example.com/article",
};

const mockLongTitleArticleData = {
	title:
		"This is a very long article title that should be truncated properly when displayed in the card component",
	source: "Space.com",
	url: "https://example.com/article",
};

describe("ArticleCard", () => {
	const renderArticleCard = (props) => {
		return render(<ArticleCard {...props} />);
	};

	it("should render article title", () => {
		renderArticleCard(mockArticleData);

		const title = screen.getByRole("heading", {
			name: mockArticleData.title,
		});
		expect(title).toBeInTheDocument();
	});

	it("should render article source", () => {
		renderArticleCard(mockArticleData);

		const source = screen.getByText(/Space\.com/);
		expect(source).toBeInTheDocument();
	});

	it("should render link with correct href attribute", () => {
		renderArticleCard(mockArticleData);

		const link = screen.getByRole("link", { name: /read full article/i });
		expect(link).toHaveAttribute("href", mockArticleData.url);
	});

	it("should open link in new tab with security attributes", () => {
		renderArticleCard(mockArticleData);

		const link = screen.getByRole("link", { name: /read full article/i });
		expect(link).toHaveAttribute("target", "_blank");
		expect(link).toHaveAttribute("rel", "noopener noreferrer");
	});

	it("should have proper accessibility label on link", () => {
		renderArticleCard(mockArticleData);

		const link = screen.getByLabelText(
			`Read full article: ${mockArticleData.title}`,
		);
		expect(link).toBeInTheDocument();
	});

	it("should render as an article element for semantic HTML", () => {
		const { container } = renderArticleCard(mockArticleData);

		const article = container.querySelector("article");
		expect(article).toBeInTheDocument();
	});

	it("should handle long titles with truncation", () => {
		renderArticleCard(mockLongTitleArticleData);

		const title = screen.getByRole("heading", {
			name: mockLongTitleArticleData.title,
		});
		expect(title).toBeInTheDocument();
		expect(title).toHaveClass("line-clamp-2");
	});

	it("should display source label text", () => {
		renderArticleCard(mockArticleData);

		const sourceLabel = screen.getByText("Source:");
		expect(sourceLabel).toBeInTheDocument();
	});
});
