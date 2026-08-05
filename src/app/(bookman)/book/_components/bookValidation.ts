import { isHalfWidthDigits, keepHalfWidthDigits } from '@/helpers/numericValidation'

export const normalizeIsbn = keepHalfWidthDigits

const isValidIsbn10 = (isbn: string): boolean => {
  if (!/^\d{10}$/.test(isbn)) {
    return false
  }

  const total = isbn.split('').reduce((sum, char, index) => {
    return sum + Number(char) * (10 - index)
  }, 0)

  return total % 11 === 0
}

const isValidIsbn13 = (isbn: string): boolean => {
  if (!/^\d{13}$/.test(isbn)) {
    return false
  }

  const total = isbn
    .slice(0, 12)
    .split('')
    .reduce((sum, char, index) => sum + Number(char) * (index % 2 === 0 ? 1 : 3), 0)
  const checkDigit = (10 - (total % 10)) % 10

  return checkDigit === Number(isbn[12])
}

export const isValidIsbn = (value: string | undefined): boolean => {
  const isbn = normalizeIsbn(value)
  return isHalfWidthDigits(value) && (isValidIsbn10(isbn) || isValidIsbn13(isbn))
}
