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
      const labels: Record<string, string> = {
        name: '利用者名',
        phone: '電話番号',
        max_lending_count: '貸出上限数',
      }
      const messages = Object.entries(responseBody).flatMap(([fieldName, value]) => {
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

export function useCustomerActions() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formValues, setFormValues] = useState<ICustomerFormValues>(INITIAL_FORM_VALUES)
  const [isCreating, setIsCreating] = useState(false)
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null)
  const [editingRows, setEditingRows] = useState<Record<number, ICustomerFormValues>>({})
  const [savingCustomerId, setSavingCustomerId] = useState<number | null>(null)
  const [updateErrorMessage, setUpdateErrorMessage] = useState<string | null>(null)

  const openDialog = () => {
    setIsDialogOpen(true)
    setCreateErrorMessage(null)
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
    updateErrorMessage,
  }
}
