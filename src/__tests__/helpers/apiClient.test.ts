import { getBookmanApiBaseUrl, getBookmanApiUrl } from '@/helpers/apiClient'

describe('apiClient', () => {
  const originalBookmanApiBaseUrl = process.env.BOOKMAN_API_BASE_URL

  afterEach(() => {
    if (originalBookmanApiBaseUrl === undefined) {
      delete process.env.BOOKMAN_API_BASE_URL
      return
    }

    process.env.BOOKMAN_API_BASE_URL = originalBookmanApiBaseUrl
  })

  /**
   * シナリオ:
   * - 入力: BOOKMAN_API_BASE_URL が未設定の環境。
   * - 処理: Bookman API の base URL を取得する。
   * - 期待値: 既存のローカルバックエンド URL が返ること。
   */
  test('returns the default Bookman API base URL', () => {
    // Given
    delete process.env.BOOKMAN_API_BASE_URL

    // When / Then
    expect(getBookmanApiBaseUrl()).toBe('http://127.0.0.1:8000/bookman/api')
  })

  /**
   * シナリオ:
   * - 入力: BOOKMAN_API_BASE_URL が未設定の環境。
   * - 処理: branches / books / booksCreate / branchBookStocks / authors / categories / customers / staff / lendings / lendingReturn の endpoint URL を組み立てる。
   * - 期待値: 既存バックエンド仕様と同じ URL が返ること。
   */
  test('builds existing backend endpoint URLs from the default base URL', () => {
    // Given
    delete process.env.BOOKMAN_API_BASE_URL

    // When / Then
    expect(getBookmanApiUrl('branches')).toBe('http://127.0.0.1:8000/bookman/api/branches/')
    expect(getBookmanApiUrl('books')).toBe('http://127.0.0.1:8000/bookman/api/books/')
    expect(getBookmanApiUrl('booksCreate')).toBe('http://127.0.0.1:8000/bookman/api/books/create/')
    expect(getBookmanApiUrl('branchBookStocks')).toBe(
      'http://127.0.0.1:8000/bookman/api/branch-book-stocks/',
    )
    expect(getBookmanApiUrl('authors')).toBe('http://127.0.0.1:8000/bookman/api/authors/')
    expect(getBookmanApiUrl('categories')).toBe('http://127.0.0.1:8000/bookman/api/categories/')
    expect(getBookmanApiUrl('customers')).toBe('http://127.0.0.1:8000/bookman/api/customers/')
    expect(getBookmanApiUrl('staff')).toBe('http://127.0.0.1:8000/bookman/api/staff/')
    expect(getBookmanApiUrl('lendings')).toBe('http://127.0.0.1:8000/bookman/api/lendings/')
    expect(getBookmanApiUrl('lendingReturn')).toBe(
      'http://127.0.0.1:8000/bookman/api/lendings/return/',
    )
  })

  /**
   * シナリオ:
   * - 入力: BOOKMAN_API_BASE_URL に末尾スラッシュ付きの検証環境 URL を設定する。
   * - 処理: branches の endpoint URL を組み立てる。
   * - 期待値: base URL の末尾スラッシュを重複させず、branches endpoint の URL が返ること。
   */
  test('builds endpoint URLs from BOOKMAN_API_BASE_URL', () => {
    // Given
    process.env.BOOKMAN_API_BASE_URL = 'https://example.com/bookman/api/'

    // When / Then
    expect(getBookmanApiUrl('branches')).toBe('https://example.com/bookman/api/branches/')
  })
})
