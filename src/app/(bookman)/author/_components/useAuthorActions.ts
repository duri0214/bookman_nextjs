'use client'

import { ChangeEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Author, IAuthorFormValues, IAuthorRequest } from '@/resource/author'

const AUTHOR_API_PATH = '/api/bookman/authors'

const INITIAL_FORM_VALUES: IAuthorFormValues = {
  name: '',
}

const buildRequestBody = (formValues: IAuthorFormValues): IAuthorRequest => ({
  name: formValues.name.trim(),
})

const formatResponseError = async (response: Response): Promise<string> => {
  try {
    const responseBody = await response.json()
    if (responseBody && typeof responseBody === 'object') {
      const messages = Object.entries(responseBody).flatMap(([fieldName, value]) => {
        const label = fieldName === 'name' ? '著者名' : fieldName
        const fieldMessages = Array.isArray(value) ? value : [value]
        return fieldMessages.map((message) => `${label}: ${String(message)}`)
      })
      if (messages.length > 0) {
        return messages.join(' ')
      }
    }
  } catch {
    // Fall back to the generic message below.
  }

  return '著者データの保存に失敗しました。著者名の重複や入力内容を確認してください。'
}

export function useAuthorActions() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formValues, setFormValues] = useState<IAuthorFormValues>(INITIAL_FORM_VALUES)
  const [isCreating, setIsCreating] = useState(false)
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null)
  const [editingRows, setEditingRows] = useState<Record<number, IAuthorFormValues>>({})
  const [savingAuthorId, setSavingAuthorId] = useState<number | null>(null)
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
    if (!formValues.name.trim()) {
      setCreateErrorMessage('著者名を入力してください。')
      return
    }

    setIsCreating(true)
    setCreateErrorMessage(null)

    try {
      const response = await fetch(AUTHOR_API_PATH, {
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
      router.refresh()
    } catch {
      setCreateErrorMessage(
        '著者データの登録に失敗しました。著者名の重複や入力内容を確認してください。',
      )
    } finally {
      setIsCreating(false)
    }
  }

  const getEditingRow = (author: Author): IAuthorFormValues =>
    editingRows[author.id] ?? {
      name: author.name,
    }

  const onEditChange =
    (author: Author, fieldName: keyof IAuthorFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const currentValues = getEditingRow(author)
      setEditingRows((rows) => ({
        ...rows,
        [author.id]: {
          ...currentValues,
          [fieldName]: event.target.value,
        },
      }))
      setUpdateErrorMessage(null)
    }

  const onUpdate = async (author: Author) => {
    const rowValues = getEditingRow(author)
    if (!rowValues.name.trim()) {
      setUpdateErrorMessage('著者名を入力してください。')
      return
    }

    setSavingAuthorId(author.id)
    setUpdateErrorMessage(null)

    try {
      const response = await fetch(`${AUTHOR_API_PATH}/${author.id}`, {
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
        delete nextRows[author.id]
        return nextRows
      })
      router.refresh()
    } catch {
      setUpdateErrorMessage(
        '著者データの更新に失敗しました。著者名の重複や入力内容を確認してください。',
      )
    } finally {
      setSavingAuthorId(null)
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
    savingAuthorId,
    updateErrorMessage,
  }
}
