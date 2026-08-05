import { ChangeEvent } from 'react'
import { act, renderHook } from '@testing-library/react'
import { useCategoryActions } from '@/app/category/_components/useCategoryActions'

const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

describe('useCategoryActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    window.confirm = jest.fn(() => true)
  })

  test('onCreateが成功した時にカテゴリ登録APIへPOSTして一覧を再取得するべき', async () => {
    /**
     * シナリオ:
     * - 入力: カテゴリ登録 API が成功し、カテゴリ名と表示色が入力済みの状態。
     * - 処理: onCreate を呼び出す。
     * - 期待値: 登録 API に POST し、ダイアログを閉じて一覧を再取得すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(useCategoryActions)

    act(() => {
      result.current.openDialog()
      result.current.onInputChange({
        target: { name: 'name', value: ' 児童書 ' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'color', value: '#ffcc00' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onCreate()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: '児童書', color: '#ffcc00' }),
    })
    expect(result.current.isDialogOpen).toBe(false)
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  test('onUpdateが成功した時にカテゴリ更新APIへPATCHして一覧を再取得するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 編集中のカテゴリ名、表示色、カテゴリID。
     * - 処理: onUpdate を呼び出す。
     * - 期待値: 更新 API に PATCH し、一覧を再取得すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(useCategoryActions)
    const category = { id: 10, name: '旧カテゴリ', color: '#1976d2' }

    act(() => {
      result.current.onEditChange(
        category,
        'name',
      )({
        target: { name: 'name', value: '新カテゴリ' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onEditChange(
        category,
        'color',
      )({
        target: { name: 'color', value: '#00aa88' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onUpdate(category)
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/categories/10', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: '新カテゴリ', color: '#00aa88' }),
    })
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  test('onDeleteが成功した時にカテゴリ削除APIへDELETEして一覧を再取得するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 削除確認済みのカテゴリ。
     * - 処理: onDelete を呼び出す。
     * - 期待値: カテゴリ削除APIへDELETEし、成功メッセージを保持して一覧を再取得すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(useCategoryActions)
    const category = { id: 10, name: '児童書', color: '#ffcc00' }

    await act(async () => {
      await result.current.onDelete(category)
    })

    expect(window.confirm).toHaveBeenCalledWith('カテゴリ「児童書」を削除します。よろしいですか？')
    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/categories/10', {
      method: 'DELETE',
    })
    expect(result.current.actionMessage).toBe('カテゴリデータを削除しました。')
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  test('onDeleteが確認キャンセル時にカテゴリ削除APIを呼ばないべき', async () => {
    /**
     * シナリオ:
     * - 入力: 削除確認ダイアログでキャンセルする状態。
     * - 処理: onDelete を呼び出す。
     * - 期待値: カテゴリ削除APIを呼ばず、一覧も再取得しないこと。
     */
    jest.mocked(window.confirm).mockReturnValueOnce(false)
    const { result } = renderHook(useCategoryActions)

    await act(async () => {
      await result.current.onDelete({ id: 10, name: '児童書', color: '#ffcc00' })
    })

    expect(global.fetch).not.toHaveBeenCalled()
    expect(mockRefresh).not.toHaveBeenCalled()
  })
})
