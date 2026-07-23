import { GET, POST } from '@/app/api/bookman/search-conditions/route'

const createRequest = (url: string, body?: unknown): Request =>
  ({
    url,
    json: async () => body,
  }) as Request

class JsonResponse {
  status: number
  private body: unknown

  constructor(body: unknown, init?: ResponseInit) {
    this.body = body
    this.status = init?.status ?? 200
  }

  async json() {
    return this.body
  }

  static json(body: unknown, init?: ResponseInit) {
    return new JsonResponse(body, init)
  }
}

describe('search-conditions route', () => {
  const originalResponse = global.Response

  beforeEach(() => {
    jest.clearAllMocks()
    global.Response = JsonResponse as unknown as typeof Response
    global.fetch = jest.fn()
  })

  afterAll(() => {
    global.Response = originalResponse
  })

  test('GETが職員と対象画面のクエリをbackend APIへ渡すべき', async () => {
    /**
     * シナリオ:
     * - 入力: staff と target_screen を含む保存条件一覧リクエスト。
     * - 処理: Next API route の GET を呼び出す。
     * - 期待値: backend の search-conditions API へ同じ絞り込みを付けて転送すること。
     */
    jest.mocked(global.fetch).mockResolvedValueOnce({
      status: 200,
      text: async () => JSON.stringify([{ id: 1, name: '返却期限間近' }]),
    } as Response)

    const response = await GET(
      createRequest(
        'http://localhost/api/bookman/search-conditions?staff=10&target_screen=lendings',
      ),
    )

    expect(response.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/bookman/api/search-conditions/?staff=10&target_screen=lendings',
      { method: 'GET', cache: 'no-store' },
    )
  })

  test('POSTが保存条件ペイロードをbackend APIへ転送するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 名前、共有範囲、検索条件JSONを含む保存リクエスト。
     * - 処理: Next API route の POST を呼び出す。
     * - 期待値: backend の search-conditions API へJSONとしてPOSTすること。
     */
    const body = {
      target_screen: 'reservations',
      name: '予約待ち',
      conditions: { reservationFilter: 'open' },
      created_by: 10,
      share_scope: 'personal',
    }
    jest.mocked(global.fetch).mockResolvedValueOnce({
      status: 201,
      text: async () => JSON.stringify({ id: 1, ...body }),
    } as Response)

    const response = await POST(
      createRequest('http://localhost/api/bookman/search-conditions', body),
    )

    expect(response.status).toBe(201)
    expect(global.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/bookman/api/search-conditions/',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(body),
      }),
    )
  })
})
