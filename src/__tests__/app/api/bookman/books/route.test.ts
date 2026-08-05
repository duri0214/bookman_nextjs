import { POST } from '@/app/api/bookman/books/route'

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

describe('book route', () => {
  const originalResponse = global.Response

  beforeEach(() => {
    jest.clearAllMocks()
    global.Response = JsonResponse as unknown as typeof Response
    global.fetch = jest.fn()
  })

  afterAll(() => {
    global.Response = originalResponse
  })

  test('POSTが書籍登録リクエストをbackend APIへ転送するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 半角数字のみのISBNを含む書籍登録リクエスト。
     * - 処理: Next API route の POST を呼び出す。
     * - 期待値: backend の book create API へ同じ内容をPOSTすること。
     */
    const requestBody = {
      category: 2,
      name: 'Bookman 入門',
      authors: [1, 2],
      lead_text: '紹介文',
      municipality: 1,
      branch: 1,
      amount: 3,
      isbn: '9784062938426',
      publication_date: '2026-01-01',
    }

    jest.mocked(global.fetch).mockResolvedValueOnce({
      status: 201,
      text: async () => JSON.stringify({ id: 10 }),
    } as Response)

    const response = await POST({
      json: async () => requestBody,
    } as Request)

    expect(response.status).toBe(201)
    expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/bookman/api/books/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    })
  })

  test('POSTが半角数字以外を含むISBNをbackend APIへ転送しないべき', async () => {
    /**
     * シナリオ:
     * - 入力: ハイフンを含むISBNの書籍登録リクエスト。
     * - 処理: Next API route の POST を呼び出す。
     * - 期待値: backend APIへ転送せず、400とISBNエラーを返すこと。
     */
    const response = await POST({
      json: async () => ({
        category: 2,
        name: 'Bookman 入門',
        authors: [1, 2],
        lead_text: '紹介文',
        municipality: 1,
        branch: 1,
        amount: 3,
        isbn: '978-4-06-293842-6',
        publication_date: '2026-01-01',
      }),
    } as Request)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      isbn: ['半角数字のみで入力してください。'],
    })
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
