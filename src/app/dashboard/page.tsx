'use client'
import { useEffect, useState } from 'react'
import { BookList } from '@/app/dashboard/_components/BookList'
import { Book } from '@/resource/book'

export default function Page() {
  const [books, setBooks] = useState<Book[]>([])

  useEffect(() => {
    const fetchData = async (): Promise<Book[]> => {
      const apiUrl = 'http://127.0.0.1:8000/bookman/api/books/'

      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
        })

        if (response.ok) {
          const responseData = await response.json()
          const formattedData: Book[] = responseData.map((result: any) => ({
            id: result.id,
            name: result.name,
            leadText: result.lead_text,
          }))
          setBooks(formattedData)
          return formattedData
        } else {
          console.error('Error fetching data:', response.statusText)
          return []
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        return []
      }
    }
    fetchData()
  }, [])

  if (!books) {
    return <div>Loading...</div>
  }

  const props = {
    books,
  }
  return <BookList {...props} />
}
