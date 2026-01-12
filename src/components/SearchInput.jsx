import PropTypes from 'prop-types'
import clsx from 'clsx'

const containerClasses = 'w-full max-w-md'

const labelClasses = 'block text-sm font-medium text-gray-700 mb-2'

const inputClasses = clsx(
    'w-full px-4 py-2 border border-gray-300 rounded-lg',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    'placeholder-gray-400 text-gray-900',
    'transition duration-200'
)

export const SearchInput = ({
    value,
    onChange,
    placeholder = 'Search by title...',
}) => {
    const handleOnChangeSearchQuery = (event) => {
        onChange(event.target.value)
    }

    return (
        <div className={containerClasses}>
            <label htmlFor="search-articles" className={labelClasses}>
                Search Articles
            </label>
            <input
                id="search-articles"
                type="text"
                value={value}
                onChange={handleOnChangeSearchQuery}
                placeholder={placeholder}
                className={inputClasses}
                aria-label="Search space news articles by title"
            />
        </div>
    )
}

SearchInput.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
}
