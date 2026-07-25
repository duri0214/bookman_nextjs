import { ChangeEvent } from 'react'
import { act, renderHook } from '@testing-library/react'
import { useAuthorActions } from '@/app/author/_components/useAuthorActions'

const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

describe('useAuthorActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  test('onCreateが成功した時に著者登録APIへPOSTして一覧を再取得するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 著者登録 API が成功し、著者名が入力済みの状態。
     * - 処理: onCreate を呼び出す。
     * - 期待値: 登録 API に POST し、ダイアログを閉じて一覧を再取得すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(useAuthorActions)

    act(() => {
      result.current.openDialog()
      result.current.onInputChange({
        target: { name: 'name', value: ' 夏目漱石 ' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onCreate()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/authors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: '夏目漱石' }),
    })
    expect(result.current.isDialogOpen).toBe(false)
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  test('onCreateが著者名未入力時に著者登録APIへPOSTしないべき', async () => {
    /**
     * シナリオ:
     * - 入力: 著者名が空の著者登録フォーム。
     * - 処理: onCreate を呼び出す。
     * - 期待値: APIへPOSTせず、著者名入力を促すエラーメッセージを保持すること。
     */
    const { result } = renderHook(useAuthorActions)

    act(() => {
      result.current.openDialog()
    })

    await act(async () => {
      await result.current.onCreate()
    })

    expect(global.fetch).not.toHaveBeenCalled()
    expect(result.current.createErrorMessage).toBe('著者名を入力してください。')
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  test('onUpdateが成功した時に著者更新APIへPATCHして一覧を再取得するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 編集中の著者名と著者ID。
     * - 処理: onUpdate を呼び出す。
     * - 期待値: 更新 API に PATCH し、一覧を再取得すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(useAuthorActions)
    const author = { id: 10, name: '旧著者名' }

    act(() => {
      result.current.onEditChange(
        author,
        'name',
      )({
        target: { name: 'name', value: '新著者名' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onUpdate(author)
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/authors/10', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: '新著者名' }),
    })
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })
})
