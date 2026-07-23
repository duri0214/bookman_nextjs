import { DELETE } from '@/app/api/bookman/branch-closed-days/[closedDayId]/route'

class TestResponse {
  status: number
  private readonly body: string

  constructor(body: string | null, init?: { status?: number }) {
    this.status = init?.status ?? 200
    this.body = body ?? ''
  }

  static json(body: unknown, init?: { status?: number }) {
    return new TestResponse(JSON.stringify(body), init)
  }

  async text() {
    return this.body
  }
}

describe('branch closed days api route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    global.Response = TestResponse as unknown as typeof Response
  })

  test('DELETEがbackendの204空レスポンスを500にせずそのまま返すべき', async () => {
    /**
     * シナリオ:
     * - 入力: backend の休館日削除APIが 204 No Content を返す状態。
     * - 処理: Next.js の DELETE route handler を呼び出す。
     * - 期待値: JSON body を作らず、204 の Response を返すこと。
     */
    jest.mocked(global.fetch).mockResolvedValue({
      status: 204,
      text: async () => '',
    } as Response)

    const response = await DELETE({} as Request, {
      params: Promise.resolve({ closedDayId: '1' }),
    })

    expect(response.status).toBe(204)
    expect(await response.text()).toBe('')
    expect(global.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/bookman/api/branch-closed-days/1/',
      {
        method: 'DELETE',
        cache: 'no-store',
      },
    )
  })
})
