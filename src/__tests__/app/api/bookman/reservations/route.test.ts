import { POST } from '@/app/api/bookman/reservations/route'

describe('reservations route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    global.Response = {
      json: (body: unknown, init?: ResponseInit) => ({
        status: init?.status ?? 200,
        json: async () => body,
      }),
    } as typeof Response
  })

  test('同じ本を貸出中の利用者の予約登録をbackendへ転送しないべき', async () => {
    /**
     * シナリオ:
     * - 入力: 予約対象と同じ本を同じ利用者が貸出中の状態。
     * - 処理: 予約登録 proxy へ POST する。
     * - 期待値: backend の予約登録APIへ転送せず、400で拒否すること。
     */
    jest
      .mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 10, book: 2 },
          { id: 11, book: 2 },
        ],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ branch_book_stock: 11, customer: 20, active: true }],
      } as Response)

    const response = await POST({
      json: async () => ({ municipality: 1, branch_book_stock: 10, customer: 20 }),
    } as Request)
    const responseBody = await response.json()

    expect(response.status).toBe(400)
    expect(responseBody).toEqual({
      code: 'duplicate_book_reservation',
      message: '同じ本を貸出中の利用者は予約できません。',
    })
    expect(global.fetch).toHaveBeenCalledTimes(2)
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      'http://127.0.0.1:8000/bookman/api/branch-book-stocks/?municipality=1',
      { method: 'GET', cache: 'no-store' },
    )
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'http://127.0.0.1:8000/bookman/api/lendings/?municipality=1',
      { method: 'GET', cache: 'no-store' },
    )
  })
})
