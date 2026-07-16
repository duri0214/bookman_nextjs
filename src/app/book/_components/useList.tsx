import { useCallback, useState } from 'react'
import { Book, IBookRaw } from '@/resource/book'

const API_BOOK_URL = 'http://127.0.0.1:8000/bookman/api/books/'

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

  const loading = useCallback(async (): Promise<Book[]> => {
    const responseData = await loadBookList(API_BOOK_URL)
    const formattedData: Book[] = convertBookData(responseData)
    setBooks(formattedData)
    return formattedData
  }, [])

  return { loading, books }
}
