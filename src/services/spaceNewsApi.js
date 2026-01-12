const API_BASE_URL = 'https://api.spaceflightnewsapi.net/v4/articles/'

/**
 * Fetches articles from the Spaceflight News API
 * @param {AbortSignal} [signal] - Optional abort signal for request cancellation
 * @returns {Promise<Array>} Array of article objects
 * @throws {Error} When the API request fails
 */
export const fetchSpaceNewsArticles = async (signal) => {
  try {
    const response = await fetch(API_BASE_URL, { signal })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const newsData = await response.json()
    return newsData.results || []
  } catch (error) {
    console.error('Error fetching space news articles:', error)
    throw error
  }
}
