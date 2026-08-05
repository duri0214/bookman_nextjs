import { act, renderHook } from '@testing-library/react'
import { useStaffActions } from '@/app/staff/_components/useStaffActions'

const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

describe('useStaffActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    window.confirm = jest.fn(() => true)
  })

  test('onDeleteが成功した時に職員削除APIへDELETEして一覧を再取得するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 削除確認済みの職員。
     * - 処理: onDelete を呼び出す。
     * - 期待値: 職員削除APIへDELETEし、成功メッセージを保持して一覧を再取得すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(useStaffActions)
    const staff = {
      id: 10,
      name: '山田 太郎',
      branchId: 1,
      branchName: '中央図書館',
      role: 'counter' as const,
    }

    await act(async () => {
      await result.current.onDelete(staff)
    })

    expect(window.confirm).toHaveBeenCalledWith('職員「山田 太郎」を削除します。よろしいですか？')
    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/staff/10', {
      method: 'DELETE',
    })
    expect(result.current.actionMessage).toBe('職員データを削除しました。')
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })
})
