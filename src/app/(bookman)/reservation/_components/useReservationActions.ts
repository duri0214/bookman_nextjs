'use client'

import { ChangeEvent, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BranchBookStock, Lending } from '@/resource/lending'
import { IReservationFormValues, IReservationRequest } from '@/resource/reservation'

const RESERVATION_API_PATH = '/api/bookman/reservations'
const RESERVATION_EXPIRE_API_PATH = '/api/bookman/reservations/expire'

const initialFormValues: IReservationFormValues = {
  branchBookStock: '',
  customer: '',
}

const BUSINESS_ERROR_MESSAGES: Record<string, string> = {
  reservation_stock_available:
    '対象の本は貸出可能冊数が残っているため予約できません。貸出画面から貸出登録してください。',
  duplicate_reservation: '同じ利用者は同じ支店別所蔵へ重複して予約できません。',
  reservation_not_found: '取消対象の予約情報が見つかりません。',
  reservation_not_cancelable: '取消対象の予約は取り消しできない状態です。',
}

const toPositiveInteger = (value: string): number | null => {
  const parsedValue = Number(value)
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null
  }
  return parsedValue
}

const buildReservationRequest = (formValues: IReservationFormValues): IReservationRequest => ({
  branch_book_stock: toPositiveInteger(formValues.branchBookStock),
  customer: toPositiveInteger(formValues.customer),
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

export function useReservationActions(branchBookStocks: BranchBookStock[], lendings: Lending[]) {
  const router = useRouter()
  const reservableBranchBookStocks = useMemo(
    () => branchBookStocks.filter((branchBookStock) => branchBookStock.availableAmount <= 0),
    [branchBookStocks],
  )
  const [formValues, setFormValues] = useState(initialFormValues)
  const [isCreating, setIsCreating] = useState(false)
  const [cancelingReservationId, setCancelingReservationId] = useState<number | null>(null)
  const [isExpiring, setIsExpiring] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageSeverity, setMessageSeverity] = useState<'success' | 'error'>('success')

  const selectedStock = branchBookStocks.find(
    (branchBookStock) => branchBookStock.id === toPositiveInteger(formValues.branchBookStock),
  )
  const customersLendingSelectedBook = new Set(
    lendings
      .filter((lending) => lending.active)
      .filter((lending) => {
        const lendingStock = branchBookStocks.find(
          (branchBookStock) => branchBookStock.id === lending.branchBookStockId,
        )
        return selectedStock !== undefined && lendingStock?.bookId === selectedStock.bookId
      })
      .map((lending) => lending.customerId),
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
    if (!toPositiveInteger(formValues.branchBookStock) || !toPositiveInteger(formValues.customer)) {
      return '支店別所蔵と利用者を選択してください。'
    }

    if (selectedStock && selectedStock.availableAmount > 0) {
      return '対象の本は貸出可能冊数が残っているため予約できません。貸出画面から貸出登録してください。'
    }

    if (customersLendingSelectedBook.has(toPositiveInteger(formValues.customer) ?? 0)) {
      return '同じ本を貸出中の利用者は予約できません。'
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

    try {
      const response = await fetch(RESERVATION_API_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildReservationRequest(formValues)),
      })

      if (!response.ok) {
        showError(await parseApiErrorMessage(response, '予約登録に失敗しました。'))
        return
      }

      setFormValues(initialFormValues)
      showSuccess('予約を登録しました。')
      router.refresh()
    } catch {
      showError('予約登録に失敗しました。入力内容とバックエンドの状態を確認してください。')
    } finally {
      setIsCreating(false)
    }
  }

  const onCancel = async (reservationId: number) => {
    setCancelingReservationId(reservationId)
    setMessage(null)

    try {
      const response = await fetch(`${RESERVATION_API_PATH}/${reservationId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        showError(await parseApiErrorMessage(response, '予約取消に失敗しました。'))
        return
      }

      showSuccess('予約を取り消しました。')
      router.refresh()
    } catch {
      showError('予約取消に失敗しました。バックエンドの状態を確認してください。')
    } finally {
      setCancelingReservationId(null)
    }
  }

  const onExpireDueHolds = async () => {
    setIsExpiring(true)
    setMessage(null)

    try {
      const response = await fetch(RESERVATION_EXPIRE_API_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        showError(await parseApiErrorMessage(response, '取り置き期限切れの反映に失敗しました。'))
        return
      }

      const responseBody = await response.json().catch(() => null)
      const expiredCount =
        typeof responseBody?.expired_count === 'number' ? responseBody.expired_count : 0
      showSuccess(`期限切れの取り置きを${expiredCount}件反映しました。`)
      router.refresh()
    } catch {
      showError('取り置き期限切れの反映に失敗しました。バックエンドの状態を確認してください。')
    } finally {
      setIsExpiring(false)
    }
  }

  return {
    reservableBranchBookStocks,
    formValues,
    onInputChange,
    onCreate,
    onCancel,
    onExpireDueHolds,
    isCreating,
    cancelingReservationId,
    isExpiring,
    message,
    messageSeverity,
    selectedStock,
    customersLendingSelectedBook,
  }
}
