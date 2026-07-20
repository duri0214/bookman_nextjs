'use client'

import { ChangeEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BranchBookStock, ILendingFormValues, ILendingRequest } from '@/resource/lending'

const LENDING_API_PATH = '/api/bookman/lendings'
const LENDING_RETURN_API_PATH = '/api/bookman/lendings/return'

const initialFormValues: ILendingFormValues = {
  branchBookStock: '',
  customer: '',
  contactStaff: '',
  returnDate: '',
}

const BUSINESS_ERROR_MESSAGES: Record<string, string> = {
  duplicate_book_lending: '同じ利用者が同じ本をすでに借りています。',
  lending_stock_unavailable: '対象の支店別所蔵に貸出可能冊数が残っていません。',
  customer_lending_limit_exceeded: '利用者の貸出上限冊数に達しています。',
  lending_not_found: '返却対象の貸出が存在しません。',
  lending_already_returned: '返却対象はすでに返却済みです。',
}

const toPositiveInteger = (value: string): number | null => {
  const parsedValue = Number(value)
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null
  }
  return parsedValue
}

const buildLendingRequest = (formValues: ILendingFormValues): ILendingRequest => ({
  branch_book_stock: toPositiveInteger(formValues.branchBookStock),
  customer: toPositiveInteger(formValues.customer),
  contact_staff: toPositiveInteger(formValues.contactStaff),
  return_date: formValues.returnDate,
})

const parseApiErrorMessage = async (
  response: Response,
  fallbackMessage: string,
): Promise<string> => {
  try {
    const responseBody = await response.json()
    if (typeof responseBody?.message === 'string' && responseBody.message) {
      return responseBody.message
    }
    if (typeof responseBody?.code === 'string' && BUSINESS_ERROR_MESSAGES[responseBody.code]) {
      return BUSINESS_ERROR_MESSAGES[responseBody.code]
    }
  } catch {
    return fallbackMessage
  }

  return fallbackMessage
}

export function useLendingActions(branchBookStocks: BranchBookStock[]) {
  const router = useRouter()
  const defaultReturnDate = useMemo(() => new Date().toISOString().slice(0, 10), [])
  const [displayBranchBookStocks, setDisplayBranchBookStocks] = useState(branchBookStocks)
  const [formValues, setFormValues] = useState<ILendingFormValues>({
    ...initialFormValues,
    returnDate: defaultReturnDate,
  })
  const [isCreating, setIsCreating] = useState(false)
  const [returningLendingId, setReturningLendingId] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [messageSeverity, setMessageSeverity] = useState<'success' | 'error'>('success')

  const selectedStock = displayBranchBookStocks.find(
    (branchBookStock) => branchBookStock.id === toPositiveInteger(formValues.branchBookStock),
  )

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
    setMessage(null)
  }

  const showError = (errorMessage: string) => {
    setMessage(errorMessage)
    setMessageSeverity('error')
  }

  const showSuccess = (successMessage: string) => {
    setMessage(successMessage)
    setMessageSeverity('success')
  }

  const validateForm = (): string | null => {
    if (
      !toPositiveInteger(formValues.branchBookStock) ||
      !toPositiveInteger(formValues.customer) ||
      !toPositiveInteger(formValues.contactStaff) ||
      !formValues.returnDate
    ) {
      return '支店別所蔵、利用者、対応職員、返却予定日を選択してください。'
    }

    if (selectedStock && selectedStock.availableAmount <= 0) {
      return '対象の支店別所蔵に貸出可能冊数が残っていません。'
    }

    return null
  }

  const onCreate = async () => {
    const validationErrorMessage = validateForm()
    if (validationErrorMessage) {
      showError(validationErrorMessage)
      return
    }

    setIsCreating(true)
    setMessage(null)
    const branchBookStockId = toPositiveInteger(formValues.branchBookStock)

    try {
      const response = await fetch(LENDING_API_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildLendingRequest(formValues)),
      })

      if (!response.ok) {
        showError(await parseApiErrorMessage(response, '貸出登録に失敗しました。'))
        return
      }

      setDisplayBranchBookStocks((currentBranchBookStocks) =>
        currentBranchBookStocks.map((branchBookStock) =>
          branchBookStock.id === branchBookStockId
            ? {
                ...branchBookStock,
                availableAmount: Math.max(branchBookStock.availableAmount - 1, 0),
              }
            : branchBookStock,
        ),
      )
      setFormValues({ ...initialFormValues, returnDate: defaultReturnDate })
      showSuccess('貸出を登録しました。')
      router.refresh()
    } catch {
      showError('貸出登録に失敗しました。入力内容とバックエンドの状態を確認してください。')
    } finally {
      setIsCreating(false)
    }
  }

  const onReturn = async (lendingId: number) => {
    setReturningLendingId(lendingId)
    setMessage(null)

    try {
      const response = await fetch(LENDING_RETURN_API_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lending: lendingId }),
      })

      if (!response.ok) {
        showError(await parseApiErrorMessage(response, '返却処理に失敗しました。'))
        return
      }

      showSuccess('返却を受け付けました。')
      router.refresh()
    } catch {
      showError('返却処理に失敗しました。バックエンドの状態を確認してください。')
    } finally {
      setReturningLendingId(null)
    }
  }

  return {
    branchBookStocks: displayBranchBookStocks,
    formValues,
    onInputChange,
    onCreate,
    onReturn,
    isCreating,
    returningLendingId,
    message,
    messageSeverity,
    selectedStock,
  }
}
