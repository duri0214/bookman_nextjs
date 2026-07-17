import { fetchBookmanData, fetchData } from '@/helpers/fetchData'
import axios from 'axios'

jest.mock('axios')

describe('fetchData function', () => {
  const testUrl = 'https://testurl.com'
  const originalBookmanApiBaseUrl = process.env.BOOKMAN_API_BASE_URL

  afterEach(() => {
    jest.clearAllMocks()

    if (originalBookmanApiBaseUrl === undefined) {
      delete process.env.BOOKMAN_API_BASE_URL
      return
    }

    process.env.BOOKMAN_API_BASE_URL = originalBookmanApiBaseUrl
  })

  /**
   * シナリオ:
   * - 入力: axios.get が API の成功レスポンスを返す状態。
   * - 処理: 指定 URL を fetchData で取得する。
   * - 期待値: axios の data / status / statusText がそのまま返ること。
   */
  it('successfully fetches data from an API', async () => {
    // Given
    const mockSuccessResponse = Promise.resolve({
      data: {
        id: 'xxx',
        name: 'Test data',
      },
      status: 200,
      statusText: 'OK',
    })

    jest.mocked(axios.get).mockResolvedValue(mockSuccessResponse)

    // When
    const result = await fetchData(testUrl)

    // Then
    expect(result).toEqual(await mockSuccessResponse)
  })

  /**
   * シナリオ:
   * - 入力: axios.get がリクエスト失敗として reject する状態。
   * - 処理: 指定 URL を fetchData で取得する。
   * - 期待値: 画面側で扱える共通エラー形式として reject されること。
   */
  it('returns an error when the request fails', async () => {
    // Given
    const errorMessage = { data: null, status: 'error', statusText: 'Error occurred.' }

    jest.mocked(axios.get).mockImplementationOnce(() => Promise.reject(errorMessage))

    // When / Then
    await expect(fetchData(testUrl)).rejects.toEqual(errorMessage)
  })

  /**
   * シナリオ:
   * - 入力: BOOKMAN_API_BASE_URL に検証環境 URL を設定し、axios.get が成功レスポンスを返す状態。
   * - 処理: branches endpoint を fetchBookmanData で取得する。
   * - 期待値: 設定した base URL から組み立てた branches URL へ GET し、レスポンスが返ること。
   */
  it('fetches data from a Bookman API endpoint', async () => {
    // Given
    process.env.BOOKMAN_API_BASE_URL = 'https://example.com/bookman/api'
    const mockSuccessResponse = Promise.resolve({
      data: [],
      status: 200,
      statusText: 'OK',
    })

    jest.mocked(axios.get).mockResolvedValue(mockSuccessResponse)

    // When / Then
    await expect(fetchBookmanData('branches')).resolves.toEqual(await mockSuccessResponse)
    expect(axios.get).toHaveBeenCalledWith('https://example.com/bookman/api/branches/')
  })
})
