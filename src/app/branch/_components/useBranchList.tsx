import { useState } from 'react'
import { Branch, IBranchRaw } from '@/resource/branch'

const API_BRANCH_URL = 'http://127.0.0.1:8000/bookman/api/branches/'

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
 * @returns {Promise<any[]>} - A promise that resolves to an array of branch data.
 * @throws {Error} - If the API request fails or returns an error status.
 */
const loadBranchList = async (apiUrl: string): Promise<any[]> => {
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
 *   - handleLoadingBranchList: A function that loads the branch list from the API and updates the state with the formatted data.
 *   - branches: An array of branch objects.
 * @throws {Error} If the API request fails or the data is not in the expected format.
 * @example
 * const { handleLoadingBranchList, branches } = useBranchList();
 * handleLoadingBranchList()
 *   .then((formattedData) => {
 *     console.log(formattedData);
 *     console.log(branches);
 *   })
 *   .catch((error) => {
 *     console.error(error);
 *   });
 */
export const useBranchList = () => {
  const [branches, setBranches] = useState<Branch[]>([])

  const handleLoadingBranchList = async (): Promise<Branch[]> => {
    const responseData = await loadBranchList(API_BRANCH_URL)
    const formattedData: Branch[] = convertBranchData(responseData)
    setBranches(formattedData)
    return formattedData
  }

  return { handleLoadingBranchList, branches }
}
