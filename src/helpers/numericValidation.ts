export const keepHalfWidthDigits = (value: string | undefined): string =>
  (value ?? '').replace(/\D/g, '')

export const isHalfWidthDigits = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9]+$/.test(value)

export const halfWidthDigitsError = (fieldName: string): Record<string, string[]> => ({
  [fieldName]: ['半角数字のみで入力してください。'],
})
