'use client'
import { useEffect, useState } from 'react'
import { BookList } from '@/app/book-list/_components/BookList'
import { Book } from '@/resource/book'

export default function Page() {
  const [books, setBooks] = useState<Book[]>([])
  const fetchData = async () => {
    const apiUrl = 'http://127.0.0.1:8000/bookman/api/books/'
    const response = await fetch(apiUrl, {
      method: 'GET',
    })

    if (response.ok) {
      const responseData = await response.json()
      const formattedData: Book[] = responseData.results.map((result: any) => ({
        id: result.id,
        name: result.name,
        leadText: result.lead_text,
      }))
      setBooks(formattedData)
    }
  }

  useEffect(() => {
    fetchData()
      .then((data) => console.log(data))
      .catch((e) => alert(e))
  }, [])

  if (!books) {
    return <div>Loading...</div>
  }

  const props = {
    books,
  }
  return <BookList {...props} />
}
