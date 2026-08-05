import { ChangeEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Author } from '@/resource/author'
import { Category } from '@/resource/category'
import { Book, IBookFormValues, IBookRequest } from '@/resource/book'
import { isValidIsbn, normalizeIsbn } from './bookValidation'

const BOOK_API_PATH = '/api/bookman/books'

const toNumber = (value: string | undefined): number => Number(value ?? 0)

const FIELD_LABELS: Record<string, string> = {
  category: 'カテゴリ',
  name: '名前',
  authors: '著者',
  lead_text: 'あらすじ',
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

  return '書籍データの更新に失敗しました。入力内容とバックエンドの状態を確認してください。'
}

const parseApiErrorMessage = async (
  response: Response,
  fallbackMessage: string,
): Promise<string> => {
  try {
    const responseBody = await response.json()
    if (typeof responseBody?.message === 'string' && responseBody.message) {
      return responseBody.message
    }
    if (typeof responseBody?.detail === 'string' && responseBody.detail) {
      return responseBody.detail
    }
  } catch {
    return fallbackMessage
  }

  return fallbackMessage
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
): Omit<IBookRequest, 'municipality' | 'branch' | 'amount'> => ({
  category: toCategoryId(formValues.category, categories),
  name: formValues.name ?? '',
  authors: toAuthorIds(formValues.authors, authors),
  lead_text: formValues.lead_text ?? '',
  isbn: normalizeIsbn(formValues.isbn),
  publication_date: formValues.publication_date ?? '',
})

const toFormValues = (book: Book): Partial<IBookFormValues> => ({
  category: book.category ? String(book.category.id) : '',
  name: book.name,
  authors: book.authorIds.map(String).join(','),
  lead_text: book.leadText,
  isbn: book.isbn,
  publication_date: book.publicationDate,
})

export function useEditDialog(authors: Author[] = [], categories: Category[] = []) {
  const router = useRouter()
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [formValues, setFormValues] = useState<Partial<IBookFormValues>>({})
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateErrorMessage, setUpdateErrorMessage] = useState<string | null>(null)
  const [deletingBookId, setDeletingBookId] = useState<number | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionMessageSeverity, setActionMessageSeverity] = useState<'success' | 'error'>('success')

  const showActionMessage = (message: string, severity: 'success' | 'error') => {
    setActionMessage(message)
    setActionMessageSeverity(severity)
  }

  const openEditDialog = (book: Book) => {
    setSelectedBook(book)
    setFormValues(toFormValues(book))
    setUpdateErrorMessage(null)
    setActionMessage(null)
  }

  const onCloseEditDialog = () => {
    setSelectedBook(null)
    setFormValues({})
    setUpdateErrorMessage(null)
  }

  const onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const value =
      event.target.name === 'isbn' ? normalizeIsbn(event.target.value) : event.target.value

    setFormValues((formValues) => ({
      ...formValues,
      [event.target.name]: value,
    }))
    setUpdateErrorMessage(null)
    setActionMessage(null)
  }

  const onUpdate = async () => {
    if (!selectedBook) {
      return
    }

    if (toCategoryId(formValues.category, categories) === 0) {
      setUpdateErrorMessage('カテゴリを選択してください。')
      return
    }

    if (toAuthorIds(formValues.authors, authors).length === 0) {
      setUpdateErrorMessage('著者を1名以上選択してください。')
      return
    }

    if (!isValidIsbn(formValues.isbn)) {
      setUpdateErrorMessage(
        'ISBNは半角数字のみでISBN-10またはISBN-13の正しい形式で入力してください。例: 9784062938426',
      )
      return
    }

    setIsUpdating(true)
    setUpdateErrorMessage(null)

    try {
      const response = await fetch(`${BOOK_API_PATH}/${selectedBook.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildBookRequest(formValues, authors, categories)),
      })

      if (!response.ok) {
        setUpdateErrorMessage(await formatResponseError(response))
        return
      }

      onCloseEditDialog()
      showActionMessage('書籍データを更新しました。', 'success')
      router.refresh()
    } catch {
      setUpdateErrorMessage(
        '書籍データの更新に失敗しました。入力内容とバックエンドの状態を確認してください。',
      )
    } finally {
      setIsUpdating(false)
    }
  }

  const onDelete = async (book: Book) => {
    if (!window.confirm(`書籍「${book.name}」を削除します。よろしいですか？`)) {
      return
    }

    setDeletingBookId(book.id)
    setUpdateErrorMessage(null)
    setActionMessage(null)

    try {
      const response = await fetch(`${BOOK_API_PATH}/${book.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        showActionMessage(
          await parseApiErrorMessage(response, '書籍データの削除に失敗しました。'),
          'error',
        )
        return
      }

      showActionMessage('書籍データを削除しました。', 'success')
      router.refresh()
    } catch {
      showActionMessage(
        '書籍データの削除に失敗しました。関連データやバックエンドの状態を確認してください。',
        'error',
      )
    } finally {
      setDeletingBookId(null)
    }
  }

  return {
    selectedBook,
    isEditDialogOpen: selectedBook !== null,
    openEditDialog,
    onCloseEditDialog,
    formValues,
    onInputChange,
    onUpdate,
    isUpdating,
    updateErrorMessage,
    onDelete,
    deletingBookId,
    actionMessage,
    actionMessageSeverity,
  }
}
