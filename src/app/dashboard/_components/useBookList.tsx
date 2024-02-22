import { useState } from 'react'
import { Book } from '@/resource/book'

const API_BOOK_URL = 'http://127.0.0.1:8000/bookman/api/books/'

interface IAuthor {
  name: string
}

interface ICategory {
  name: string
  color: string
}

/**
 * Djangoから返却される book data
 *
 * @interface IBookRaw
 */
interface IBookRaw {
  id: number
  name: string
  thumbnail: string | null
  category: ICategory
  authors: IAuthor[]
  lead_text: string
  publication_date: string
}

/**
 * Represents a book.
 * @interface
 */
interface IBook {
  id: number
  name: string
  leadText: string
}

/**
 * IBookRawから、bookリソース に変換したもの
 *
 * @param {Array} data - The raw book data to be formatted.
 * @return {Array} - The formatted book data.
 */
const convertBookData = (data: IBookRaw[]): IBook[] =>
  data.map((result: IBookRaw) => ({
    id: result.id,
    name: result.name,
    leadText: result.lead_text,
  }))
/**
 * API fetch とエラーハンドリング
 *
 * @param {string} apiUrl - The URL of the API to fetch the book list from.
 * @returns {Promise<any[]>} - A promise that resolves to an array of book data.
 * @throws {Error} - If the API request fails or returns an error status.
 */
const loadBookList = async (apiUrl: string): Promise<any[]> => {
  const response = await fetch(apiUrl, { method: 'GET' })
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`)
  }
  return response.json()
}

/**
 * APIにアクセスし、そして book のリストを返します
 *
 * @returns {Object} An object containing the following functions and properties:
 *   - handleLoadingBookList: A function that loads the book list from the API and updates the state with the formatted data.
 *   - books: An array of book objects.
 * @throws {Error} If the API request fails or the data is not in the expected format.
 * @example
 * const { handleLoadingBookList, books } = useBookList();
 * handleLoadingBookList()
 *   .then((formattedData) => {
 *     console.log(formattedData);
 *     console.log(books);
 *   })
 *   .catch((error) => {
 *     console.error(error);
 *   });
 */
export const useBookList = () => {
  const [books, setBooks] = useState<Book[]>([])

  const handleLoadingBookList = async (): Promise<Book[]> => {
    const responseData = await loadBookList(API_BOOK_URL)
    const formattedData: Book[] = convertBookData(responseData)
    setBooks(formattedData)
    return formattedData
  }

  return { handleLoadingBookList, books }
}
