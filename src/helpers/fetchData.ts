import axios, { AxiosResponse } from 'axios'
import { BookmanApiEndpoint, getBookmanApiUrl } from '@/helpers/apiClient'

/**
 * フェッチデータリクエストのレスポンスを表します
 *
 * @interface IFetchDataResponse
 */
export interface IFetchDataResponse {
  data: unknown
  status: number
  statusText: string
}

/**
 * 指定されたURLからデータをフェッチします
 *
 * @param {string} url - データをフェッチするURL
 * @returns {Promise<IFetchDataResponse>} フェッチしたデータのレスポンス
 * @throws object エラーの詳細を含むオブジェクト
 */
export const fetchData = async (url: string): Promise<IFetchDataResponse> => {
  try {
    const response: AxiosResponse = await axios.get(url)
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
    }
  } catch {
    throw { data: null, status: 'error', statusText: 'Error occurred.' }
  }
}

export const fetchBookmanData = async (endpoint: BookmanApiEndpoint): Promise<IFetchDataResponse> =>
  fetchData(getBookmanApiUrl(endpoint))
