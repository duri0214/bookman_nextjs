import { Branch, BranchClosedDay, IBranchClosedDayRaw, IBranchRaw } from '@/resource/branch'
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

const MOCK_BRANCH_CLOSED_DAYS: IBranchClosedDayRaw[] = [
  {
    id: 1,
    branch: 1,
    branch_name: '図書館 本店',
    date: '2026-01-01',
    reason: '年末年始',
  },
  {
    id: 2,
    branch: 2,
    branch_name: '図書館 児童書分館',
    date: '2026-01-15',
    reason: '館内整理日',
  },
]

interface BranchListData {
  branches: Branch[]
  closedDays: BranchClosedDay[]
  errorMessage: string | null
  isMockData: boolean
}

export const convertBranchData = (data: IBranchRaw[]): Branch[] =>
  data.map((result: IBranchRaw) => ({
    id: result.id,
    name: result.name,
    address: result.address,
    phone: result.phone,
    remark: result.remark,
  }))

export const convertBranchClosedDayData = (closedDays: IBranchClosedDayRaw[]): BranchClosedDay[] =>
  closedDays.map((closedDay) => ({
    id: closedDay.id,
    branchId: closedDay.branch,
    branchName: closedDay.branch_name ?? `支店 #${closedDay.branch}`,
    date: closedDay.date,
    reason: closedDay.reason,
  }))

const loadBookmanData = async <T>(apiUrl: string): Promise<T> => {
  const response = await fetch(apiUrl, { method: 'GET', cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`)
  }
  return response.json()
}

export const getBranchListData = async (): Promise<BranchListData> => {
  try {
    const [branches, closedDays] = await Promise.all([
      loadBookmanData<IBranchRaw[]>(getBookmanApiUrl('branches')),
      loadBookmanData<IBranchClosedDayRaw[]>(getBookmanApiUrl('branchClosedDays')),
    ])
    return {
      branches: convertBranchData(branches),
      closedDays: convertBranchClosedDayData(closedDays),
      errorMessage: null,
      isMockData: false,
    }
  } catch (e) {
    console.error('データの取得に失敗しました: ', e)

    if (USE_MOCK_DATA) {
      return {
        branches: convertBranchData(MOCK_BRANCHES),
        closedDays: convertBranchClosedDayData(MOCK_BRANCH_CLOSED_DAYS),
        errorMessage: null,
        isMockData: true,
      }
    }

    return {
      branches: [],
      closedDays: [],
      errorMessage:
        '支店データの取得に失敗しました。バックエンドを起動してから再読み込みしてください。',
      isMockData: false,
    }
  }
}
