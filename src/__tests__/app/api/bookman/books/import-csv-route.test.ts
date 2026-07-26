import { POST } from '@/app/api/bookman/books/import-csv/route'

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

describe('book csv import route', () => {
  const originalResponse = global.Response

  beforeEach(() => {
    jest.clearAllMocks()
    global.Response = JsonResponse as unknown as typeof Response
    global.fetch = jest.fn()
  })

  afterAll(() => {
    global.Response = originalResponse
  })

  test('POSTがCSV登録フォームデータをbackend APIへ転送するべき', async () => {
    /**
     * シナリオ:
     * - 入力: CSVファイルと自治体IDを含む FormData。
     * - 処理: Next API route の POST を呼び出す。
     * - 期待値: backend の CSV一括登録APIへ multipart body をそのまま転送すること。
     */
    const formData = new FormData()
    formData.append('municipality', '1')
    formData.append(
      'file',
      new Blob(['カテゴリ,名前\n小説,坊っちゃん'], { type: 'text/csv' }),
      'books.csv',
    )
    jest.mocked(global.fetch).mockResolvedValueOnce({
      status: 200,
      text: async () => JSON.stringify({ created_count: 1, failed_count: 0, errors: [] }),
    } as Response)

    const response = await POST({
      formData: async () => formData,
    } as Request)

    expect(response.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledWith(
      'http://127.0.0.1:8000/bookman/api/books/import-csv/',
      {
        method: 'POST',
        body: formData,
        cache: 'no-store',
      },
    )
  })
})
