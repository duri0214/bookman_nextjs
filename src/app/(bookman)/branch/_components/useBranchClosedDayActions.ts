'use client'

import { ChangeEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Branch,
  IBranchClosedDayFormValues,
  IBranchClosedDayRequest,
} from '@/resource/branch'

const BRANCH_CLOSED_DAY_API_PATH = '/api/bookman/branch-closed-days'

const initialFormValues: IBranchClosedDayFormValues = {
  branch: '',
  date: '',
  reason: '',
}

const toPositiveInteger = (value: string): number | null => {
  const parsedValue = Number(value)
  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return null
  }
  return parsedValue
}

const buildClosedDayRequest = (
  formValues: IBranchClosedDayFormValues,
  branches: Branch[],
): IBranchClosedDayRequest => {
  const branchId = toPositiveInteger(formValues.branch)
  const selectedBranch = branches.find((branch) => branch.id === branchId)

  return {
    ...(selectedBranch?.municipalityId ? { municipality: selectedBranch.municipalityId } : {}),
    branch: branchId,
    date: formValues.date,
    reason: formValues.reason.trim(),
  }
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

export function useBranchClosedDayActions(branches: Branch[] = []) {
  const router = useRouter()
  const [formValues, setFormValues] = useState(initialFormValues)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingClosedDayId, setDeletingClosedDayId] = useState<number | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [messageSeverity, setMessageSeverity] = useState<'success' | 'error'>('success')

  const showError = (errorMessage: string) => {
    setMessage(errorMessage)
    setMessageSeverity('error')
  }

  const showSuccess = (successMessage: string) => {
    setMessage(successMessage)
    setMessageSeverity('success')
  }

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormValues((currentValues) => ({ ...currentValues, [name]: value }))
    setMessage(null)
  }

  const validateForm = (): string | null => {
    if (!toPositiveInteger(formValues.branch) || !formValues.date) {
      return '支店と休館日を選択してください。'
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
      const response = await fetch(BRANCH_CLOSED_DAY_API_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildClosedDayRequest(formValues, branches)),
      })

      if (!response.ok) {
        showError(await parseApiErrorMessage(response, '休館日の登録に失敗しました。'))
        return
      }

      setFormValues(initialFormValues)
      showSuccess('休館日を登録しました。')
      router.refresh()
    } catch {
      showError('休館日の登録に失敗しました。入力内容とバックエンドの状態を確認してください。')
    } finally {
      setIsCreating(false)
    }
  }

  const onDelete = async (closedDayId: number) => {
    setDeletingClosedDayId(closedDayId)
    setMessage(null)

    try {
      const response = await fetch(`${BRANCH_CLOSED_DAY_API_PATH}/${closedDayId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        showError(await parseApiErrorMessage(response, '休館日の削除に失敗しました。'))
        return
      }

      showSuccess('休館日を削除しました。')
      router.refresh()
    } catch {
      showError('休館日の削除に失敗しました。バックエンドの状態を確認してください。')
    } finally {
      setDeletingClosedDayId(null)
    }
  }

  return {
    formValues,
    onInputChange,
    onCreate,
    onDelete,
    isCreating,
    deletingClosedDayId,
    message,
    messageSeverity,
  }
}
