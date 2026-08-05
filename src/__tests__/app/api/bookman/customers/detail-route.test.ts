import { DELETE, PATCH } from '@/app/api/bookman/customers/[customerId]/route'

jest.mock('@/helpers/apiClient', () => ({
  getBookmanApiUrl: jest.fn(() => 'http://127.0.0.1:8000/bookman/api/customers/'),
}))

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

  async text() {
    if (this.body === null) {
      return ''
    }
    return typeof this.body === 'string' ? this.body : JSON.stringify(this.body)
  }

  static json(body: unknown, init?: ResponseInit) {
    return new JsonResponse(body, init)
  }
}

describe('bookman customers detail API route', () => {
  const originalResponse = global.Response

  beforeEach(() => {
    jest.clearAllMocks()
    global.Response = JsonResponse as unknown as typeof Response
    global.fetch = jest.fn()
  })

  afterAll(() => {
    global.Response = originalResponse
  })

  test('PATCHが利用者更新リクエストをbackend APIへ転送するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 利用者ID、更新後の氏名、電話番号、貸出上限数を含む更新リクエスト。
     * - 処理: Next API route の PATCH を呼び出す。
     * - 期待値: backend の customer detail API へ同じ内容をPATCHすること。
     */
    jest.mocked(global.fetch).mockResolvedValue({
      status: 200,
      text: async () => JSON.stringify({ id: 20, name: '新利用者' }),
    } as Response)

    const requestBody = {
      name: '新利用者',
      phone: '090-1111-2222',
      max_lending_count: 7,
    }
    const response = await PATCH(
      {
        json: async () => requestBody,
      } as Request,
      { params: Promise.resolve({ customerId: '20' }) },
    )

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/bookman/api/customers/20/', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ id: 20, name: '新利用者' })
  })

  test('DELETEが利用者削除リクエストをbackend APIへ転送するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 利用者IDとbackendの204空レスポンス。
     * - 処理: Next API route の DELETE を呼び出す。
     * - 期待値: backend の customer detail API へDELETEし、204をそのまま返すこと。
     */
    jest.mocked(global.fetch).mockResolvedValue({
      status: 204,
      text: async () => '',
    } as Response)

    const response = await DELETE({} as Request, { params: Promise.resolve({ customerId: '20' }) })

    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/bookman/api/customers/20/', {
      method: 'DELETE',
      cache: 'no-store',
    })
    expect(response.status).toBe(204)
  })
})
