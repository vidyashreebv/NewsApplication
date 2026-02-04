import clsx from "clsx";
import PropTypes from "prop-types";
import { useState } from "react";
import { ArticleCard } from "../components/ArticleCard";
import { SearchInput } from "../components/SearchInput";
import { useFetch } from "../hooks/useFetch";
import { fetchSpaceNewsArticles } from "../services/spaceNewsApi";

const pageContainerClassName =
	"min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50";

const contentContainerClassName = "container mx-auto px-4 py-8";

const headerContainerClassName = "text-center mb-12";

const titleClassName = "text-4xl md:text-5xl font-bold text-gray-900 mb-4";

const subtitleClassName = "text-lg text-gray-600";

const controlsContainerClassName =
	"flex flex-col md:flex-row gap-4 items-center justify-center mb-8";

const getLoadButtonClassName = (isLoading) =>
	clsx(
		"px-6 py-3 rounded-lg font-semibold text-white",
		"transition-all duration-200",
		"focus:outline-none focus:ring-2 focus:ring-offset-2",
		isLoading
			? "bg-gray-400 cursor-not-allowed"
			: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 active:scale-95",
	);

const errorContainerClassName =
	"max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-4 mb-8";

const errorTextClassName = "text-red-800 text-center";

const articlesGridClassName =
	"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";

const resultsCountClassName = "text-center text-gray-600 mt-8";

const emptyStateContainerClassName = "text-center py-16";

const emptyStateIconClassName = "text-6xl mb-4";

const emptyStateTitleClassName = "text-2xl font-semibold text-gray-700 mb-2";

const emptyStateTextClassName = "text-gray-500";

const EmptyState = () => (
	<div className={emptyStateContainerClassName}>
		<div className={emptyStateIconClassName}>📰</div>
		<h2 className={emptyStateTitleClassName}>No Articles Loaded</h2>
		<p className={emptyStateTextClassName}>
			Click "Load Articles" to fetch the latest space news
		</p>
	</div>
);

const NoResultsState = ({ searchQuery }) => (
	<div className={emptyStateContainerClassName}>
		<div className={emptyStateIconClassName}>🔍</div>
		<h2 className={emptyStateTitleClassName}>No Results Found</h2>
		<p className={emptyStateTextClassName}>
			No articles match "{searchQuery}". Try a different search term.
		</p>
	</div>
);

NoResultsState.propTypes = {
	searchQuery: PropTypes.string.isRequired,
};

export const SpaceNewsPage = () => {
	const [searchQuery, setSearchQuery] = useState("");

	const {
		data: articles,
		isLoading,
		error,
		refetch,
	} = useFetch(fetchSpaceNewsArticles);

	const handleOnChangeSearchQuery = (newSearchQuery) => {
		setSearchQuery(newSearchQuery);
	};

	const filteredArticles =
		articles?.filter((article) =>
			article.title.toLowerCase().includes(searchQuery.toLowerCase()),
		) || [];

	const shouldShowEmptyState =
		!isLoading && (!articles || articles.length === 0) && !error;

	const shouldShowNoResults =
		!isLoading &&
		articles &&
		articles.length > 0 &&
		filteredArticles.length === 0;

	return (
		<div className={pageContainerClassName}>
			<div className={contentContainerClassName}>
				{/* Header */}
				<header className={headerContainerClassName}>
					<h1 className={titleClassName}>Spaceflight News Dashboard</h1>
					<p className={subtitleClassName}>
						Discover the latest news from space exploration and science
					</p>
				</header>

				{/* Controls */}
				<div className={controlsContainerClassName}>
					<button
						type="button"
						onClick={refetch}
						disabled={isLoading}
						className={getLoadButtonClassName(isLoading)}
						aria-label={isLoading ? "Loading articles" : "Load articles"}
					>
						{isLoading ? "Loading..." : "Load Articles"}
					</button>

					{articles && articles.length > 0 && (
						<SearchInput
							value={searchQuery}
							onChange={handleOnChangeSearchQuery}
							placeholder="Search by title..."
						/>
					)}
				</div>

				{/* Error State */}
				{error && (
					<div className={errorContainerClassName} role="alert">
						<p className={errorTextClassName}>{error}</p>
					</div>
				)}

				{/* Empty State */}
				{shouldShowEmptyState && <EmptyState />}

				{/* No Results State */}
				{shouldShowNoResults && <NoResultsState searchQuery={searchQuery} />}

				{/* Articles Grid */}
				{!isLoading && filteredArticles.length > 0 && (
					<div className={articlesGridClassName}>
						{filteredArticles.map((article) => (
							<ArticleCard
								key={article.id}
								title={article.title}
								source={article.news_site}
								url={article.url}
							/>
						))}
					</div>
				)}

				{/* Results Count */}
				{!isLoading && filteredArticles.length > 0 && (
					<p className={resultsCountClassName}>
						Showing {filteredArticles.length} of {articles?.length || 0}{" "}
						articles
					</p>
				)}
			</div>
		</div>
	);
};
