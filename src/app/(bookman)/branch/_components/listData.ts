import { Branch, IBranchRaw } from '@/resource/branch'
import { getBookmanApiUrl } from '@/helpers/apiClient'

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true'

const MOCK_BRANCHES: IBranchRaw[] = [
  {
    id: 1,
    name: '図書館 本店',
    address: '東京都千代田区図書館町1-1-1',
    phone: '03-0000-0000',
    remark: '中央図書館の開発用モックデータ',
  },
  {
    id: 2,
    name: '図書館 児童書分館',
    address: '東京都千代田区図書館町2-1-1',
    phone: '06-0000-0000',
    remark: '児童書分館の開発用モックデータ',
  },
]

interface BranchListData {
  branches: Branch[]
  errorMessage: string | null
  isMockData: boolean
}

const convertBranchData = (data: IBranchRaw[]): Branch[] =>
  data.map((result: IBranchRaw) => ({
    id: result.id,
    name: result.name,
    address: result.address,
    phone: result.phone,
    remark: result.remark,
  }))

const loadBranchList = async (apiUrl: string): Promise<IBranchRaw[]> => {
  const response = await fetch(apiUrl, { method: 'GET', cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`)
  }
  return response.json()
}

export const getBranchListData = async (): Promise<BranchListData> => {
  try {
    const responseData = await loadBranchList(getBookmanApiUrl('branches'))
    return {
      branches: convertBranchData(responseData),
      errorMessage: null,
      isMockData: false,
    }
  } catch (e) {
    console.error('データの取得に失敗しました: ', e)

    if (USE_MOCK_DATA) {
      return {
        branches: convertBranchData(MOCK_BRANCHES),
        errorMessage: null,
        isMockData: true,
      }
    }

    return {
      branches: [],
      errorMessage:
        '支店データの取得に失敗しました。バックエンドを起動してから再読み込みしてください。',
      isMockData: false,
    }
  }
}
