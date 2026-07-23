import { GET } from '@/app/api/bookman/search-conditions/permissions/route'

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

describe('search-conditions permissions route', () => {
  const originalResponse = global.Response

  beforeEach(() => {
    jest.clearAllMocks()
    global.Response = JsonResponse as unknown as typeof Response
    global.fetch = jest.fn()
  })

  afterAll(() => {
    global.Response = originalResponse
  })

  test('GETが職員IDを権限コンテキストAPIへ渡すべき', async () => {
    /**
     * シナリオ:
     * - 入力: staff を含む保存条件権限リクエスト。
     * - 処理: Next API route の GET を呼び出す。
     * - 期待値: backend の permissions API へ staff を付けて転送すること。
     */
    jest.mocked(global.fetch).mockResolvedValueOnce({
      status: 200,
      text: async () => JSON.stringify({ can_create_personal: true }),
    } as Response)

    const response = await GET({
      url: 'http://localhost/api/bookman/search-conditions/permissions?staff=10',
    } as Request)

    expect(response.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/bookman/api/search-conditions/permissions/?staff=10',
      { method: 'GET', cache: 'no-store' },
    )
  })
})
