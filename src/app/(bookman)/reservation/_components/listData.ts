import { getBookmanApiUrl } from '@/helpers/apiClient'
import { Customer, ICustomerRaw } from '@/resource/customer'
import { BranchBookStock, IBranchBookStockRaw } from '@/resource/lending'
import { IReservationRaw, Reservation, ReservationStatus } from '@/resource/reservation'
import { convertCustomerData } from '@/app/customer/_components/listData'
import { convertBranchBookStockData } from '@/app/lending/_components/listData'

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true'

const MOCK_CUSTOMERS: ICustomerRaw[] = [
  { id: 1, name: '山田 太郎', phone: '03-0000-0001', max_lending_count: 5 },
  { id: 2, name: '佐藤 花子', phone: '090-0000-0002', max_lending_count: 3 },
]

const MOCK_BRANCH_BOOK_STOCKS: IBranchBookStockRaw[] = [
  {
    id: 1,
    branch: 1,
    book: 1,
    amount: 1,
    available_amount: 0,
    branch_name: '中央図書館',
    book_name: 'Bookman 入門',
  },
  {
    id: 2,
    branch: 2,
    book: 2,
    amount: 2,
    available_amount: 1,
    branch_name: '東図書館',
    book_name: '店舗運営ハンドブック',
  },
]

const MOCK_RESERVATIONS: IReservationRaw[] = [
  {
    id: 1,
    branch_book_stock: 1,
    book_name: 'Bookman 入門',
    branch_name: '中央図書館',
    customer: 2,
    customer_name: '佐藤 花子',
    status: 'held',
    hold_expires_on: '2026-01-27',
    created_at: '2026-01-20T09:00:00+09:00',
  },
]

const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  waiting: '予約待ち',
  held: '取り置き中',
  canceled: '取消済み',
  expired: '期限切れ',
  fulfilled: '貸出済み',
}

interface ReservationPageData {
  customers: Customer[]
  branchBookStocks: BranchBookStock[]
  reservations: Reservation[]
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

const isPastDate = (dateValue: string | null): boolean => {
  if (!dateValue) {
    return false
  }

  const today = new Date().toISOString().slice(0, 10)
  return dateValue < today
}

export const convertReservationData = (reservations: IReservationRaw[]): Reservation[] =>
  reservations.map((reservation) => ({
    id: reservation.id,
    branchBookStockId: reservation.branch_book_stock,
    bookName: reservation.book_name ?? `支店別所蔵 #${reservation.branch_book_stock}`,
    branchName: reservation.branch_name ?? '',
    customerId: reservation.customer,
    customerName: reservation.customer_name ?? `利用者 #${reservation.customer}`,
    status: reservation.status,
    statusLabel: RESERVATION_STATUS_LABELS[reservation.status] ?? reservation.status,
    holdExpiresOn: reservation.hold_expires_on,
    createdAt: reservation.created_at,
    needsStaffFollowUp: reservation.status === 'held',
    isExpiredHold: reservation.status === 'held' && isPastDate(reservation.hold_expires_on),
  }))

const buildData = (
  customers: ICustomerRaw[],
  branchBookStocks: IBranchBookStockRaw[],
  reservations: IReservationRaw[],
  isMockData: boolean,
): ReservationPageData => ({
  customers: convertCustomerData(customers),
  branchBookStocks: convertBranchBookStockData(branchBookStocks),
  reservations: convertReservationData(reservations),
  errorMessage: null,
  isMockData,
})

export const getReservationPageData = async (): Promise<ReservationPageData> => {
  try {
    const [customers, branchBookStocks, reservations] = await Promise.all([
      loadBookmanData<ICustomerRaw[]>(getBookmanApiUrl('customers')),
      loadBookmanData<IBranchBookStockRaw[]>(getBookmanApiUrl('branchBookStocks')),
      loadBookmanData<IReservationRaw[]>(getBookmanApiUrl('reservations')),
    ])

    return buildData(customers, branchBookStocks, reservations, false)
  } catch (e) {
    console.error('予約データの取得に失敗しました: ', e)

    if (USE_MOCK_DATA) {
      return buildData(MOCK_CUSTOMERS, MOCK_BRANCH_BOOK_STOCKS, MOCK_RESERVATIONS, true)
    }

    return {
      customers: [],
      branchBookStocks: [],
      reservations: [],
      errorMessage:
        '予約データの取得に失敗しました。バックエンドを起動してから再読み込みしてください。',
      isMockData: false,
    }
  }
}
