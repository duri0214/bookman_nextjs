import { Branch, IBranchRaw } from '@/resource/branch'
import { IStaffRaw, Staff } from '@/resource/staff'
import { getBookmanApiUrl } from '@/helpers/apiClient'
import { convertBranchData } from '@/app/branch/_components/listData'

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true'

const MOCK_BRANCHES: IBranchRaw[] = [
  {
    id: 1,
    name: '中央図書館',
    address: '東京都渋谷区神宮前1-4-1',
    phone: '03-3403-2591',
    remark: '鉄筋コンクリート造 地下1階地上5階 4,450㎡（294席）',
  },
]

const MOCK_STAFF: IStaffRaw[] = [
  {
    id: 1001,
    name: '図書館対応者',
    branch: 1,
    branch_name: '中央図書館',
    role: 'counter',
  },
]

interface StaffListData {
  branches: Branch[]
  staff: Staff[]
  errorMessage: string | null
  isMockData: boolean
}

export const convertStaffData = (data: IStaffRaw[]): Staff[] =>
  data.map((staff) => ({
    id: staff.id,
    name: staff.name,
    branchId: staff.branch,
    branchName: staff.branch_name ?? (staff.branch ? `支店 #${staff.branch}` : '未所属'),
    role: staff.role,
  }))

const loadBookmanData = async <T>(apiUrl: string): Promise<T> => {
  const response = await fetch(apiUrl, { method: 'GET', cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`)
  }
  return response.json()
}

export const getStaffListData = async (): Promise<StaffListData> => {
  try {
    const [branches, staff] = await Promise.all([
      loadBookmanData<IBranchRaw[]>(getBookmanApiUrl('branches')),
      loadBookmanData<IStaffRaw[]>(getBookmanApiUrl('staff')),
    ])

    return {
      branches: convertBranchData(branches),
      staff: convertStaffData(staff),
      errorMessage: null,
      isMockData: false,
    }
  } catch (e) {
    console.error('職員データの取得に失敗しました: ', e)

    if (USE_MOCK_DATA) {
      return {
        branches: convertBranchData(MOCK_BRANCHES),
        staff: convertStaffData(MOCK_STAFF),
        errorMessage: null,
        isMockData: true,
      }
    }

    return {
      branches: [],
      staff: [],
      errorMessage:
        '職員データの取得に失敗しました。バックエンドを起動してから再読み込みしてください。',
      isMockData: false,
    }
  }
}
