import { ChangeEvent } from 'react'
import { act, renderHook } from '@testing-library/react'
import { useBranchClosedDayActions } from '@/app/branch/_components/useBranchClosedDayActions'

const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

describe('useBranchClosedDayActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    window.confirm = jest.fn(() => true)
  })

  test('onCreateが成功した時に休館日登録APIへPOSTして一覧を再取得するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 支店、休館日、理由のフォーム入力。
     * - 処理: onCreate を呼び出す。
     * - 期待値: 数値化したpayloadで休館日登録APIへPOSTし、一覧を再取得すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(useBranchClosedDayActions)

    act(() => {
      result.current.onInputChange({
        target: { name: 'branch', value: '1' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'date', value: '2026-01-15' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'reason', value: ' 蔵書点検 ' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onCreate()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/branch-closed-days', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        branch: 1,
        date: '2026-01-15',
        reason: '蔵書点検',
      }),
    })
    expect(result.current.message).toBe('休館日を登録しました。')
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  test('onCreateが入力不足の時にAPIを呼ばずエラーを保持するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 支店または休館日が未入力のフォーム。
     * - 処理: onCreate を呼び出す。
     * - 期待値: APIを呼ばず、入力不足メッセージを保持すること。
     */
    const { result } = renderHook(useBranchClosedDayActions)

    await act(async () => {
      await result.current.onCreate()
    })

    expect(global.fetch).not.toHaveBeenCalled()
    expect(result.current.message).toBe('支店と休館日を選択してください。')
    expect(result.current.messageSeverity).toBe('error')
  })

  test('onDeleteが成功した時に休館日削除APIへDELETEして一覧を再取得するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 削除対象の休館日ID。
     * - 処理: onDelete を呼び出す。
     * - 期待値: 休館日削除APIへDELETEし、一覧を再取得すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(useBranchClosedDayActions)

    await act(async () => {
      await result.current.onDelete(3, '渋谷中央図書館 2026-01-15')
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/branch-closed-days/3', {
      method: 'DELETE',
    })
    expect(result.current.message).toBe('休館日を削除しました。')
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  test('onDeleteが確認キャンセル時に休館日削除APIを呼ばないべき', async () => {
    /**
     * シナリオ:
     * - 入力: 削除確認ダイアログでキャンセルする状態。
     * - 処理: onDelete を呼び出す。
     * - 期待値: 休館日削除APIを呼ばず、一覧も再取得しないこと。
     */
    jest.mocked(window.confirm).mockReturnValueOnce(false)
    const { result } = renderHook(useBranchClosedDayActions)

    await act(async () => {
      await result.current.onDelete(3, '渋谷中央図書館 2026-01-15')
    })

    expect(global.fetch).not.toHaveBeenCalled()
    expect(mockRefresh).not.toHaveBeenCalled()
  })
})
