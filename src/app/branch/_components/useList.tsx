import { useCallback, useState } from 'react'
import { Branch, IBranchRaw } from '@/resource/branch'

const API_BRANCH_URL = 'http://127.0.0.1:8000/bookman/api/branches/'
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

const MOCK_BRANCHES: IBranchRaw[] = [
  {
    id: 1,
    name: '本店',
    address: '東京都千代田区丸の内1-1-1',
    phone: '03-0000-0000',
    remark: '開発用モックデータ',
  },
  {
    id: 2,
    name: '大阪支店',
    address: '大阪府大阪市北区梅田1-1-1',
    phone: '06-0000-0000',
    remark: '開発用モックデータ',
  },
]

/**
 * IBranchRawから、branchリソース に変換したもの
 *
 * @param {Array} data - The raw branch data to be formatted.
 * @return {Array} - The formatted branch data.
 */
const convertBranchData = (data: IBranchRaw[]): Branch[] =>
  data.map((result: IBranchRaw) => ({
    id: result.id,
    name: result.name,
    address: result.address,
    phone: result.phone,
    remark: result.remark,
  }))

/**
 * API fetch とエラーハンドリング
 *
 * @param {string} apiUrl - The URL of the API to fetch the branch list from.
 * @returns {Promise<IBranchRaw[]>} - A promise that resolves to an array of branch data.
 * @throws {Error} - If the API request fails or returns an error status.
 */
const loadBranchList = async (apiUrl: string): Promise<IBranchRaw[]> => {
  const response = await fetch(apiUrl, { method: 'GET' })
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`)
  }
  return response.json()
}

/**
 * APIにアクセスし、そして branch のリストを返します
 *
 * @returns {Object} An object containing the following functions and properties:
 *   - loading: A function that loads the branch list from the API and updates the state with the formatted data.
 *   - branches: An array of branch objects.
 * @throws {Error} If the API request fails or the data is not in the expected format.
 * @example
 * const { loading, branches } = useList();
 * loading()
 *   .then((formattedData) => {
 *     console.log(formattedData);
 *     console.log(branches);
 *   })
 *   .catch((error) => {
 *     console.error(error);
 *   });
 */
export const useList = () => {
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isMockData, setIsMockData] = useState(false)

  const loading = useCallback(async (): Promise<Branch[]> => {
    setIsLoading(true)
    setErrorMessage(null)
    setIsMockData(false)

    try {
      const responseData = await loadBranchList(API_BRANCH_URL)
      const formattedData: Branch[] = convertBranchData(responseData)
      setBranches(formattedData)
      return formattedData
    } catch (e) {
      console.error('データの取得に失敗しました: ', e)

      if (USE_MOCK_DATA) {
        const formattedData: Branch[] = convertBranchData(MOCK_BRANCHES)
        setBranches(formattedData)
        setIsMockData(true)
        return formattedData
      }

      setBranches([])
      setErrorMessage(
        '支店データの取得に失敗しました。バックエンドを起動してから再読み込みしてください。',
      )
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { loading, branches, isLoading, errorMessage, isMockData }
}
