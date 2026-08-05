import { DELETE, PATCH } from '@/app/api/bookman/categories/[categoryId]/route'

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

describe('category detail route', () => {
  const originalResponse = global.Response

  beforeEach(() => {
    jest.clearAllMocks()
    global.Response = JsonResponse as unknown as typeof Response
    global.fetch = jest.fn()
  })

  afterAll(() => {
    global.Response = originalResponse
  })

  test('PATCHがカテゴリ更新リクエストをbackend APIへ転送するべき', async () => {
    /**
     * シナリオ:
     * - 入力: カテゴリID、更新後のカテゴリ名、表示色を含む更新リクエスト。
     * - 処理: Next API route の PATCH を呼び出す。
     * - 期待値: backend の category detail API へ同じ内容をPATCHすること。
     */
    jest.mocked(global.fetch).mockResolvedValueOnce({
      status: 200,
      text: async () => JSON.stringify({ id: 10 }),
    } as Response)

    const response = await PATCH(
      {
        json: async () => ({ name: '児童書', color: '#ffcc00' }),
      } as Request,
      { params: Promise.resolve({ categoryId: '10' }) },
    )

    expect(response.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/bookman/api/categories/10/', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: '児童書', color: '#ffcc00' }),
      cache: 'no-store',
    })
  })

  test('DELETEがカテゴリ削除リクエストをbackend APIへ転送するべき', async () => {
    /**
     * シナリオ:
     * - 入力: カテゴリIDとbackendの204空レスポンス。
     * - 処理: Next API route の DELETE を呼び出す。
     * - 期待値: backend の category detail API へDELETEし、204をそのまま返すこと。
     */
    jest.mocked(global.fetch).mockResolvedValueOnce({
      status: 204,
      text: async () => '',
    } as Response)

    const response = await DELETE({} as Request, { params: Promise.resolve({ categoryId: '10' }) })

    expect(response.status).toBe(204)
    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/bookman/api/categories/10/', {
      method: 'DELETE',
      cache: 'no-store',
    })
  })
})
