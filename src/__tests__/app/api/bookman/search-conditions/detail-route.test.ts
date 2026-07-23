import { DELETE, PATCH } from '@/app/api/bookman/search-conditions/[conditionId]/route'

const params = { params: Promise.resolve({ conditionId: '7' }) }

const createRequest = (url: string, body?: unknown): Request =>
  ({
    url,
    json: async () => body,
  }) as Request

class JsonResponse {
  status: number
  private body: unknown

  constructor(body: unknown, init?: ResponseInit) {
    if (init?.status === 204 && body !== null) {
      throw new TypeError('Response with null body status cannot have body')
    }
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

describe('search-conditions detail route', () => {
  const originalResponse = global.Response

  beforeEach(() => {
    jest.clearAllMocks()
    global.Response = JsonResponse as unknown as typeof Response
    global.fetch = jest.fn()
  })

  afterAll(() => {
    global.Response = originalResponse
  })

  test('PATCHが名称変更と共有範囲変更をbackend APIへ転送するべき', async () => {
    /**
     * シナリオ:
     * - 入力: conditionId、staff、変更後の名前と共有範囲。
     * - 処理: Next API route の PATCH を呼び出す。
     * - 期待値: 対象IDの backend detail API へPATCHすること。
     */
    const body = { name: '中央図書館の貸出中', share_scope: 'branch' }
    jest.mocked(global.fetch).mockResolvedValueOnce({
      status: 200,
      text: async () => JSON.stringify({ id: 7, ...body }),
    } as Response)

    const response = await PATCH(
      createRequest('http://localhost/api/bookman/search-conditions/7?staff=10', body),
      params,
    )

    expect(response.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/bookman/api/search-conditions/7/?staff=10',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    )
  })

  test('DELETEが削除対象IDとstaffをbackend APIへ転送するべき', async () => {
    /**
     * シナリオ:
     * - 入力: conditionId と staff。
     * - 処理: Next API route の DELETE を呼び出す。
     * - 期待値: 対象IDの backend detail API へDELETEすること。
     */
    jest.mocked(global.fetch).mockResolvedValueOnce({
      status: 204,
      text: async () => '',
    } as Response)

    const response = await DELETE(
      {
        url: 'http://localhost/api/bookman/search-conditions/7?staff=10',
      } as Request,
      params,
    )

    expect(response.status).toBe(204)
    expect(await response.text()).toBe('')
    expect(global.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/bookman/api/search-conditions/7/?staff=10',
      { method: 'DELETE', cache: 'no-store' },
    )
  })
})
