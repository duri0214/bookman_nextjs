export const normalizeIsbn = (value: string | undefined): string =>
  (value ?? '').replace(/[-\s]/g, '').toUpperCase()

const isValidIsbn10 = (isbn: string): boolean => {
  if (!/^\d{9}[\dX]$/.test(isbn)) {
    return false
  }

  const total = isbn.split('').reduce((sum, char, index) => {
    const digit = char === 'X' ? 10 : Number(char)
    return sum + digit * (10 - index)
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
  return isValidIsbn10(isbn) || isValidIsbn13(isbn)
}
