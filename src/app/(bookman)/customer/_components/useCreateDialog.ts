import { ChangeEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ICustomerFormValues, ICustomerRequest } from '@/resource/customer'

const CREATE_CUSTOMER_API_PATH = '/api/bookman/customers'

const initialFormValues: ICustomerFormValues = {
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

export function useCreateDialog() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formValues, setFormValues] = useState<ICustomerFormValues>(initialFormValues)
  const [isCreating, setIsCreating] = useState(false)
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null)

  const openDialog = () => {
    setIsDialogOpen(true)
    setCreateErrorMessage(null)
  }

  const onCloseDialog = () => {
    setIsDialogOpen(false)
    setFormValues(initialFormValues)
    setCreateErrorMessage(null)
  }

  const onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
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
      const response = await fetch(CREATE_CUSTOMER_API_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error('Failed to create customer')
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
