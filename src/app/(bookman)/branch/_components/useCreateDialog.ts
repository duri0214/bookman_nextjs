import { ChangeEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Branch, IBranchFormValues, IBranchRequest } from '@/resource/branch'

const CREATE_BRANCH_API_PATH = '/api/bookman/branches'

const INITIAL_FORM_VALUES: IBranchFormValues = {
  municipality: '',
  name: '',
  address: '',
  phone: '',
  remark: '',
}

const FIELD_LABELS: Record<string, string> = {
  municipality: '自治体',
  name: '図書館の名前',
  address: '図書館の住所',
  phone: '図書館の電話番号',
  remark: '備考',
}

const isFormComplete = (formValues: IBranchFormValues): boolean =>
  Boolean(
    formValues.municipality &&
    formValues.name?.trim() &&
    formValues.address?.trim() &&
    formValues.phone?.trim() &&
    formValues.remark?.trim(),
  )

const buildRequestBody = (formValues: IBranchFormValues): IBranchRequest => ({
  municipality: Number(formValues.municipality),
  name: formValues.name?.trim() ?? '',
  address: formValues.address?.trim() ?? '',
  phone: formValues.phone?.trim() ?? '',
  remark: formValues.remark?.trim() ?? '',
})

const formatResponseError = async (response: Response): Promise<string> => {
  try {
    const responseBody = await response.json()
    if (responseBody && typeof responseBody === 'object') {
      const messages = Object.entries(responseBody).flatMap(([fieldName, value]) => {
        const label = FIELD_LABELS[fieldName] ?? fieldName
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

  return '支店データの登録に失敗しました。入力内容とバックエンドの状態を確認してください。'
}

export function useCreateDialog() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formValues, setFormValues] = useState<IBranchFormValues>(INITIAL_FORM_VALUES)
  const [isCreating, setIsCreating] = useState(false)
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [editFormValues, setEditFormValues] = useState<IBranchFormValues>(INITIAL_FORM_VALUES)
  const [isUpdating, setIsUpdating] = useState(false)
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

  /**
   * Updates the values of the branch state based on the input change.
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
    if (!isFormComplete(formValues)) {
      setCreateErrorMessage('必須項目をすべて入力してください。')
      return
    }

    setIsCreating(true)
    setCreateErrorMessage(null)

    try {
      const response = await fetch(CREATE_BRANCH_API_PATH, {
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
        '支店データの登録に失敗しました。入力内容とバックエンドの状態を確認してください。',
      )
    } finally {
      setIsCreating(false)
    }
  }

  const openEditDialog = (branch: Branch) => {
    setEditingBranch(branch)
    setEditFormValues({
      municipality: branch.municipalityId ? String(branch.municipalityId) : '',
      name: branch.name,
      address: branch.address,
      phone: branch.phone,
      remark: branch.remark,
    })
    setUpdateErrorMessage(null)
  }

  const onCloseEditDialog = () => {
    setEditingBranch(null)
    setEditFormValues(INITIAL_FORM_VALUES)
    setUpdateErrorMessage(null)
  }

  const onEditInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setEditFormValues((currentValues) => ({
      ...currentValues,
      [event.target.name]: event.target.value,
    }))
    setUpdateErrorMessage(null)
  }

  const onUpdate = async () => {
    if (!editingBranch) {
      return
    }

    if (!isFormComplete(editFormValues)) {
      setUpdateErrorMessage('必須項目をすべて入力してください。')
      return
    }

    setIsUpdating(true)
    setUpdateErrorMessage(null)

    try {
      const response = await fetch(`${CREATE_BRANCH_API_PATH}/${editingBranch.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildRequestBody(editFormValues)),
      })

      if (!response.ok) {
        setUpdateErrorMessage(await formatResponseError(response))
        return
      }

      onCloseEditDialog()
      router.refresh()
    } catch {
      setUpdateErrorMessage(
        '支店データの更新に失敗しました。入力内容とバックエンドの状態を確認してください。',
      )
    } finally {
      setIsUpdating(false)
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
    editingBranch,
    openEditDialog,
    onCloseEditDialog,
    editFormValues,
    onEditInputChange,
    onUpdate,
    isUpdating,
    updateErrorMessage,
  }
}
