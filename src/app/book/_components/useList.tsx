import { useCallback, useState } from 'react'
import { Book, IBookRaw } from '@/resource/book'

const API_BOOK_URL = 'http://127.0.0.1:8000/bookman/api/books/'
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

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

const convertBookData = (data: IBookRaw[]): Book[] =>
  data.map((result: IBookRaw) => ({
    id: result.id,
    category: result.category,
    name: result.name,
    authors: result.authors.map((author) => author.name).join(', '),
    leadText: result.lead_text,
  }))

const loadBookList = async (apiUrl: string): Promise<IBookRaw[]> => {
  const response = await fetch(apiUrl, { method: 'GET' })
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`)
  }
  return response.json()
}

export const useList = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isMockData, setIsMockData] = useState(false)

  const loading = useCallback(async (): Promise<Book[]> => {
    setIsLoading(true)
    setErrorMessage(null)
    setIsMockData(false)

    try {
      const responseData = await loadBookList(API_BOOK_URL)
      const formattedData: Book[] = convertBookData(responseData)
      setBooks(formattedData)
      return formattedData
    } catch (e) {
      console.error('データの取得に失敗しました: ', e)

      if (USE_MOCK_DATA) {
        const formattedData: Book[] = convertBookData(MOCK_BOOKS)
        setBooks(formattedData)
        setIsMockData(true)
        return formattedData
      }

      setBooks([])
      setErrorMessage(
        '書籍データの取得に失敗しました。バックエンドを起動してから再読み込みしてください。',
      )
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { loading, books, isLoading, errorMessage, isMockData }
}
