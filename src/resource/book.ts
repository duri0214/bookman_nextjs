export interface IAuthor {
  id: number
  name: string
}

export interface ICategory {
  id: number
  name: string
  color: string
}

/**
 * Djangoから返却される book data
 *
 * @interface IBookRaw
 */
export interface IBookRaw {
  id: number
  name: string
  thumbnail: string | null
  category: number
  authors: number[]
  lead_text: string
  amount: number
  isbn: string
  publication_date: string
}

export interface Book {
  id: number
  category: ICategory | null
  name: string
  authors: string
  leadText: string
  publicationDate: string
}

export interface IBookRequest {
  category: number
  name: string
  authors: number[]
  lead_text: string
  amount: number
  isbn: string
  publication_date: string
}

export interface IBookFormValues {
  category: string
  name: string
  authors: string
  lead_text: string
  amount: string
  isbn: string
  publication_date: string
}
