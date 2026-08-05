import { POST } from '@/app/api/bookman/branches/route'

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

describe('branch route', () => {
  const originalResponse = global.Response

  beforeEach(() => {
    jest.clearAllMocks()
    global.Response = JsonResponse as unknown as typeof Response
    global.fetch = jest.fn()
  })

  afterAll(() => {
    global.Response = originalResponse
  })

  test('POSTが支店登録リクエストをbackend APIへ転送するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 半角数字のみの電話番号を含む支店登録リクエスト。
     * - 処理: Next API route の POST を呼び出す。
     * - 期待値: backend の branch API へ同じ内容をPOSTすること。
     */
    const requestBody = {
      municipality: 2,
      name: '六戸町図書館',
      address: '青森県上北郡六戸町',
      phone: '0176000000',
      remark: '本館',
    }

    jest.mocked(global.fetch).mockResolvedValueOnce({
      status: 201,
      text: async () => JSON.stringify({ id: 10 }),
    } as Response)

    const response = await POST({
      json: async () => requestBody,
    } as Request)

    expect(response.status).toBe(201)
    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/bookman/api/branches/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    })
  })

  test('POSTが半角数字以外を含む電話番号をbackend APIへ転送しないべき', async () => {
    /**
     * シナリオ:
     * - 入力: ハイフンを含む電話番号の支店登録リクエスト。
     * - 処理: Next API route の POST を呼び出す。
     * - 期待値: backend APIへ転送せず、400と電話番号エラーを返すこと。
     */
    const response = await POST({
      json: async () => ({
        municipality: 2,
        name: '六戸町図書館',
        address: '青森県上北郡六戸町',
        phone: '0176-00-0000',
        remark: '本館',
      }),
    } as Request)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      phone: ['半角数字のみで入力してください。'],
    })
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
