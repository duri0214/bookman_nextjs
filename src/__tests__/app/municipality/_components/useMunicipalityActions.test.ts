import { act, renderHook } from '@testing-library/react'
import { useMunicipalityActions } from '@/app/municipality/_components/useMunicipalityActions'

const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

describe('useMunicipalityActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    window.confirm = jest.fn(() => true)
  })

  test('onDeleteが成功した時に自治体削除APIへDELETEして一覧を再取得するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 削除確認済みの自治体。
     * - 処理: onDelete を呼び出す。
     * - 期待値: 自治体削除APIへDELETEし、成功メッセージを保持して一覧を再取得すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(useMunicipalityActions)
    const municipality = { id: 10, name: '六戸町' }

    await act(async () => {
      await result.current.onDelete(municipality)
    })

    expect(window.confirm).toHaveBeenCalledWith('自治体「六戸町」を削除します。よろしいですか？')
    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/municipalities/10', {
      method: 'DELETE',
    })
    expect(result.current.actionMessage).toBe('自治体データを削除しました。')
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  test('onDeleteが確認キャンセル時に自治体削除APIを呼ばないべき', async () => {
    /**
     * シナリオ:
     * - 入力: 削除確認ダイアログでキャンセルする状態。
     * - 処理: onDelete を呼び出す。
     * - 期待値: 自治体削除APIを呼ばず、一覧も再取得しないこと。
     */
    jest.mocked(window.confirm).mockReturnValueOnce(false)
    const { result } = renderHook(useMunicipalityActions)

    await act(async () => {
      await result.current.onDelete({ id: 10, name: '六戸町' })
    })

    expect(global.fetch).not.toHaveBeenCalled()
    expect(mockRefresh).not.toHaveBeenCalled()
  })
})
