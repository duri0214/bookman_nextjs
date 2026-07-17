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
  it('successfully fetches data from an API', async () => {
    const mockSuccessResponse = Promise.resolve({
      data: {
        id: 'xxx',
        name: 'Test data',
      },
      status: 200,
      statusText: 'OK',
    })

    jest.mocked(axios.get).mockResolvedValue(mockSuccessResponse)

    const result = await fetchData(testUrl)
    expect(result).toEqual(await mockSuccessResponse)
  })

  it('returns an error when the request fails', async () => {
    const errorMessage = { data: null, status: 'error', statusText: 'Error occurred.' }

    jest.mocked(axios.get).mockImplementationOnce(() => Promise.reject(errorMessage))

    await expect(fetchData(testUrl)).rejects.toEqual(errorMessage)
  })

  it('fetches data from a Bookman API endpoint', async () => {
    process.env.BOOKMAN_API_BASE_URL = 'https://example.com/bookman/api'
    const mockSuccessResponse = Promise.resolve({
      data: [],
      status: 200,
      statusText: 'OK',
    })

    jest.mocked(axios.get).mockResolvedValue(mockSuccessResponse)

    await expect(fetchBookmanData('branches')).resolves.toEqual(await mockSuccessResponse)
    expect(axios.get).toHaveBeenCalledWith('https://example.com/bookman/api/branches/')
  })
})
