import { getBookmanApiUrl } from '@/helpers/apiClient'
import { Customer, ICustomerRaw } from '@/resource/customer'
import {
  BranchBookStock,
  IBranchBookStockRaw,
  ILendingRaw,
  ILibraryStaffRaw,
  Lending,
  LibraryStaff,
} from '@/resource/lending'
import { convertCustomerData } from '@/app/customer/_components/listData'

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true'

const MOCK_CUSTOMERS: ICustomerRaw[] = [
  { id: 1, name: '山田 太郎', phone: '03-0000-0001', max_lending_count: 5 },
  { id: 2, name: '佐藤 花子', phone: '090-0000-0002', max_lending_count: 3 },
]

const MOCK_STAFF: ILibraryStaffRaw[] = [
  { id: 1, name: '田中 職員', branch: 1, branch_name: '中央図書館' },
  { id: 2, name: '鈴木 職員', branch: 2, branch_name: '東図書館' },
]

const MOCK_BRANCH_BOOK_STOCKS: IBranchBookStockRaw[] = [
  {
    id: 1,
    branch: 1,
    book: 1,
    amount: 3,
    available_amount: 2,
    branch_name: '中央図書館',
    book_name: 'Bookman 入門',
  },
  {
    id: 2,
    branch: 2,
    book: 2,
    amount: 1,
    available_amount: 1,
    branch_name: '東図書館',
    book_name: '店舗運営ハンドブック',
  },
]

const MOCK_LENDINGS: ILendingRaw[] = [
  {
    id: 1,
    branch_book_stock: 1,
    customer: 1,
    contact_staff: 1,
    return_date: '2026-01-30',
    active: true,
    book_name: 'Bookman 入門',
    branch_name: '中央図書館',
    customer_name: '山田 太郎',
    contact_staff_name: '田中 職員',
    lending_date: '2026-01-20',
    returned_at: null,
  },
]

interface LendingPageData {
  customers: Customer[]
  staffMembers: LibraryStaff[]
  branchBookStocks: BranchBookStock[]
  lendings: Lending[]
  errorMessage: string | null
  isMockData: boolean
}

const loadBookmanData = async <T>(apiUrl: string): Promise<T> => {
  const response = await fetch(apiUrl, { method: 'GET', cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`)
  }
  return response.json()
}

export const convertBranchBookStockData = (
  branchBookStocks: IBranchBookStockRaw[],
): BranchBookStock[] =>
  branchBookStocks.map((branchBookStock) => ({
    id: branchBookStock.id,
    branchId: branchBookStock.branch,
    bookId: branchBookStock.book,
    branchName: branchBookStock.branch_name ?? `支店 #${branchBookStock.branch}`,
    bookName: branchBookStock.book_name ?? `書籍 #${branchBookStock.book}`,
    amount: branchBookStock.amount,
    availableAmount: branchBookStock.available_amount ?? branchBookStock.amount,
  }))

export const convertStaffData = (staffMembers: ILibraryStaffRaw[]): LibraryStaff[] =>
  staffMembers.map((staff) => ({
    id: staff.id,
    name: staff.name,
    branchId: staff.branch ?? null,
    branchName: staff.branch_name ?? '',
  }))

export const convertLendingData = (lendings: ILendingRaw[]): Lending[] =>
  lendings.map((lending) => ({
    id: lending.id,
    branchBookStockId: lending.branch_book_stock,
    customerId: lending.customer,
    contactStaffId: lending.contact_staff,
    returnDate: lending.return_date,
    active: lending.active,
    bookName: lending.book_name ?? `支店別所蔵 #${lending.branch_book_stock}`,
    branchName: lending.branch_name ?? '',
    customerName: lending.customer_name ?? `利用者 #${lending.customer}`,
    contactStaffName: lending.contact_staff_name ?? `職員 #${lending.contact_staff}`,
    lendingDate: lending.lending_date ?? '',
    returnedAt: lending.returned_at ?? null,
  }))

const buildData = (
  customers: ICustomerRaw[],
  staffMembers: ILibraryStaffRaw[],
  branchBookStocks: IBranchBookStockRaw[],
  lendings: ILendingRaw[],
  isMockData: boolean,
): LendingPageData => ({
  customers: convertCustomerData(customers),
  staffMembers: convertStaffData(staffMembers),
  branchBookStocks: convertBranchBookStockData(branchBookStocks),
  lendings: convertLendingData(lendings),
  errorMessage: null,
  isMockData,
})

export const getLendingPageData = async (): Promise<LendingPageData> => {
  try {
    const [customers, staffMembers, branchBookStocks, lendings] = await Promise.all([
      loadBookmanData<ICustomerRaw[]>(getBookmanApiUrl('customers')),
      loadBookmanData<ILibraryStaffRaw[]>(getBookmanApiUrl('staff')),
      loadBookmanData<IBranchBookStockRaw[]>(getBookmanApiUrl('branchBookStocks')),
      loadBookmanData<ILendingRaw[]>(getBookmanApiUrl('lendings')),
    ])

    return buildData(customers, staffMembers, branchBookStocks, lendings, false)
  } catch (e) {
    console.error('貸出データの取得に失敗しました: ', e)

    if (USE_MOCK_DATA) {
      return buildData(MOCK_CUSTOMERS, MOCK_STAFF, MOCK_BRANCH_BOOK_STOCKS, MOCK_LENDINGS, true)
    }

    return {
      customers: [],
      staffMembers: [],
      branchBookStocks: [],
      lendings: [],
      errorMessage:
        '貸出データの取得に失敗しました。バックエンドを起動してから再読み込みしてください。',
      isMockData: false,
    }
  }
}
