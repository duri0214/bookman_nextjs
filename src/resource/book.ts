export interface IAuthor {
  name: string
}

export interface ICategory {
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
  category: ICategory
  authors: IAuthor[]
  lead_text: string
  publication_date: string
}

export interface Book {
  id: number
  category: ICategory
  name: string
  authors: string
  leadText: string
}
