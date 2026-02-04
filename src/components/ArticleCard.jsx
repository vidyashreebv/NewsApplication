import clsx from "clsx";
import PropTypes from "prop-types";

const cardClassName = clsx(
	"bg-white rounded-lg shadow-md p-6",
	"border border-gray-200",
	"hover:shadow-lg transition-shadow duration-300",
	"flex flex-col gap-3",
);

const titleClassName = "text-xl font-semibold text-gray-900 line-clamp-2";

const sourceTextClassName = "text-sm text-gray-600";

const sourceLabelClassName = "font-medium";

const linkClassName = clsx(
	"inline-flex items-center text-blue-600 hover:text-blue-800",
	"font-medium text-sm",
	"transition-colors duration-200",
	"focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
	"rounded px-2 py-1 -mx-2",
);

const iconClassName = "w-4 h-4 ml-2";

const ExternalLinkIcon = () => (
	<svg
		className={iconClassName}
		fill="none"
		stroke="currentColor"
		viewBox="0 0 24 24"
		aria-hidden="true"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
		/>
	</svg>
);

export const ArticleCard = ({ title, source, url }) => {
	return (
		<article className={cardClassName}>
			<h2 className={titleClassName}>{title}</h2>

			<p className={sourceTextClassName}>
				<span className={sourceLabelClassName}>Source:</span> {source}
			</p>

			<a
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				className={linkClassName}
				aria-label={`Read full article: ${title}`}
			>
				Read Full Article
				<ExternalLinkIcon />
			</a>
		</article>
	);
};

ArticleCard.propTypes = {
	title: PropTypes.string.isRequired,
	source: PropTypes.string.isRequired,
	url: PropTypes.string.isRequired,
};
