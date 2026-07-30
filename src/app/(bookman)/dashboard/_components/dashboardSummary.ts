import { Book, BookBranchStock } from '@/resource/book'
import { Lending } from '@/resource/lending'
import { Municipality } from '@/resource/municipality'
import { Reservation } from '@/resource/reservation'

export interface BranchStockSummary {
  branchName: string
  totalAmount: number
  bookCount: number
}

export interface MunicipalityOption {
  id: number
  name: string
}

export interface DashboardMetric {
  label: string
  value: string
  helperText: string
  status: 'connected' | 'planned'
}

export interface DashboardAction {
  label: string
  href?: string
  helperText: string
  status: 'available' | 'planned'
}

export interface DashboardSummary {
  totalBooks: number
  totalStocks: number
  stockedBranchCount: number
  selectedMunicipalityId: number | null
  municipalityOptions: MunicipalityOption[]
  lendingAvailableNotificationCount: number
  branchStocks: BranchStockSummary[]
  metrics: DashboardMetric[]
  actions: DashboardAction[]
}

const stockedOnly = (branchStock: BookBranchStock) => branchStock.amount > 0

const isDueSoon = (returnDate: string, today = new Date()): boolean => {
  if (!returnDate) {
    return false
  }

  const dueDate = new Date(`${returnDate}T00:00:00`)
  const todayDate = new Date(today.toISOString().slice(0, 10))
  const diffDays = Math.ceil((dueDate.getTime() - todayDate.getTime()) / 86400000)

  return diffDays >= 0 && diffDays <= 3
}

export const buildDashboardSummary = (
  books: Book[],
  lendings: Lending[] = [],
  reservations: Reservation[] = [],
  municipalities: Municipality[] = [],
  selectedMunicipalityId?: number | null,
): DashboardSummary => {
  const municipalityOptions = municipalities.map((municipality) => ({
    id: municipality.id,
    name: municipality.name,
  }))
  const requestedMunicipalityId =
    selectedMunicipalityId !== null && selectedMunicipalityId !== undefined
      ? selectedMunicipalityId
      : undefined
  const selectedMunicipality =
    requestedMunicipalityId !== undefined &&
    (municipalityOptions.length === 0 ||
      municipalityOptions.some((municipality) => municipality.id === requestedMunicipalityId))
      ? requestedMunicipalityId
      : (municipalityOptions[0]?.id ??
        books.flatMap((book) => book.branchStocks).find((branchStock) => branchStock.municipalityId)
          ?.municipalityId ??
        null)
  const scopedBooks =
    selectedMunicipality === null
      ? books
      : books
          .map((book) => {
            const branchStocks = book.branchStocks.filter(
              (branchStock) => branchStock.municipalityId === selectedMunicipality,
            )

            return {
              ...book,
              branchStocks,
              totalAmount: branchStocks.reduce((sum, branchStock) => sum + branchStock.amount, 0),
            }
          })
          .filter((book) => book.branchStocks.length > 0)
  const branchStockMap = new Map<string, BranchStockSummary>()
  const totalStocks = scopedBooks.reduce((sum, book) => sum + book.totalAmount, 0)
  const activeLendingCount = lendings.filter((lending) => lending.active).length
  const activeReservationCount = reservations.filter((reservation) =>
    ['waiting', 'held'].includes(reservation.status),
  ).length
  const dueSoonCount = lendings.filter(
    (lending) => lending.active && isDueSoon(lending.returnDate),
  ).length
  const lendingAvailableNotificationCount = reservations.filter(
    (reservation) => reservation.status === 'held',
  ).length

  scopedBooks.forEach((book) => {
    book.branchStocks.filter(stockedOnly).forEach((branchStock) => {
      const current = branchStockMap.get(branchStock.branchName) ?? {
        branchName: branchStock.branchName,
        totalAmount: 0,
        bookCount: 0,
      }

      branchStockMap.set(branchStock.branchName, {
        ...current,
        totalAmount: current.totalAmount + branchStock.amount,
        bookCount: current.bookCount + 1,
      })
    })
  })

  const branchStocks = Array.from(branchStockMap.values()).sort(
    (a, b) => b.totalAmount - a.totalAmount || a.branchName.localeCompare(b.branchName),
  )

  return {
    totalBooks: scopedBooks.length,
    totalStocks,
    stockedBranchCount: branchStocks.length,
    selectedMunicipalityId: selectedMunicipality,
    municipalityOptions,
    lendingAvailableNotificationCount,
    branchStocks,
    metrics: [
      {
        label: '書籍タイトル',
        value: `${books.length.toLocaleString()} 件`,
        helperText: '書籍 API から取得した登録タイトル数',
        status: 'connected',
      },
      {
        label: '自治体全体の所蔵',
        value: `${totalStocks.toLocaleString()} 冊`,
        helperText: '支店別所蔵数の合計を表示',
        status: 'connected',
      },
      {
        label: '貸出中',
        value: `${activeLendingCount.toLocaleString()} 件`,
        helperText: '貸出 API から取得した active=true の件数',
        status: 'connected',
      },
      {
        label: '予約・期限注意',
        value: `${activeReservationCount.toLocaleString()} 件 / ${dueSoonCount.toLocaleString()} 件`,
        helperText: '予約待ち・取り置き中の予約数と、3日以内に返却期限を迎える貸出数',
        status: 'connected',
      },
    ],
    actions: [
      {
        label: '支店別所蔵数と支店間移動を見る',
        href: '/book',
        helperText: '書籍管理画面で支店別所蔵と支店間移動を確認',
        status: 'available',
      },
      {
        label: '図書館を管理する',
        href: '/branch',
        helperText: '支店の基本情報を登録・更新',
        status: 'available',
      },
      {
        label: '貸出・予約を見る',
        href: '/lending',
        helperText: '貸出登録、返却、予約状況を確認',
        status: 'available',
      },
      {
        label: 'CSV登録で書籍をまとめて追加する',
        href: '/book?csvImport=1',
        helperText: '書籍管理画面のCSV登録ダイアログを開く',
        status: 'available',
      },
    ],
  }
}
