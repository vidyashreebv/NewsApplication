import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fetchSpaceNewsArticles } from './spaceNewsApi'

describe('spaceNewsApi', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('fetchSpaceNewsArticles', () => {
    it('should fetch and return articles successfully', async () => {
      const mockArticles = [
        {
          id: 1,
          title: 'SpaceX Launch',
          url: 'https://example.com/article1',
          news_site: 'Space.com',
        },
        {
          id: 2,
          title: 'NASA Discovery',
          url: 'https://example.com/article2',
          news_site: 'NASA.gov',
        },
      ]

      globalThis.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ results: mockArticles }),
        })
      )

      const articles = await fetchSpaceNewsArticles()

      expect(fetch).toHaveBeenCalledWith(
        'https://api.spaceflightnewsapi.net/v4/articles/'
      )
      expect(articles).toEqual(mockArticles)
      expect(articles).toHaveLength(2)
    })

    it('should throw error when API response is not ok', async () => {
      globalThis.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404,
        })
      )

      await expect(fetchSpaceNewsArticles()).rejects.toThrow(
        'HTTP error! status: 404'
      )
    })

    it('should handle network errors', async () => {
      globalThis.fetch = vi.fn(() =>
        Promise.reject(new Error('Network error'))
      )

      await expect(fetchSpaceNewsArticles()).rejects.toThrow('Network error')
    })

    it('should return empty array when results is undefined', async () => {
      globalThis.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      )

      const articles = await fetchSpaceNewsArticles()

      expect(articles).toEqual([])
    })
  })
})
