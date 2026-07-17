const DEFAULT_BOOKMAN_API_BASE_URL = 'http://127.0.0.1:8000/bookman/api'

export const BOOKMAN_API_ENDPOINTS = {
  branches: 'branches/',
  books: 'books/',
  booksCreate: 'books/create/',
  authors: 'authors/',
  categories: 'categories/',
} as const

export type BookmanApiEndpoint = keyof typeof BOOKMAN_API_ENDPOINTS

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '')

const trimLeadingSlash = (value: string): string => value.replace(/^\/+/, '')

export const getBookmanApiBaseUrl = (): string =>
  trimTrailingSlash(process.env.BOOKMAN_API_BASE_URL || DEFAULT_BOOKMAN_API_BASE_URL)

export const getBookmanApiUrl = (endpoint: BookmanApiEndpoint): string =>
  `${getBookmanApiBaseUrl()}/${trimLeadingSlash(BOOKMAN_API_ENDPOINTS[endpoint])}`
