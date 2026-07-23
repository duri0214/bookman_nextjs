import { ChangeEvent } from 'react'
import { act, renderHook } from '@testing-library/react'
import { BranchBookStock, Lending } from '@/resource/lending'
import { useReservationActions } from '@/app/reservation/_components/useReservationActions'

const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

const branchBookStocks: BranchBookStock[] = [
  {
    id: 10,
    branchId: 1,
    bookId: 2,
    branchName: '中央図書館',
    bookName: 'Bookman 入門',
    amount: 1,
    availableAmount: 0,
  },
  {
    id: 11,
    branchId: 1,
    bookId: 3,
    branchName: '中央図書館',
    bookName: '貸出可能な本',
    amount: 2,
    availableAmount: 1,
  },
]

const lendings: Lending[] = [
  {
    id: 5,
    branchBookStockId: 10,
    customerId: 20,
    contactStaffId: 30,
    returnDate: '2026-01-30',
    active: true,
    bookName: 'Bookman 入門',
    branchName: '中央図書館',
    customerName: '山田 太郎',
    contactStaffName: '田中 職員',
    lendingDate: '2026-01-20',
    returnedAt: null,
  },
]

describe('useReservationActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  test('onCreateが成功した時に予約登録APIへPOSTして一覧を再取得するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 貸出可能冊数0の支店別所蔵と利用者のフォーム入力。
     * - 処理: onCreate を呼び出す。
     * - 期待値: 数値化したpayloadで予約登録APIへPOSTし、一覧を再取得すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(() => useReservationActions(branchBookStocks, []))

    act(() => {
      result.current.onInputChange({
        target: { name: 'branchBookStock', value: '10' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'customer', value: '20' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onCreate()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        branch_book_stock: 10,
        customer: 20,
      }),
    })
    expect(result.current.message).toBe('予約を登録しました。')
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  test('貸出可能冊数が残っている支店別所蔵は予約登録APIへPOSTしないべき', async () => {
    /**
     * シナリオ:
     * - 入力: 貸出可能冊数1の支店別所蔵を選択したフォーム入力。
     * - 処理: onCreate を呼び出す。
     * - 期待値: 予約登録APIを呼ばず、貸出登録へ誘導するエラーを表示すること。
     */
    const { result } = renderHook(() => useReservationActions(branchBookStocks, []))

    act(() => {
      result.current.onInputChange({
        target: { name: 'branchBookStock', value: '11' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'customer', value: '20' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onCreate()
    })

    expect(global.fetch).not.toHaveBeenCalled()
    expect(result.current.message).toBe(
      '対象の本は貸出可能冊数が残っているため予約できません。貸出画面から貸出登録してください。',
    )
  })

  test('onCancelが成功した時に予約取消APIへPOSTして一覧を再取得するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 予約ID 7。
     * - 処理: onCancel を呼び出す。
     * - 期待値: 予約取消APIへPOSTし、一覧を再取得すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(() => useReservationActions(branchBookStocks, []))

    await act(async () => {
      await result.current.onCancel(7)
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/reservations/7/cancel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })
    expect(result.current.message).toBe('予約を取り消しました。')
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  test('同じ本を貸出中の利用者は予約登録APIへPOSTしないべき', async () => {
    /**
     * シナリオ:
     * - 入力: 選択した支店別所蔵の本をすでに貸出中の利用者。
     * - 処理: onCreate を呼び出す。
     * - 期待値: 予約登録APIを呼ばず、同じ本を貸出中の利用者は予約できないメッセージを表示すること。
     */
    const { result } = renderHook(() => useReservationActions(branchBookStocks, lendings))

    act(() => {
      result.current.onInputChange({
        target: { name: 'branchBookStock', value: '10' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'customer', value: '20' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onCreate()
    })

    expect(global.fetch).not.toHaveBeenCalled()
    expect(result.current.message).toBe('同じ本を貸出中の利用者は予約できません。')
    expect(result.current.customersLendingSelectedBook.has(20)).toBe(true)
  })
})
