import { ChangeEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Author } from '@/resource/author'
import { Category } from '@/resource/category'
import { IBookFormValues, IBookRequest } from '@/resource/book'

const CREATE_BOOK_API_PATH = '/api/bookman/books'

const toNumber = (value: string | undefined): number => Number(value ?? 0)

const normalizeIsbn = (value: string | undefined): string =>
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

const isValidIsbn = (value: string | undefined): boolean => {
  const isbn = normalizeIsbn(value)
  return isValidIsbn10(isbn) || isValidIsbn13(isbn)
}

const FIELD_LABELS: Record<string, string> = {
  category: 'カテゴリ',
  name: '名前',
  authors: '著者',
  lead_text: 'あらすじ',
  amount: '数量',
  isbn: 'ISBN',
  publication_date: '出版年月日',
  non_field_errors: '入力内容',
  detail: 'エラー',
  message: 'エラー',
}

const formatResponseError = async (response: Response): Promise<string> => {
  try {
    const responseBody = await response.json()

    if (typeof responseBody === 'string') {
      return responseBody
    }

    if (responseBody && typeof responseBody === 'object') {
      const messages = Object.entries(responseBody).flatMap(([fieldName, value]) => {
        const fieldMessages = Array.isArray(value) ? value : [value]
        return fieldMessages.map(
          (message) => `${FIELD_LABELS[fieldName] ?? fieldName}: ${String(message)}`,
        )
      })

      if (messages.length > 0) {
        return messages.join(' ')
      }
    }
  } catch {
    // Fall back to the generic message below.
  }

  return '書籍データの登録に失敗しました。入力内容とバックエンドの状態を確認してください。'
}

const toCategoryId = (value: string | undefined, categories: Category[] = []): number => {
  const categoryId = toNumber(value)
  const availableCategoryIds = new Set(categories.map((category) => category.id))

  if (
    Number.isInteger(categoryId) &&
    categoryId > 0 &&
    (availableCategoryIds.size === 0 || availableCategoryIds.has(categoryId))
  ) {
    return categoryId
  }

  return 0
}

const toAuthorIds = (value: string | undefined, authors: Author[] = []): number[] => {
  const availableAuthorIds = new Set(authors.map((author) => author.id))

  return (value ?? '')
    .split(',')
    .map((authorId) => Number(authorId.trim()))
    .filter(
      (authorId) =>
        Number.isInteger(authorId) &&
        authorId > 0 &&
        (availableAuthorIds.size === 0 || availableAuthorIds.has(authorId)),
    )
}

const buildBookRequest = (
  formValues: Partial<IBookFormValues>,
  authors: Author[],
  categories: Category[],
): IBookRequest => ({
  category: toCategoryId(formValues.category, categories),
  name: formValues.name ?? '',
  authors: toAuthorIds(formValues.authors, authors),
  lead_text: formValues.lead_text ?? '',
  amount: toNumber(formValues.amount),
  isbn: normalizeIsbn(formValues.isbn),
  publication_date: formValues.publication_date ?? '',
})

export function useCreateDialog(authors: Author[] = [], categories: Category[] = []) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formValues, setFormValues] = useState<Partial<IBookFormValues>>({})
  const [isCreating, setIsCreating] = useState(false)
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null)

  const openDialog = () => {
    setIsDialogOpen(true)
    setCreateErrorMessage(null)
  }

  const onCloseDialog = () => {
    setIsDialogOpen(false)
    setFormValues({})
    setCreateErrorMessage(null)
  }

  /**
   * Updates the values of the book state based on the input change.
   *
   * @param {ChangeEvent<HTMLInputElement>} event - The input change event.
   * @returns {void}
   */
  const onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setFormValues((formValues) => ({
      ...formValues,
      [event.target.name]: event.target.value,
    }))
    setCreateErrorMessage(null)
  }

  const onCreate = async () => {
    if (toCategoryId(formValues.category, categories) === 0) {
      setCreateErrorMessage('カテゴリを選択してください。')
      return
    }

    if (toAuthorIds(formValues.authors, authors).length === 0) {
      setCreateErrorMessage('著者を1名以上選択してください。')
      return
    }

    if (!isValidIsbn(formValues.isbn)) {
      setCreateErrorMessage(
        'ISBNはISBN-10またはISBN-13の正しい形式で入力してください。例: 978-4-06-293842-6',
      )
      return
    }

    setIsCreating(true)
    setCreateErrorMessage(null)

    try {
      const response = await fetch(CREATE_BOOK_API_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildBookRequest(formValues, authors, categories)),
      })

      if (!response.ok) {
        setCreateErrorMessage(await formatResponseError(response))
        return
      }

      onCloseDialog()
      router.refresh()
    } catch {
      setCreateErrorMessage(
        '書籍データの登録に失敗しました。入力内容とバックエンドの状態を確認してください。',
      )
    } finally {
      setIsCreating(false)
    }
  }

  return {
    isDialogOpen,
    openDialog,
    onCloseDialog,
    formValues,
    onInputChange,
    onCreate,
    isCreating,
    createErrorMessage,
  }
}
