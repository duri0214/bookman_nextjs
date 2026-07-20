import { ChangeEvent } from 'react'
import { act, renderHook } from '@testing-library/react'
import { BranchBookStock } from '@/resource/lending'
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
})
