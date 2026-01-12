const API_BASE_URL = 'https://api.spaceflightnewsapi.net/v4/articles/'

/**
 * Fetches articles from the Spaceflight News API
 * @returns {Promise<Array>} Array of article objects
 * @throws {Error} When the API request fails
 */
export const fetchSpaceNewsArticles = async () => {
  try {
    const response = await fetch(API_BASE_URL)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error('Error fetching space news articles:', error)
    throw error
  }
}
