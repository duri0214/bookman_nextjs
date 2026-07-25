import { POST } from '@/app/api/bookman/branch-book-stocks/route'

const createTransferRequest = (body: unknown): Request =>
  ({
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

describe('branch-book-stocks transfer route', () => {
  const originalResponse = global.Response

  beforeEach(() => {
    jest.clearAllMocks()
    global.Response = JsonResponse as unknown as typeof Response
    global.fetch = jest.fn()
  })

  afterAll(() => {
    global.Response = originalResponse
  })

  test('初期所蔵作成リクエストをbackend APIへ転送するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 書籍ID、自治体ID、所蔵支店ID、冊数を含む初期所蔵作成リクエスト。
     * - 処理: 支店別所蔵API routeへPOSTする。
     * - 期待値: backend の branch-book-stocks API へ同じ内容をPOSTすること。
     */
    jest.mocked(global.fetch).mockResolvedValueOnce({
      status: 201,
      text: async () => JSON.stringify({ id: 100, book: 10, branch: 1, amount: 3 }),
    } as Response)

    const response = await POST(
      createTransferRequest({ book: 10, municipality: 1, branch: 1, amount: 3 }),
    )

    expect(response.status).toBe(201)
    expect(global.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/bookman/api/branch-book-stocks/?municipality=1',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ book: 10, branch: 1, amount: 3 }),
        cache: 'no-store',
      },
    )
  })

  test('移動元所蔵数が不足する時に400を返すべき', async () => {
    /**
     * シナリオ:
     * - 入力: 移動元支店の所蔵数1に対して冊数2の移動リクエスト。
     * - 処理: 支店間移動API routeへPOSTする。
     * - 期待値: PATCH/POSTを実行せず、400と所蔵数不足メッセージを返すこと。
     */
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [{ id: 1, book: 10, branch: 1, amount: 1 }],
    } as Response)

    const response = await POST(
      createTransferRequest({ book: 10, municipality: 1, fromBranch: 1, toBranch: 2, amount: 2 }),
    )

    expect(response.status).toBe(400)
    expect(await response.json()).toEqual({ message: '移動元支店の所蔵数が不足しています。' })
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  test('移動先所蔵行がある時に移動元と移動先の数量をPATCHするべき', async () => {
    /**
     * シナリオ:
     * - 入力: 移動元3冊、移動先1冊の書籍を2冊移動するリクエスト。
     * - 処理: 支店間移動API routeへPOSTする。
     * - 期待値: 移動元は1冊、移動先は3冊へPATCHされること。
     */
    jest
      .mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { id: 1, book: 10, branch: 1, amount: 3 },
          { id: 2, book: 10, branch: 2, amount: 1 },
        ],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ id: 1, amount: 1 }),
        status: 200,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        text: async () => JSON.stringify({ id: 2, amount: 3 }),
        status: 200,
      } as Response)

    const response = await POST(
      createTransferRequest({ book: 10, municipality: 1, fromBranch: 1, toBranch: 2, amount: 2 }),
    )

    expect(response.status).toBe(200)
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'http://127.0.0.1:8000/bookman/api/branch-book-stocks/1/?municipality=1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ amount: 1 }),
      }),
    )
    expect(global.fetch).toHaveBeenNthCalledWith(
      3,
      'http://127.0.0.1:8000/bookman/api/branch-book-stocks/2/?municipality=1',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ amount: 3 }),
      }),
    )
  })
})
