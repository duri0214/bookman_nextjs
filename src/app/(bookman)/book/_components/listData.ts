import { Book, IAuthor, IBookRaw, ICategory } from '@/resource/book'
import { getBookmanApiUrl } from '@/helpers/apiClient'

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true'

const MOCK_BOOKS: IBookRaw[] = [
  {
    id: 1,
    name: 'Bookman 入門',
    thumbnail: null,
    category: 1,
    authors: [1],
    lead_text: '開発用モックデータです。',
    amount: 1,
    isbn: '9780000000001',
    publication_date: '2026-01-01',
  },
  {
    id: 2,
    name: '店舗運営ハンドブック',
    thumbnail: null,
    category: 2,
    authors: [2],
    lead_text: 'バックエンド未起動時の表示確認に使うデータです。',
    amount: 1,
    isbn: '9780000000002',
    publication_date: '2026-01-02',
  },
]

const MOCK_CATEGORIES: ICategory[] = [
  { id: 1, name: '技術書', color: '#1976d2' },
  { id: 2, name: 'ビジネス', color: '#2e7d32' },
]

const MOCK_AUTHORS: IAuthor[] = [
  { id: 1, name: 'Bookman Team' },
  { id: 2, name: 'YOSHITAKA OKADA' },
]

interface BookListData {
  books: Book[]
  errorMessage: string | null
  isMockData: boolean
}

const convertBookData = (
  books: IBookRaw[],
  categories: ICategory[],
  authors: IAuthor[],
): Book[] => {
  const categoriesById = new Map(categories.map((category) => [category.id, category]))
  const authorsById = new Map(authors.map((author) => [author.id, author]))

  return books.map((result: IBookRaw) => ({
    id: result.id,
    category: categoriesById.get(result.category) ?? null,
    name: result.name,
    authors: result.authors
      .map((authorId) => authorsById.get(authorId)?.name ?? `#${authorId}`)
      .join(', '),
    leadText: result.lead_text,
    publicationDate: result.publication_date,
  }))
}

const loadBookmanData = async <T>(apiUrl: string): Promise<T> => {
  const response = await fetch(apiUrl, { method: 'GET', cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`)
  }
  return response.json()
}

export const getBookListData = async (): Promise<BookListData> => {
  try {
    const [books, categories, authors] = await Promise.all([
      loadBookmanData<IBookRaw[]>(getBookmanApiUrl('books')),
      loadBookmanData<ICategory[]>(getBookmanApiUrl('categories')),
      loadBookmanData<IAuthor[]>(getBookmanApiUrl('authors')),
    ])

    return {
      books: convertBookData(books, categories, authors),
      errorMessage: null,
      isMockData: false,
    }
  } catch (e) {
    console.error('データの取得に失敗しました: ', e)

    if (USE_MOCK_DATA) {
      return {
        books: convertBookData(MOCK_BOOKS, MOCK_CATEGORIES, MOCK_AUTHORS),
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
