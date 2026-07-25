import { POST } from '@/app/api/bookman/municipalities/route'

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

describe('municipalities route', () => {
  const originalResponse = global.Response

  beforeEach(() => {
    jest.clearAllMocks()
    global.Response = JsonResponse as unknown as typeof Response
    global.fetch = jest.fn()
  })

  afterAll(() => {
    global.Response = originalResponse
  })

  test('POSTが自治体登録リクエストをbackend APIへ転送するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 自治体名を含む登録リクエスト。
     * - 処理: Next API route の POST を呼び出す。
     * - 期待値: backend の municipalities API へ同じ内容をPOSTすること。
     */
    jest.mocked(global.fetch).mockResolvedValueOnce({
      status: 201,
      text: async () => JSON.stringify({ id: 10 }),
    } as Response)

    const response = await POST({
      json: async () => ({ name: '六戸町' }),
    } as Request)

    expect(response.status).toBe(201)
    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/bookman/api/municipalities/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: '六戸町' }),
      cache: 'no-store',
    })
  })
})
