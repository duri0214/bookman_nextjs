import {
  Branch,
  BranchClosedDay,
  BranchSummary,
  IBranchBookStockRaw,
  IBranchClosedDayRaw,
  IBranchRaw,
} from '@/resource/branch'
import { getBookmanApiUrl } from '@/helpers/apiClient'
import { convertMunicipalityData } from '@/app/municipality/_components/listData'
import { IMunicipalityRaw, Municipality } from '@/resource/municipality'

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true'

const MOCK_BRANCHES: IBranchRaw[] = [
  {
    id: 1,
    municipality: 1,
    municipality_name: '渋谷区',
    name: '中央図書館',
    address: '東京都渋谷区神宮前1-4-1',
    phone: '03-3403-2591',
    remark: '鉄筋コンクリート造 地下1階地上5階 4,450㎡（294席）',
  },
  {
    id: 2,
    municipality: 1,
    municipality_name: '渋谷区',
    name: '西原図書館',
    address: '東京都渋谷区西原2-28-9',
    phone: '03-3460-8535',
    remark: '鉄筋コンクリート造 地下1階地上3階の2・3階部分 631㎡（61席）',
  },
]

const MOCK_BRANCH_CLOSED_DAYS: IBranchClosedDayRaw[] = [
  {
    id: 1,
    branch: 1,
    branch_name: '中央図書館',
    date: '2026-01-01',
    reason: '年末年始',
  },
  {
    id: 2,
    branch: 2,
    branch_name: '西原図書館',
    date: '2026-01-15',
    reason: '館内整理日',
  },
]

const MOCK_BRANCH_BOOK_STOCKS: IBranchBookStockRaw[] = [
  { id: 1, branch: 1, book: 1, amount: 2 },
  { id: 2, branch: 1, book: 2, amount: 1 },
  { id: 3, branch: 2, book: 1, amount: 1 },
]

const MOCK_MUNICIPALITIES: IMunicipalityRaw[] = [
  {
    id: 1,
    name: '渋谷区',
  },
]

interface BranchListData {
  branches: Branch[]
  branchSummaries: BranchSummary[]
  municipalities: Municipality[]
  closedDays: BranchClosedDay[]
  errorMessage: string | null
  isMockData: boolean
}

export const convertBranchData = (data: IBranchRaw[]): Branch[] =>
  data.map((result: IBranchRaw) => ({
    id: result.id,
    municipalityId: result.municipality ?? null,
    municipalityName: result.municipality_name ?? '未設定',
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

export const convertBranchSummaries = (stocks: IBranchBookStockRaw[]): BranchSummary[] => {
  const summaries = new Map<number, { bookIds: Set<number>; totalStockAmount: number }>()

  stocks.forEach((stock) => {
    const current = summaries.get(stock.branch) ?? {
      bookIds: new Set<number>(),
      totalStockAmount: 0,
    }
    current.bookIds.add(stock.book)
    current.totalStockAmount += stock.amount
    summaries.set(stock.branch, current)
  })

  return Array.from(summaries.entries()).map(([branchId, summary]) => ({
    branchId,
    bookCount: summary.bookIds.size,
    totalStockAmount: summary.totalStockAmount,
  }))
}

const loadBookmanData = async <T>(apiUrl: string): Promise<T> => {
  const response = await fetch(apiUrl, { method: 'GET', cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`)
  }
  return response.json()
}

export const getBranchListData = async (): Promise<BranchListData> => {
  try {
    const [branches, municipalities, closedDays, branchBookStocks] = await Promise.all([
      loadBookmanData<IBranchRaw[]>(getBookmanApiUrl('branches')),
      loadBookmanData<IMunicipalityRaw[]>(getBookmanApiUrl('municipalities')),
      loadBookmanData<IBranchClosedDayRaw[]>(getBookmanApiUrl('branchClosedDays')),
      loadBookmanData<IBranchBookStockRaw[]>(getBookmanApiUrl('branchBookStocks')),
    ])
    return {
      branches: convertBranchData(branches),
      branchSummaries: convertBranchSummaries(branchBookStocks),
      municipalities: convertMunicipalityData(municipalities),
      closedDays: convertBranchClosedDayData(closedDays),
      errorMessage: null,
      isMockData: false,
    }
  } catch (e) {
    console.error('データの取得に失敗しました: ', e)

    if (USE_MOCK_DATA) {
      return {
        branches: convertBranchData(MOCK_BRANCHES),
        branchSummaries: convertBranchSummaries(MOCK_BRANCH_BOOK_STOCKS),
        municipalities: convertMunicipalityData(MOCK_MUNICIPALITIES),
        closedDays: convertBranchClosedDayData(MOCK_BRANCH_CLOSED_DAYS),
        errorMessage: null,
        isMockData: true,
      }
    }

    return {
      branches: [],
      branchSummaries: [],
      municipalities: [],
      closedDays: [],
      errorMessage:
        '支店データの取得に失敗しました。バックエンドを起動してから再読み込みしてください。',
      isMockData: false,
    }
  }
}
