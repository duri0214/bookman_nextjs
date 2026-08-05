import { render, screen, within } from '@testing-library/react'
import { PageClient } from '@/app/lending/_components/PageClient'
import { Customer } from '@/resource/customer'
import { BranchBookStock, Lending, LibraryStaff } from '@/resource/lending'
import { Reservation } from '@/resource/reservation'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}))

jest.mock('@mui/x-data-grid', () => ({
  DataGrid: ({
    columns,
  }: {
    columns: {
      field: string
      headerName?: string
    }[]
  }) => (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.field}>{column.headerName}</th>
          ))}
        </tr>
      </thead>
    </table>
  ),
}))

const customers: Customer[] = [
  {
    id: 1,
    name: '山田 太郎',
    phone: '03-0000-0000',
    maxLendingCount: 3,
  },
]

const staffMembers: LibraryStaff[] = [
  {
    id: 1,
    name: '田中 職員',
    branchId: 1,
    branchName: '中央図書館',
    role: 'counter',
  },
]

const branchBookStocks: BranchBookStock[] = [
  {
    id: 10,
    branchId: 1,
    municipalityId: 1,
    municipalityName: '渋谷区',
    bookId: 100,
    branchName: '中央図書館',
    bookName: 'Bookman 入門',
    amount: 3,
    availableAmount: 0,
  },
]

const lendings: Lending[] = [
  {
    id: 20,
    branchBookStockId: 10,
    customerId: 1,
    contactStaffId: 1,
    returnDate: '2026-01-30',
    active: true,
    bookName: 'Bookman 入門',
    branchName: '中央図書館',
    customerName: '山田 太郎',
    contactStaffName: '田中 職員',
    lendingDate: '2026-01-20',
    returnedAt: null,
    originalReturnDate: null,
    returnDateAdjusted: false,
    returnDateAdjustmentReason: '',
  },
]

const reservations: Reservation[] = [
  {
    id: 30,
    branchBookStockId: 10,
    bookName: 'Bookman 入門',
    branchName: '中央図書館',
    customerId: 1,
    customerName: '山田 太郎',
    status: 'waiting',
    statusLabel: '予約待ち',
    holdExpiresOn: null,
    createdAt: '2026-01-20',
    needsStaffFollowUp: false,
    isExpiredHold: false,
  },
]

describe('lending PageClient columns', () => {
  test('貸出中一覧と予約・取り置き一覧は操作列を本名の直後に表示するべき', () => {
    /**
     * シナリオ:
     * - 入力: 貸出中データと予約データが1件ずつある状態。
     * - 処理: 貸出画面を表示する。
     * - 期待値: 返却列と取消列がそれぞれ本名列の直後に表示されること。
     */
    render(
      <PageClient
        customers={customers}
        staffMembers={staffMembers}
        branchBookStocks={branchBookStocks}
        lendings={lendings}
        heldReservations={[]}
        reservations={reservations}
        errorMessage={null}
        isMockData={false}
      />,
    )

    const tables = screen.getAllByRole('table')
    const lendingHeaders = within(tables[0])
      .getAllByRole('columnheader')
      .map((header) => header.textContent?.trim())
    const reservationHeaders = within(tables[1])
      .getAllByRole('columnheader')
      .map((header) => header.textContent?.trim())

    expect(lendingHeaders).toEqual([
      '#',
      '本名',
      '返却',
      '支店名',
      '利用者名',
      '対応職員名',
      '返却予定日',
      '状態',
    ])
    expect(reservationHeaders).toEqual([
      '#',
      '本名',
      '取消',
      '支店名',
      '利用者名',
      '状態',
      '取り置き期限',
      '後続対応',
    ])
  })
})
