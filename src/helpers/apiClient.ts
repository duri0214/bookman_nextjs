const DEFAULT_BOOKMAN_API_BASE_URL = 'http://127.0.0.1:8000/bookman/api'

export const BOOKMAN_API_ENDPOINTS = {
  branches: 'branches/',
  branchClosedDays: 'branch-closed-days/',
  books: 'books/',
  booksCreate: 'books/create/',
  branchBookStocks: 'branch-book-stocks/',
  municipalities: 'municipalities/',
  authors: 'authors/',
  categories: 'categories/',
  customers: 'customers/',
  staff: 'staff/',
  lendings: 'lendings/',
  lendingReturn: 'lendings/return/',
  reservations: 'reservations/',
  reservationExpire: 'reservations/expire/',
  searchConditions: 'search-conditions/',
  searchConditionPermissions: 'search-conditions/permissions/',
} as const

export type BookmanApiEndpoint = keyof typeof BOOKMAN_API_ENDPOINTS

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '')

const trimLeadingSlash = (value: string): string => value.replace(/^\/+/, '')

export const getBookmanApiBaseUrl = (): string =>
  trimTrailingSlash(process.env.BOOKMAN_API_BASE_URL || DEFAULT_BOOKMAN_API_BASE_URL)

export const getBookmanApiUrl = (endpoint: BookmanApiEndpoint): string =>
  `${getBookmanApiBaseUrl()}/${trimLeadingSlash(BOOKMAN_API_ENDPOINTS[endpoint])}`
