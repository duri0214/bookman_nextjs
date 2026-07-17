import { Book, IBookRaw } from '@/resource/book'
import { getBookmanApiUrl } from '@/helpers/apiClient'

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true'

const MOCK_BOOKS: IBookRaw[] = [
  {
    id: 1,
    name: 'Bookman 入門',
    thumbnail: null,
    category: { name: '技術書', color: '#1976d2' },
    authors: [{ name: 'Bookman Team' }],
    lead_text: '開発用モックデータです。',
    publication_date: '2026-01-01',
  },
  {
    id: 2,
    name: '店舗運営ハンドブック',
    thumbnail: null,
    category: { name: 'ビジネス', color: '#2e7d32' },
    authors: [{ name: 'YOSHITAKA OKADA' }],
    lead_text: 'バックエンド未起動時の表示確認に使うデータです。',
    publication_date: '2026-01-02',
  },
]

interface BookListData {
  books: Book[]
  errorMessage: string | null
  isMockData: boolean
}

const convertBookData = (data: IBookRaw[]): Book[] =>
  data.map((result: IBookRaw) => ({
    id: result.id,
    category: result.category,
    name: result.name,
    authors: result.authors.map((author) => author.name).join(', '),
    leadText: result.lead_text,
  }))

const loadBookList = async (apiUrl: string): Promise<IBookRaw[]> => {
  const response = await fetch(apiUrl, { method: 'GET', cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`)
  }
  return response.json()
}

export const getBookListData = async (): Promise<BookListData> => {
  try {
    const responseData = await loadBookList(getBookmanApiUrl('books'))
    return {
      books: convertBookData(responseData),
      errorMessage: null,
      isMockData: false,
    }
  } catch (e) {
    console.error('データの取得に失敗しました: ', e)

    if (USE_MOCK_DATA) {
      return {
        books: convertBookData(MOCK_BOOKS),
        errorMessage: null,
        isMockData: true,
      }
    }

    return {
      books: [],
      errorMessage:
        '書籍データの取得に失敗しました。バックエンドを起動してから再読み込みしてください。',
      isMockData: false,
    }
  }
}
