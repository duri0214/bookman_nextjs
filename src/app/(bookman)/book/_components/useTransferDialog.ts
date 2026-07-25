import { ChangeEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Book, BookBranchStock } from '@/resource/book'

const TRANSFER_API_PATH = '/api/bookman/branch-book-stocks'

export interface TransferFormValues {
  fromBranch: string
  toBranch: string
  amount: string
}

const initialFormValues: TransferFormValues = {
  fromBranch: '',
  toBranch: '',
  amount: '',
}

const toPositiveInteger = (value: string): number | null => {
  const parsedValue = Number(value)
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null
  }
  return parsedValue
}

const buildTransferRequest = (
  bookId: number,
  municipalityId: number,
  formValues: TransferFormValues,
) => ({
  book: bookId,
  municipality: municipalityId,
  fromBranch: toPositiveInteger(formValues.fromBranch),
  toBranch: toPositiveInteger(formValues.toBranch),
  amount: toPositiveInteger(formValues.amount),
})

const getValidationErrorMessage = (
  formValues: TransferFormValues,
  sourceStock: BookBranchStock | undefined,
  municipalityId: number | null,
): string | null => {
  const fromBranch = toPositiveInteger(formValues.fromBranch)
  const toBranch = toPositiveInteger(formValues.toBranch)
  const amount = toPositiveInteger(formValues.amount)

  if (!municipalityId) {
    return '自治体を選択してから支店間移動を行ってください。'
  }

  if (!fromBranch || !toBranch || !amount) {
    return '移動元、移動先、冊数を正しく入力してください。'
  }

  if (fromBranch === toBranch) {
    return '移動元支店と移動先支店は別の支店を選択してください。'
  }

  if (!sourceStock || sourceStock.amount < amount) {
    return '移動元支店の所蔵数が不足しています。'
  }

  return null
}

export function useTransferDialog(selectedMunicipalityId = '') {
  const router = useRouter()
  const municipalityId = toPositiveInteger(selectedMunicipalityId)
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [formValues, setFormValues] = useState<TransferFormValues>(initialFormValues)
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferErrorMessage, setTransferErrorMessage] = useState<string | null>(null)

  const sourceStock = useMemo(
    () =>
      selectedBook?.branchStocks.find(
        (branchStock) =>
          branchStock.branchId === toPositiveInteger(formValues.fromBranch) &&
          branchStock.amount > 0,
      ),
    [formValues.fromBranch, selectedBook],
  )

  const openTransferDialog = (book: Book) => {
    const firstStockedBranch = book.branchStocks.find((branchStock) => branchStock.amount > 0)

    setSelectedBook(book)
    setFormValues({
      fromBranch: firstStockedBranch?.branchId.toString() ?? '',
      toBranch: '',
      amount: '1',
    })
    setTransferErrorMessage(null)
  }

  const onCloseTransferDialog = () => {
    setSelectedBook(null)
    setFormValues(initialFormValues)
    setTransferErrorMessage(null)
  }

  const onTransferInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    setFormValues((currentValues) => {
      const nextValues = {
        ...currentValues,
        [name]: value,
      }

      if (name === 'fromBranch' && currentValues.toBranch === value) {
        return {
          ...nextValues,
          toBranch: '',
        }
      }

      return nextValues
    })
    setTransferErrorMessage(null)
  }

  const onTransfer = async () => {
    if (!selectedBook) {
      return
    }

    const validationErrorMessage = getValidationErrorMessage(
      formValues,
      sourceStock,
      municipalityId,
    )
    if (validationErrorMessage) {
      setTransferErrorMessage(validationErrorMessage)
      return
    }
    if (!municipalityId) {
      setTransferErrorMessage('自治体を選択してから支店間移動を行ってください。')
      return
    }

    setIsTransferring(true)
    setTransferErrorMessage(null)

    try {
      const response = await fetch(TRANSFER_API_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildTransferRequest(selectedBook.id, municipalityId, formValues)),
      })

      if (!response.ok) {
        throw new Error('Failed to transfer book stocks')
      }

      onCloseTransferDialog()
      router.refresh()
    } catch {
      setTransferErrorMessage(
        '支店間の書籍移動に失敗しました。入力内容とバックエンドの状態を確認してください。',
      )
    } finally {
      setIsTransferring(false)
    }
  }

  return {
    selectedBook,
    isTransferDialogOpen: selectedBook !== null,
    openTransferDialog,
    onCloseTransferDialog,
    formValues,
    onTransferInputChange,
    onTransfer,
    isTransferring,
    transferErrorMessage,
    sourceStock,
  }
}
