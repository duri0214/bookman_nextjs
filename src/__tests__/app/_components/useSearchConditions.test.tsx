import { renderHook, waitFor } from '@testing-library/react'
import { useSearchConditions } from '@/app/(bookman)/_components/useSearchConditions'

describe('useSearchConditions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  test('mock modeでは書籍一覧の保存条件ダミーを表示するべき', async () => {
    /**
     * シナリオ:
     * - 入力: mock mode の書籍一覧保存条件 hook。
     * - 処理: useSearchConditions を表示する。
     * - 期待値: backend API を呼ばず、点検用の保存条件ダミーと権限情報が返ること。
     */
    const { result } = renderHook(() =>
      useSearchConditions({ targetScreen: 'books', staffId: 1, isMockData: true }),
    )

    await waitFor(() => {
      expect(result.current.conditions.length).toBeGreaterThan(0)
    })

    expect(global.fetch).not.toHaveBeenCalled()
    expect(result.current.permission?.canCreateBranch).toBe(true)
    expect(result.current.conditions[0]).toEqual(
      expect.objectContaining({
        name: 'モック: 中央図書館の所蔵本',
        conditions: { keyword: '吾輩', branchId: '1', stockedOnly: true },
        canDelete: true,
      }),
    )
  })

  test('mock modeでは貸出と予約の保存条件ダミーを画面別に表示するべき', async () => {
    /**
     * シナリオ:
     * - 入力: mock mode の貸出一覧と予約一覧保存条件 hook。
     * - 処理: それぞれの targetScreen で useSearchConditions を表示する。
     * - 期待値: 各画面のフィルター項目に合う保存条件ダミーが返ること。
     */
    const lendingHook = renderHook(() =>
      useSearchConditions({ targetScreen: 'lendings', staffId: 1, isMockData: true }),
    )
    const reservationHook = renderHook(() =>
      useSearchConditions({ targetScreen: 'reservations', staffId: 1, isMockData: true }),
    )

    await waitFor(() => {
      expect(lendingHook.result.current.conditions.length).toBeGreaterThan(0)
      expect(reservationHook.result.current.conditions.length).toBeGreaterThan(0)
    })

    expect(lendingHook.result.current.conditions[0].conditions).toEqual({
      municipalityId: '1',
      branchId: '1',
      dueWithinDays: '7',
    })
    expect(reservationHook.result.current.conditions[0].conditions).toEqual({
      reservationFilter: 'all',
      branchId: '1',
    })
  })
})
