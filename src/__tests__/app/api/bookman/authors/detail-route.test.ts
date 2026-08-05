import { DELETE, PATCH } from '@/app/api/bookman/authors/[authorId]/route'

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

describe('author detail route', () => {
  const originalResponse = global.Response

  beforeEach(() => {
    jest.clearAllMocks()
    global.Response = JsonResponse as unknown as typeof Response
    global.fetch = jest.fn()
  })

  afterAll(() => {
    global.Response = originalResponse
  })

  test('PATCHが著者更新リクエストをbackend APIへ転送するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 著者IDと更新後の著者名を含む更新リクエスト。
     * - 処理: Next API route の PATCH を呼び出す。
     * - 期待値: backend の author detail API へ同じ内容をPATCHすること。
     */
    jest.mocked(global.fetch).mockResolvedValueOnce({
      status: 200,
      text: async () => JSON.stringify({ id: 10 }),
    } as Response)

    const response = await PATCH(
      {
        json: async () => ({ name: '夏目漱石' }),
      } as Request,
      { params: Promise.resolve({ authorId: '10' }) },
    )

    expect(response.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/bookman/api/authors/10/', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: '夏目漱石' }),
      cache: 'no-store',
    })
  })

  test('DELETEが著者削除リクエストをbackend APIへ転送するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 著者IDとbackendの204空レスポンス。
     * - 処理: Next API route の DELETE を呼び出す。
     * - 期待値: backend の author detail API へDELETEし、204をそのまま返すこと。
     */
    jest.mocked(global.fetch).mockResolvedValueOnce({
      status: 204,
      text: async () => '',
    } as Response)

    const response = await DELETE({} as Request, { params: Promise.resolve({ authorId: '10' }) })

    expect(response.status).toBe(204)
    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/bookman/api/authors/10/', {
      method: 'DELETE',
      cache: 'no-store',
    })
  })
})
