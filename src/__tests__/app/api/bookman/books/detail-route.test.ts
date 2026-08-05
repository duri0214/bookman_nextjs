import { DELETE, PATCH } from '@/app/api/bookman/books/[bookId]/route'

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

describe('book detail route', () => {
  const originalResponse = global.Response

  beforeEach(() => {
    jest.clearAllMocks()
    global.Response = JsonResponse as unknown as typeof Response
    global.fetch = jest.fn()
  })

  afterAll(() => {
    global.Response = originalResponse
  })

  test('PATCHが書籍更新リクエストをbackend APIへ転送するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 書籍ID、更新後のカテゴリ、著者、ISBN、出版日を含む更新リクエスト。
     * - 処理: Next API route の PATCH を呼び出す。
     * - 期待値: backend の book detail API へ同じ内容をPATCHすること。
     */
    jest.mocked(global.fetch).mockResolvedValueOnce({
      status: 200,
      text: async () => JSON.stringify({ id: 10 }),
    } as Response)

    const requestBody = {
      category: 2,
      name: 'Bookman 改訂版',
      authors: [1, 2],
      lead_text: '紹介文を更新',
      isbn: '9784062938426',
      publication_date: '2026-02-01',
    }
    const response = await PATCH(
      {
        json: async () => requestBody,
      } as Request,
      { params: Promise.resolve({ bookId: '10' }) },
    )

    expect(response.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/bookman/api/books/10/', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    })
  })

  test('PATCHが半角数字以外を含むISBNをbackend APIへ転送しないべき', async () => {
    /**
     * シナリオ:
     * - 入力: ハイフンを含むISBNの書籍更新リクエスト。
     * - 処理: Next API route の PATCH を呼び出す。
     * - 期待値: backend APIへ転送せず、400とISBNエラーを返すこと。
     */
    const response = await PATCH(
      {
        json: async () => ({
          category: 2,
          name: 'Bookman 改訂版',
          authors: [1, 2],
          lead_text: '紹介文を更新',
          isbn: '978-4-06-293842-6',
          publication_date: '2026-02-01',
        }),
      } as Request,
      { params: Promise.resolve({ bookId: '10' }) },
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      isbn: ['半角数字のみで入力してください。'],
    })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  test('DELETEが書籍削除リクエストをbackend APIへ転送するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 書籍IDとbackendの204空レスポンス。
     * - 処理: Next API route の DELETE を呼び出す。
     * - 期待値: backend の book detail API へDELETEし、204をそのまま返すこと。
     */
    jest.mocked(global.fetch).mockResolvedValueOnce({
      status: 204,
      text: async () => '',
    } as Response)

    const response = await DELETE({} as Request, { params: Promise.resolve({ bookId: '10' }) })

    expect(response.status).toBe(204)
    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/bookman/api/books/10/', {
      method: 'DELETE',
      cache: 'no-store',
    })
  })
})
