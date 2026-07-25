import { PATCH } from '@/app/api/bookman/branches/[branchId]/route'

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

describe('branch detail route', () => {
  const originalResponse = global.Response

  beforeEach(() => {
    jest.clearAllMocks()
    global.Response = JsonResponse as unknown as typeof Response
    global.fetch = jest.fn()
  })

  afterAll(() => {
    global.Response = originalResponse
  })

  test('PATCHが支店更新リクエストをbackend APIへ転送するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 支店IDと更新後の支店情報を含む更新リクエスト。
     * - 処理: Next API route の PATCH を呼び出す。
     * - 期待値: backend の branch detail API へ同じ内容をPATCHすること。
     */
    const requestBody = {
      municipality: 2,
      name: '六戸町図書館',
      address: '青森県上北郡六戸町',
      phone: '0176-00-0000',
      remark: '本館',
    }

    jest.mocked(global.fetch).mockResolvedValueOnce({
      status: 200,
      text: async () => JSON.stringify({ id: 10 }),
    } as Response)

    const response = await PATCH(
      {
        json: async () => requestBody,
      } as Request,
      { params: Promise.resolve({ branchId: '10' }) },
    )

    expect(response.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/bookman/api/branches/10/', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    })
  })
})
