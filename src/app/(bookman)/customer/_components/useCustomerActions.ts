'use client'

import { ChangeEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Customer, ICustomerFormValues, ICustomerRequest } from '@/resource/customer'

const CUSTOMER_API_PATH = '/api/bookman/customers'

const INITIAL_FORM_VALUES: ICustomerFormValues = {
  name: '',
  phone: '',
  max_lending_count: '',
}

const toPositiveInteger = (value: string): number | null => {
  const parsedValue = Number(value)
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null
  }
  return parsedValue
}

const buildCustomerRequest = (formValues: ICustomerFormValues): ICustomerRequest | null => {
  const maxLendingCount = toPositiveInteger(formValues.max_lending_count)

  if (!formValues.name.trim() || !maxLendingCount) {
    return null
  }

  return {
    name: formValues.name.trim(),
    phone: formValues.phone.trim(),
    max_lending_count: maxLendingCount,
  }
}

const formatResponseError = async (response: Response): Promise<string> => {
  try {
    const responseBody = await response.json()
    if (responseBody && typeof responseBody === 'object') {
      const responseMessage = 'message' in responseBody ? responseBody.message : null
      const responseDetail = 'detail' in responseBody ? responseBody.detail : null
      const plainMessage = typeof responseMessage === 'string' ? responseMessage : responseDetail
      if (typeof plainMessage === 'string' && !plainMessage.trim().startsWith('<')) {
        return plainMessage
      }

      const labels: Record<string, string> = {
        name: '利用者名',
        phone: '電話番号',
        max_lending_count: '貸出上限数',
      }
      const messages = Object.entries(responseBody)
        .filter(([fieldName]) => fieldName !== 'message' && fieldName !== 'detail')
        .flatMap(([fieldName, value]) => {
          const fieldMessages = Array.isArray(value) ? value : [value]
          return fieldMessages.map(
            (message) => `${labels[fieldName] ?? fieldName}: ${String(message)}`,
          )
        })
      if (messages.length > 0) {
        return messages.join(' ')
      }
    }
  } catch {
    // Fall back to the generic message below.
  }

  return '利用者データの保存に失敗しました。入力内容とバックエンドの状態を確認してください。'
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

export function useCustomerActions() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formValues, setFormValues] = useState<ICustomerFormValues>(INITIAL_FORM_VALUES)
  const [isCreating, setIsCreating] = useState(false)
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null)
  const [editingRows, setEditingRows] = useState<Record<number, ICustomerFormValues>>({})
  const [savingCustomerId, setSavingCustomerId] = useState<number | null>(null)
  const [deletingCustomerId, setDeletingCustomerId] = useState<number | null>(null)
  const [updateErrorMessage, setUpdateErrorMessage] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionMessageSeverity, setActionMessageSeverity] = useState<'success' | 'error'>('success')

  const showActionMessage = (message: string, severity: 'success' | 'error') => {
    setActionMessage(message)
    setActionMessageSeverity(severity)
  }

  const openDialog = () => {
    setIsDialogOpen(true)
    setCreateErrorMessage(null)
    setActionMessage(null)
  }

  const onCloseDialog = () => {
    setIsDialogOpen(false)
    setFormValues(INITIAL_FORM_VALUES)
    setCreateErrorMessage(null)
  }

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [event.target.name]: event.target.value,
    }))
    setCreateErrorMessage(null)
    setActionMessage(null)
  }

  const onCreate = async () => {
    const requestBody = buildCustomerRequest(formValues)
    if (!requestBody) {
      setCreateErrorMessage('利用者名と貸出上限数を正しく入力してください。')
      return
    }

    setIsCreating(true)
    setCreateErrorMessage(null)

    try {
      const response = await fetch(CUSTOMER_API_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        setCreateErrorMessage(await formatResponseError(response))
        return
      }

      onCloseDialog()
      router.refresh()
    } catch {
      setCreateErrorMessage(
        '利用者データの登録に失敗しました。入力内容とバックエンドの状態を確認してください。',
      )
    } finally {
      setIsCreating(false)
    }
  }

  const getEditingRow = (customer: Customer): ICustomerFormValues =>
    editingRows[customer.id] ?? {
      name: customer.name,
      phone: customer.phone,
      max_lending_count: String(customer.maxLendingCount),
    }

  const onEditChange =
    (customer: Customer, fieldName: keyof ICustomerFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const fieldValue = event.target.value
      setEditingRows((rows) => ({
        ...rows,
        [customer.id]: {
          ...(rows[customer.id] ?? {
            name: customer.name,
            phone: customer.phone,
            max_lending_count: String(customer.maxLendingCount),
          }),
          [fieldName]: fieldValue,
        },
      }))
      setUpdateErrorMessage(null)
      setActionMessage(null)
    }

  const onUpdate = async (customer: Customer) => {
    const requestBody = buildCustomerRequest(getEditingRow(customer))
    if (!requestBody) {
      setUpdateErrorMessage('利用者名と貸出上限数を正しく入力してください。')
      return
    }

    setSavingCustomerId(customer.id)
    setUpdateErrorMessage(null)

    try {
      const response = await fetch(`${CUSTOMER_API_PATH}/${customer.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        setUpdateErrorMessage(await formatResponseError(response))
        return
      }

      setEditingRows((rows) => {
        const nextRows = { ...rows }
        delete nextRows[customer.id]
        return nextRows
      })
      router.refresh()
    } catch {
      setUpdateErrorMessage(
        '利用者データの更新に失敗しました。入力内容とバックエンドの状態を確認してください。',
      )
    } finally {
      setSavingCustomerId(null)
    }
  }

  const onDelete = async (customer: Customer) => {
    if (!window.confirm(`利用者「${customer.name}」を削除します。よろしいですか？`)) {
      return
    }

    setDeletingCustomerId(customer.id)
    setUpdateErrorMessage(null)
    setActionMessage(null)

    try {
      const response = await fetch(`${CUSTOMER_API_PATH}/${customer.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        showActionMessage(
          await parseApiErrorMessage(response, '利用者データの削除に失敗しました。'),
          'error',
        )
        return
      }

      setEditingRows((rows) => {
        const nextRows = { ...rows }
        delete nextRows[customer.id]
        return nextRows
      })
      showActionMessage('利用者データを削除しました。', 'success')
      router.refresh()
    } catch {
      showActionMessage(
        '利用者データの削除に失敗しました。関連データやバックエンドの状態を確認してください。',
        'error',
      )
    } finally {
      setDeletingCustomerId(null)
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
    getEditingRow,
    onEditChange,
    onUpdate,
    savingCustomerId,
    onDelete,
    deletingCustomerId,
    updateErrorMessage,
    actionMessage,
    actionMessageSeverity,
  }
}
