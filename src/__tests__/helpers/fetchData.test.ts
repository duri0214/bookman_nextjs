import { fetchData } from '@/helpers/fetchData'
import axios from 'axios'

jest.mock('axios')

describe('fetchData function', () => {
  const testUrl = 'https://testurl.com'
  it('successfully fetches data from an API', async () => {
    const mockSuccessResponse = Promise.resolve({
      data: {
        data: 'Test data',
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
})
