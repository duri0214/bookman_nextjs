'use client'

import { ChangeEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  IMunicipalityFormValues,
  IMunicipalityRequest,
  Municipality,
} from '@/resource/municipality'

const MUNICIPALITY_API_PATH = '/api/bookman/municipalities'

const INITIAL_FORM_VALUES: IMunicipalityFormValues = {
  name: '',
}

const buildRequestBody = (formValues: IMunicipalityFormValues): IMunicipalityRequest => ({
  name: formValues.name,
})

export function useMunicipalityActions() {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formValues, setFormValues] = useState<IMunicipalityFormValues>(INITIAL_FORM_VALUES)
  const [isCreating, setIsCreating] = useState(false)
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null)
  const [editingRows, setEditingRows] = useState<Record<number, IMunicipalityFormValues>>({})
  const [savingMunicipalityId, setSavingMunicipalityId] = useState<number | null>(null)
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
      const response = await fetch(MUNICIPALITY_API_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildRequestBody(formValues)),
      })

      if (!response.ok) {
        throw new Error('Failed to create municipality')
      }

      onCloseDialog()
      router.refresh()
    } catch {
      setCreateErrorMessage(
        '自治体データの登録に失敗しました。自治体名の重複や入力内容を確認してください。',
      )
    } finally {
      setIsCreating(false)
    }
  }

  const getEditingRow = (municipality: Municipality): IMunicipalityFormValues =>
    editingRows[municipality.id] ?? {
      name: municipality.name,
    }

  const onEditChange =
    (municipality: Municipality, fieldName: keyof IMunicipalityFormValues) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const currentValues = getEditingRow(municipality)
      setEditingRows((rows) => ({
        ...rows,
        [municipality.id]: {
          ...currentValues,
          [fieldName]: event.target.value,
        },
      }))
      setUpdateErrorMessage(null)
    }

  const onUpdate = async (municipality: Municipality) => {
    const rowValues = getEditingRow(municipality)
    setSavingMunicipalityId(municipality.id)
    setUpdateErrorMessage(null)

    try {
      const response = await fetch(`${MUNICIPALITY_API_PATH}/${municipality.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildRequestBody(rowValues)),
      })

      if (!response.ok) {
        throw new Error('Failed to update municipality')
      }

      setEditingRows((rows) => {
        const nextRows = { ...rows }
        delete nextRows[municipality.id]
        return nextRows
      })
      router.refresh()
    } catch {
      setUpdateErrorMessage(
        '自治体データの更新に失敗しました。自治体名の重複や入力内容を確認してください。',
      )
    } finally {
      setSavingMunicipalityId(null)
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
    savingMunicipalityId,
    updateErrorMessage,
  }
}
