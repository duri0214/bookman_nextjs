'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  convertSearchCondition,
  convertSearchConditionPermission,
  type ISearchConditionPermissionRaw,
  type ISearchConditionRaw,
  type SearchCondition,
  type SearchConditionPermission,
  type SearchConditionShareScope,
} from '@/resource/searchCondition'

interface UseSearchConditionsArgs {
  targetScreen: string
  staffId: number | null
  isMockData?: boolean
}

const getMockPermission = (staffId: number): SearchConditionPermission => ({
  staffId,
  role: 'manager',
  branch: { id: 1, name: '中央図書館' },
  canCreatePersonal: true,
  canCreateBranch: true,
  canCreateAdmin: false,
  recordScope: 'own_branch',
  disabledReason: '',
})

const getMockConditions = (targetScreen: string, staffId: number): SearchCondition[] => {
  const baseCondition = {
    targetScreen,
    createdBy: staffId,
    createdByName: 'モック職員',
    branchId: 1,
    branchName: '中央図書館',
    ownerType: 'mock',
    canUpdate: true,
    canDelete: true,
  }

  if (targetScreen === 'books') {
    return [
      {
        ...baseCondition,
        id: 9001,
        name: 'モック: 中央図書館の所蔵本',
        conditions: { keyword: '吾輩', branchId: '1', stockedOnly: true },
        shareScope: 'branch',
      },
      {
        ...baseCondition,
        id: 9002,
        name: 'モック: 全支店の登録本',
        conditions: { keyword: '', branchId: '', stockedOnly: false },
        shareScope: 'personal',
      },
    ]
  }

  if (targetScreen === 'lendings') {
    return [
      {
        ...baseCondition,
        id: 9101,
        name: 'モック: 中央図書館の返却期限近い貸出',
        conditions: { municipalityId: '1', branchId: '1', dueWithinDays: '7' },
        shareScope: 'branch',
      },
    ]
  }

  if (targetScreen === 'reservations') {
    return [
      {
        ...baseCondition,
        id: 9201,
        name: 'モック: 中央図書館の全予約',
        conditions: { reservationFilter: 'all', branchId: '1' },
        shareScope: 'branch',
      },
      {
        ...baseCondition,
        id: 9202,
        name: 'モック: 対応中の予約',
        conditions: { reservationFilter: 'open', branchId: '' },
        shareScope: 'personal',
      },
    ]
  }

  return []
}

const getResponseMessage = async (response: Response, fallback: string): Promise<string> => {
  try {
    const body = await response.json()
    if (body?.message) {
      return String(body.message)
    }
    if (typeof body === 'object' && body !== null) {
      const firstValue = Object.values(body)[0]
      if (Array.isArray(firstValue)) {
        return String(firstValue[0] ?? fallback)
      }
      if (typeof firstValue === 'string') {
        return firstValue
      }
    }
  } catch {
    return fallback
  }

  return fallback
}

export function useSearchConditions({
  targetScreen,
  staffId,
  isMockData = false,
}: UseSearchConditionsArgs) {
  const [conditions, setConditions] = useState<SearchCondition[]>([])
  const [permission, setPermission] = useState<SearchConditionPermission | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const query = useMemo(() => {
    if (!staffId) {
      return ''
    }
    const params = new URLSearchParams({
      staff: String(staffId),
      target_screen: targetScreen,
    })
    return params.toString()
  }, [staffId, targetScreen])

  const load = useCallback(async () => {
    if (!staffId || !query) {
      setConditions([])
      setPermission(null)
      return
    }

    setIsLoading(true)
    setErrorMessage(null)
    try {
      if (isMockData) {
        setConditions(getMockConditions(targetScreen, staffId))
        setPermission(getMockPermission(staffId))
        return
      }

      const [conditionsResponse, permissionResponse] = await Promise.all([
        fetch(`/api/bookman/search-conditions?${query}`),
        fetch(`/api/bookman/search-conditions/permissions?staff=${staffId}`),
      ])

      if (!conditionsResponse.ok) {
        throw new Error(
          await getResponseMessage(conditionsResponse, '保存条件の取得に失敗しました。'),
        )
      }
      if (!permissionResponse.ok) {
        throw new Error(
          await getResponseMessage(permissionResponse, '権限情報の取得に失敗しました。'),
        )
      }

      const conditionRows = (await conditionsResponse.json()) as ISearchConditionRaw[]
      const permissionRow = (await permissionResponse.json()) as ISearchConditionPermissionRaw
      setConditions(conditionRows.map(convertSearchCondition))
      setPermission(convertSearchConditionPermission(permissionRow))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '保存条件の取得に失敗しました。')
    } finally {
      setIsLoading(false)
    }
  }, [isMockData, query, staffId, targetScreen])

  useEffect(() => {
    void Promise.resolve().then(load)
  }, [load])

  const save = async (
    name: string,
    shareScope: SearchConditionShareScope,
    currentConditions: Record<string, unknown>,
  ): Promise<boolean> => {
    if (!staffId) {
      setErrorMessage('職員を選択してください。')
      return false
    }

    setIsSaving(true)
    setMessage(null)
    setErrorMessage(null)
    try {
      const response = await fetch('/api/bookman/search-conditions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_screen: targetScreen,
          name,
          conditions: currentConditions,
          created_by: staffId,
          share_scope: shareScope,
          branch: permission?.branch?.id ?? null,
        }),
      })

      if (!response.ok) {
        throw new Error(await getResponseMessage(response, '保存条件の登録に失敗しました。'))
      }

      setMessage('検索条件を保存しました。')
      await load()
      return true
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '保存条件の登録に失敗しました。')
      return false
    } finally {
      setIsSaving(false)
    }
  }

  const update = async (
    conditionId: number,
    values: Partial<{ name: string; share_scope: SearchConditionShareScope }>,
  ) => {
    if (!staffId) {
      setErrorMessage('職員を選択してください。')
      return
    }

    setErrorMessage(null)
    try {
      const response = await fetch(
        `/api/bookman/search-conditions/${conditionId}?staff=${staffId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        },
      )

      if (!response.ok) {
        throw new Error(await getResponseMessage(response, '保存条件の更新に失敗しました。'))
      }

      setMessage('保存条件を更新しました。')
      await load()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '保存条件の更新に失敗しました。')
    }
  }

  const remove = async (condition: SearchCondition) => {
    if (!staffId) {
      setErrorMessage('職員を選択してください。')
      return
    }
    if (!window.confirm(`保存条件「${condition.name}」を削除します。よろしいですか？`)) {
      return
    }

    setErrorMessage(null)
    try {
      const response = await fetch(
        `/api/bookman/search-conditions/${condition.id}?staff=${staffId}`,
        {
          method: 'DELETE',
        },
      )

      if (!response.ok) {
        throw new Error(await getResponseMessage(response, '保存条件の削除に失敗しました。'))
      }

      setMessage('保存条件を削除しました。')
      await load()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '保存条件の削除に失敗しました。')
    }
  }

  return {
    conditions,
    permission,
    isLoading,
    isSaving,
    message,
    errorMessage,
    save,
    update,
    remove,
  }
}
