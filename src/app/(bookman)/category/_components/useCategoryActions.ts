'use client'

import { ChangeEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Category, ICategoryFormValues, ICategoryRequest } from '@/resource/category'

const CATEGORY_API_PATH = '/api/bookman/categories'
const COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/

const INITIAL_FORM_VALUES: ICategoryFormValues = {
  name: '',
  color: '#1976d2',
}

const buildRequestBody = (formValues: ICategoryFormValues): ICategoryRequest => ({
  name: formValues.name.trim(),
  color: formValues.color.trim(),
})

const formatResponseError = async (response: Response): Promise<string> => {
  try {
    const responseBody = await response.json()
    if (responseBody && typeof responseBody === 'object') {
      const messages = Object.entries(responseBody).flatMap(([fieldName, value]) => {
        const labels: Record<string, string> = {
          name: 'カテゴリ名',
          color: '表示色',
        }
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

  return 'カテゴリデータの保存に失敗しました。カテゴリ名の重複や入力内容を確認してください。'
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

const validateFormValues = (formValues: ICategoryFormValues): string | null => {
  if (!formValues.name.trim()) {
    return 'カテゴリ名を入力してください。'
  }
  if (!COLOR_PATTERN.test(formValues.color.trim())) {
    return '表示色は #1976d2 のような16進カラーコードで入力してください。'
  }
  return null
}

export function useCategoryActions() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formValues, setFormValues] = useState<ICategoryFormValues>(INITIAL_FORM_VALUES)
  const [isCreating, setIsCreating] = useState(false)
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null)
  const [editingRows, setEditingRows] = useState<Record<number, ICategoryFormValues>>({})
  const [savingCategoryId, setSavingCategoryId] = useState<number | null>(null)
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null)
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
    const validationError = validateFormValues(formValues)
    if (validationError) {
      setCreateErrorMessage(validationError)
      return
    }

    setIsCreating(true)
    setCreateErrorMessage(null)

    try {
      const response = await fetch(CATEGORY_API_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildRequestBody(formValues)),
      })

      if (!response.ok) {
        setCreateErrorMessage(await formatResponseError(response))
        return
      }

      onCloseDialog()
      showActionMessage('カテゴリデータを登録しました。', 'success')
      router.refresh()
    } catch {
      setCreateErrorMessage(
        'カテゴリデータの登録に失敗しました。カテゴリ名の重複や入力内容を確認してください。',
      )
    } finally {
      setIsCreating(false)
    }
  }

  const getEditingRow = (category: Category): ICategoryFormValues =>
    editingRows[category.id] ?? {
      name: category.name,
      color: category.color,
    }

  const onEditChange =
    (category: Category, fieldName: keyof ICategoryFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      setEditingRows((rows) => ({
        ...rows,
        [category.id]: {
          ...(rows[category.id] ?? {
            name: category.name,
            color: category.color,
          }),
          [fieldName]: value,
        },
      }))
      setUpdateErrorMessage(null)
      setActionMessage(null)
    }

  const onUpdate = async (category: Category) => {
    const rowValues = getEditingRow(category)
    const validationError = validateFormValues(rowValues)
    if (validationError) {
      setUpdateErrorMessage(validationError)
      return
    }

    setSavingCategoryId(category.id)
    setUpdateErrorMessage(null)

    try {
      const response = await fetch(`${CATEGORY_API_PATH}/${category.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildRequestBody(rowValues)),
      })

      if (!response.ok) {
        setUpdateErrorMessage(await formatResponseError(response))
        return
      }

      setEditingRows((rows) => {
        const nextRows = { ...rows }
        delete nextRows[category.id]
        return nextRows
      })
      showActionMessage('カテゴリデータを更新しました。', 'success')
      router.refresh()
    } catch {
      setUpdateErrorMessage(
        'カテゴリデータの更新に失敗しました。カテゴリ名の重複や入力内容を確認してください。',
      )
    } finally {
      setSavingCategoryId(null)
    }
  }

  const onDelete = async (category: Category) => {
    if (!window.confirm(`カテゴリ「${category.name}」を削除します。よろしいですか？`)) {
      return
    }

    setDeletingCategoryId(category.id)
    setUpdateErrorMessage(null)
    setActionMessage(null)

    try {
      const response = await fetch(`${CATEGORY_API_PATH}/${category.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        showActionMessage(
          await parseApiErrorMessage(response, 'カテゴリデータの削除に失敗しました。'),
          'error',
        )
        return
      }

      setEditingRows((rows) => {
        const nextRows = { ...rows }
        delete nextRows[category.id]
        return nextRows
      })
      showActionMessage('カテゴリデータを削除しました。', 'success')
      router.refresh()
    } catch {
      showActionMessage(
        'カテゴリデータの削除に失敗しました。関連データやバックエンドの状態を確認してください。',
        'error',
      )
    } finally {
      setDeletingCategoryId(null)
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
    savingCategoryId,
    onDelete,
    deletingCategoryId,
    updateErrorMessage,
    actionMessage,
    actionMessageSeverity,
  }
}
