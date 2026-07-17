import { ChangeEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IBookFormValues, IBookRequest } from '@/resource/book'

const CREATE_BOOK_API_PATH = '/api/bookman/books'

const toNumber = (value: string | undefined): number => Number(value ?? 0)

const toAuthorIds = (value: string | undefined): number[] =>
  (value ?? '')
    .split(',')
    .map((authorId) => Number(authorId.trim()))
    .filter((authorId) => Number.isInteger(authorId) && authorId > 0)

const buildBookRequest = (formValues: Partial<IBookFormValues>): IBookRequest => ({
  category: toNumber(formValues.category),
  name: formValues.name ?? '',
  authors: toAuthorIds(formValues.authors),
  lead_text: formValues.lead_text ?? '',
  amount: toNumber(formValues.amount),
  isbn: formValues.isbn ?? '',
  publication_date: formValues.publication_date ?? '',
})

export function useCreateDialog() {
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
    setIsCreating(true)
    setCreateErrorMessage(null)

    try {
      const response = await fetch(CREATE_BOOK_API_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildBookRequest(formValues)),
      })

      if (!response.ok) {
        throw new Error('Failed to create book')
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
