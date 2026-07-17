import { getBookmanApiBaseUrl, getBookmanApiUrl } from '@/helpers/apiClient'

describe('apiClient', () => {
  const originalBookmanApiBaseUrl = process.env.NEXT_PUBLIC_BOOKMAN_API_BASE_URL

  afterEach(() => {
    if (originalBookmanApiBaseUrl === undefined) {
      delete process.env.NEXT_PUBLIC_BOOKMAN_API_BASE_URL
      return
    }

    process.env.NEXT_PUBLIC_BOOKMAN_API_BASE_URL = originalBookmanApiBaseUrl
  })

  test('returns the default Bookman API base URL', () => {
    delete process.env.NEXT_PUBLIC_BOOKMAN_API_BASE_URL

    expect(getBookmanApiBaseUrl()).toBe('http://127.0.0.1:8000/bookman/api')
  })

  test('builds existing backend endpoint URLs from the default base URL', () => {
    delete process.env.NEXT_PUBLIC_BOOKMAN_API_BASE_URL

    expect(getBookmanApiUrl('branches')).toBe('http://127.0.0.1:8000/bookman/api/branches/')
    expect(getBookmanApiUrl('books')).toBe('http://127.0.0.1:8000/bookman/api/books/')
  })

  test('builds endpoint URLs from NEXT_PUBLIC_BOOKMAN_API_BASE_URL', () => {
    process.env.NEXT_PUBLIC_BOOKMAN_API_BASE_URL = 'https://example.com/bookman/api/'

    expect(getBookmanApiUrl('branches')).toBe('https://example.com/bookman/api/branches/')
  })
})
