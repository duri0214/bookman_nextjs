import type { Category } from './category'

export interface IAuthor {
  id: number
  name: string
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
  total_amount: number
  branch_stocks: IBookBranchStockRaw[]
  amount: number
  isbn: string
  publication_date: string
}

export interface IBookBranchStockRaw {
  id: number
  branch: number
  branch_name: string
  amount: number
}

export interface BookBranchStock {
  id: number
  branchId: number
  branchName: string
  municipalityId: number | null
  municipalityName: string
  amount: number
}

export interface Book {
  id: number
  category: Category | null
  name: string
  authors: string
  leadText: string
  totalAmount: number
  branchStocks: BookBranchStock[]
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
