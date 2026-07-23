import { Branch, IBranchRaw } from '@/resource/branch'
import { IStaffRaw, Staff } from '@/resource/staff'
import { getBookmanApiUrl } from '@/helpers/apiClient'
import { convertBranchData } from '@/app/branch/_components/listData'

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

const MOCK_STAFF: IStaffRaw[] = [
  {
    id: 1,
    name: '佐藤 花子',
    branch: 1,
    branch_name: '図書館 本店',
    role: 'counter',
  },
  {
    id: 2,
    name: '鈴木 太郎',
    branch: 1,
    branch_name: '図書館 本店',
    role: 'manager',
  },
  {
    id: 3,
    name: '田中 管理',
    branch: null,
    branch_name: null,
    role: 'admin',
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
