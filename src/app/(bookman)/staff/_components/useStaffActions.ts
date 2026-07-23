'use client'

import { ChangeEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { IStaffFormValues, IStaffRequest, Staff, StaffRole } from '@/resource/staff'

const STAFF_API_PATH = '/api/bookman/staff'

const INITIAL_FORM_VALUES: IStaffFormValues = {
  name: '',
  branch: '',
  role: 'counter',
}

const buildRequestBody = (formValues: IStaffFormValues): IStaffRequest => ({
  name: formValues.name,
  branch: formValues.branch ? Number(formValues.branch) : null,
  role: formValues.role,
})

export function useStaffActions() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formValues, setFormValues] = useState<IStaffFormValues>(INITIAL_FORM_VALUES)
  const [isCreating, setIsCreating] = useState(false)
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null)
  const [editingRows, setEditingRows] = useState<Record<number, IStaffFormValues>>({})
  const [savingStaffId, setSavingStaffId] = useState<number | null>(null)
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
    setIsCreating(true)
    setCreateErrorMessage(null)

    try {
      const response = await fetch(STAFF_API_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildRequestBody(formValues)),
      })

      if (!response.ok) {
        throw new Error('Failed to create staff')
      }

      onCloseDialog()
      router.refresh()
    } catch {
      setCreateErrorMessage(
        '職員データの登録に失敗しました。入力内容とバックエンドの状態を確認してください。',
      )
    } finally {
      setIsCreating(false)
    }
  }

  const getEditingRow = (staff: Staff): IStaffFormValues =>
    editingRows[staff.id] ?? {
      name: staff.name,
      branch: staff.branchId ? String(staff.branchId) : '',
      role: staff.role,
    }

  const onEditChange =
    (staff: Staff, fieldName: keyof IStaffFormValues) => (event: ChangeEvent<HTMLInputElement>) => {
      const currentValues = getEditingRow(staff)
      setEditingRows((rows) => ({
        ...rows,
        [staff.id]: {
          ...currentValues,
          [fieldName]: event.target.value as StaffRole,
        },
      }))
      setUpdateErrorMessage(null)
    }

  const onUpdate = async (staff: Staff) => {
    const rowValues = getEditingRow(staff)
    setSavingStaffId(staff.id)
    setUpdateErrorMessage(null)

    try {
      const response = await fetch(`${STAFF_API_PATH}/${staff.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildRequestBody(rowValues)),
      })

      if (!response.ok) {
        throw new Error('Failed to update staff')
      }

      setEditingRows((rows) => {
        const nextRows = { ...rows }
        delete nextRows[staff.id]
        return nextRows
      })
      router.refresh()
    } catch {
      setUpdateErrorMessage(
        '職員データの更新に失敗しました。入力内容とバックエンドの状態を確認してください。',
      )
    } finally {
      setSavingStaffId(null)
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
    savingStaffId,
    updateErrorMessage,
  }
}
