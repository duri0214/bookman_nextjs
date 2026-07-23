import { ChangeEvent } from 'react'
import { act, renderHook } from '@testing-library/react'
import { BranchBookStock } from '@/resource/lending'
import { Reservation } from '@/resource/reservation'
import { useLendingActions } from '@/app/lending/_components/useLendingActions'

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
    amount: 3,
    availableAmount: 1,
  },
]

const unavailableBranchBookStocks: BranchBookStock[] = [
  {
    ...branchBookStocks[0],
    availableAmount: 0,
  },
]

const heldReservations: Reservation[] = [
  {
    id: 8,
    branchBookStockId: 10,
    bookName: 'Bookman 入門',
    branchName: '中央図書館',
    customerId: 20,
    customerName: '佐藤 花子',
    status: 'held',
    statusLabel: '取り置き中',
    holdExpiresOn: '2026-01-27',
    createdAt: '2026-01-20T09:00:00+09:00',
    needsStaffFollowUp: true,
    isExpiredHold: false,
  },
]

describe('useLendingActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers().setSystemTime(new Date('2026-01-20T00:00:00.000Z'))
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('onCreateが成功した時に貸出登録APIへPOSTして一覧を再取得するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 支店別所蔵、利用者、対応職員、返却予定日のフォーム入力。
     * - 処理: onCreate を呼び出す。
     * - 期待値: 数値化したpayloadで貸出登録APIへPOSTし、一覧を再取得すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(() => useLendingActions(branchBookStocks))

    act(() => {
      result.current.onInputChange({
        target: { name: 'branchBookStock', value: '10' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'customer', value: '20' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'contactStaff', value: '30' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'returnDate', value: '2026-01-30' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onCreate()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/lendings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        branch_book_stock: 10,
        customer: 20,
        contact_staff: 30,
        return_date: '2026-01-30',
      }),
    })
    expect(result.current.message).toBe('貸出を登録しました。')
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  test('onCreateが成功した時に支店別所蔵の貸出可能冊数を即時反映するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 貸出可能冊数1の支店別所蔵を選択したフォーム入力。
     * - 処理: onCreate を呼び出す。
     * - 期待値: 貸出成功後、画面表示用の貸出可能冊数が1冊減ること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(() => useLendingActions(branchBookStocks))

    act(() => {
      result.current.onInputChange({
        target: { name: 'branchBookStock', value: '10' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'customer', value: '20' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'contactStaff', value: '30' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onCreate()
    })

    expect(result.current.branchBookStocks).toEqual([
      {
        ...branchBookStocks[0],
        availableAmount: 0,
      },
    ])
  })

  test('onCreateが休館日による期限調整レスポンスを表示用に保持するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 貸出登録APIが返却予定日調整済みのレスポンスを返す状態。
     * - 処理: onCreate を呼び出す。
     * - 期待値: 調整後の日付メッセージと、元日付・支店・理由の詳細を保持すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 5,
        branch_book_stock: 10,
        book_name: 'Bookman 入門',
        branch_name: '中央図書館',
        customer: 20,
        customer_name: '山田 太郎',
        contact_staff: 30,
        contact_staff_name: '田中 職員',
        return_date: '2026-01-17',
        original_return_date: '2026-01-15',
        return_date_adjusted: true,
        return_date_adjustment_reason: '蔵書点検、臨時休館',
        active: true,
      }),
    } as Response)
    const { result } = renderHook(() => useLendingActions(branchBookStocks))

    act(() => {
      result.current.onInputChange({
        target: { name: 'branchBookStock', value: '10' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'customer', value: '20' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'contactStaff', value: '30' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'returnDate', value: '2026-01-15' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onCreate()
    })

    expect(result.current.message).toBe('返却予定日が休館日のため、2026-01-17 に調整されました。')
    expect(result.current.returnDateAdjustmentMessage).toEqual({
      branchName: '中央図書館',
      originalReturnDate: '2026-01-15',
      adjustedReturnDate: '2026-01-17',
      reason: '蔵書点検、臨時休館',
    })
  })

  test('業務エラーcodeが返った時に画面用メッセージを保持するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 貸出登録APIが duplicate_book_lending の業務エラーを返す状態。
     * - 処理: onCreate を呼び出す。
     * - 期待値: API message がなくても画面用メッセージを表示し、一覧を再取得しないこと。
     */
    jest.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ code: 'duplicate_book_lending' }),
    } as Response)
    const { result } = renderHook(() => useLendingActions(branchBookStocks))

    act(() => {
      result.current.onInputChange({
        target: { name: 'branchBookStock', value: '10' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'customer', value: '20' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'contactStaff', value: '30' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onCreate()
    })

    expect(result.current.message).toBe('同じ利用者が同じ本をすでに借りています。')
    expect(result.current.messageSeverity).toBe('error')
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  test('取り置き中の利用者は貸出可能冊数0でも貸出登録APIへPOSTできるべき', async () => {
    /**
     * シナリオ:
     * - 入力: 貸出可能冊数0の支店別所蔵と、その支店別所蔵で取り置き中の利用者。
     * - 処理: onCreate を呼び出す。
     * - 期待値: 取り置き対象者への貸出として、貸出登録APIへPOSTすること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(() =>
      useLendingActions(unavailableBranchBookStocks, heldReservations),
    )

    act(() => {
      result.current.onInputChange({
        target: { name: 'branchBookStock', value: '10' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'customer', value: '20' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'contactStaff', value: '30' },
      } as ChangeEvent<HTMLInputElement>)
    })

    expect(result.current.selectedHeldReservation?.customerName).toBe('佐藤 花子')

    await act(async () => {
      await result.current.onCreate()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/lendings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        branch_book_stock: 10,
        customer: 20,
        contact_staff: 30,
        return_date: '2026-01-20',
      }),
    })
    expect(result.current.message).toBe('貸出を登録しました。')
  })

  test('onReturnが成功した時に返却APIへPOSTして一覧を再取得するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 貸出ID 5。
     * - 処理: onReturn を呼び出す。
     * - 期待値: 返却APIへ貸出IDをPOSTし、一覧を再取得すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(() => useLendingActions(branchBookStocks))

    await act(async () => {
      await result.current.onReturn(5)
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/lendings/return', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ lending: 5 }),
    })
    expect(result.current.message).toBe('返却を受け付けました。')
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  test('onReturnが取り置き予約を返した時に貸出可能メッセージを表示するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 返却APIが held_reservation を含む成功レスポンスを返す状態。
     * - 処理: onReturn を呼び出す。
     * - 期待値: 予約利用者に貸し出せるようになった旨のメッセージを表示すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        held_reservation: {
          id: 8,
          customer_name: '佐藤 花子',
          book_name: 'Bookman 入門',
          branch_name: '中央図書館',
          hold_expires_on: '2026-01-27',
        },
      }),
    } as Response)
    const { result } = renderHook(() => useLendingActions(branchBookStocks))

    await act(async () => {
      await result.current.onReturn(5)
    })

    expect(result.current.message).toBe('佐藤 花子に貸し出せるようになりました（Bookman 入門）。')
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  test('branchBookStocksのprops更新時にフラッシュメッセージを維持したまま一覧を同期するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 貸出登録成功後に、親から更新後の支店別所蔵propsが渡る状態。
     * - 処理: useLendingActions を rerender する。
     * - 期待値: 支店別所蔵表示はpropsに同期され、登録成功メッセージは維持されること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result, rerender } = renderHook(({ stocks }) => useLendingActions(stocks), {
      initialProps: { stocks: branchBookStocks },
    })

    act(() => {
      result.current.onInputChange({
        target: { name: 'branchBookStock', value: '10' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'customer', value: '20' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'contactStaff', value: '30' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onCreate()
    })

    rerender({
      stocks: [
        {
          ...branchBookStocks[0],
          availableAmount: 0,
        },
      ],
    })

    expect(result.current.branchBookStocks[0].availableAmount).toBe(0)
    expect(result.current.message).toBe('貸出を登録しました。')
  })
})
