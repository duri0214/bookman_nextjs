import { useState } from 'react'
import { Book } from '@/resource/book'

export const useBookList = () => {
  const [books, setBooks] = useState<Book[]>([])

  const handleLoadingBookList = async (): Promise<Book[]> => {
    const apiUrl = 'http://127.0.0.1:8000/bookman/api/books/'

    const response = await fetch(apiUrl, { method: 'GET' })

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`)
    }

    const responseData = await response.json()
    const formattedData: Book[] = responseData.map((result: any) => ({
      id: result.id,
      name: result.name,
      leadText: result.lead_text,
    }))
    setBooks(formattedData)
    return formattedData
  }

  return { handleLoadingBookList, books }
}
