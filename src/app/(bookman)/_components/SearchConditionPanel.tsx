'use client'

import { useMemo, useState } from 'react'
import { Alert, Box, Button, Divider, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { LibraryStaff } from '@/resource/lending'
import {
  SEARCH_CONDITION_SHARE_SCOPE_LABELS,
  type SearchCondition,
  type SearchConditionShareScope,
} from '@/resource/searchCondition'
import { useSearchConditions } from './useSearchConditions'

interface Props {
  targetScreen: string
  title: string
  staffMembers: LibraryStaff[]
  currentConditions: Record<string, unknown>
  onApply: (conditions: Record<string, unknown>) => void
  isMockData?: boolean
}

const canCreateScope = (
  scope: SearchConditionShareScope,
  permission: ReturnType<typeof useSearchConditions>['permission'],
) => {
  if (!permission) {
    return false
  }
  if (scope === 'personal') {
    return permission.canCreatePersonal
  }
  if (scope === 'branch') {
    return permission.canCreateBranch
  }
  return permission.canCreateAdmin
}

const getConditionDescription = (condition: SearchCondition): string => {
  const scope = SEARCH_CONDITION_SHARE_SCOPE_LABELS[condition.shareScope]
  const branch = condition.branchName ? ` / ${condition.branchName}` : ''
  return `${scope}${branch} / ${condition.createdByName}`
}

export function SearchConditionPanel({
  targetScreen,
  title,
  staffMembers,
  currentConditions,
  onApply,
  isMockData = false,
}: Props) {
  const [staffId, setStaffId] = useState<number | null>(staffMembers[0]?.id ?? null)
  const [selectedConditionId, setSelectedConditionId] = useState('')
  const [conditionName, setConditionName] = useState('')
  const [shareScope, setShareScope] = useState<SearchConditionShareScope>('personal')
  const {
    conditions,
    permission,
    isLoading,
    isSaving,
    message,
    errorMessage,
    save,
    update,
    remove,
  } = useSearchConditions({
    targetScreen,
    staffId,
    isMockData,
  })

  const selectedCondition = useMemo(
    () => conditions.find((condition) => condition.id === Number(selectedConditionId)),
    [conditions, selectedConditionId],
  )
  const isStaffMissing = staffMembers.length === 0 || staffId === null
  const canSave =
    !isStaffMissing && conditionName.trim() !== '' && canCreateScope(shareScope, permission)
  const handleSave = async () => {
    const saved = await save(conditionName.trim(), shareScope, currentConditions)
    if (saved) {
      setConditionName('')
    }
  }

  return (
    <Box sx={{ display: 'grid', gap: 2, minWidth: 0 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}
      >
        <Typography component='h2' variant='h6'>
          {title}
        </Typography>
        <TextField
          select
          size='small'
          label='操作職員'
          value={staffId ?? ''}
          onChange={(event) => {
            setStaffId(Number(event.target.value))
            setSelectedConditionId('')
          }}
          sx={{ minWidth: 220 }}
          disabled={staffMembers.length === 0}
          helperText={
            staffMembers.length === 0 ? '職員データがないため保存条件を操作できません。' : ''
          }
        >
          {staffMembers.map((staff) => (
            <MenuItem key={staff.id} value={staff.id}>
              {staff.name}
              {staff.branchName ? ` / ${staff.branchName}` : ''}
              {staff.role ? ` / ${staff.role}` : ''}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      {permission && (
        <Alert severity={permission.disabledReason ? 'warning' : 'info'}>
          表示範囲:{' '}
          {permission.recordScope === 'all'
            ? '全支店'
            : permission.recordScope === 'own_branch'
              ? '所属支店'
              : 'なし'}
          {permission.disabledReason
            ? `。${permission.disabledReason}`
            : '。支店共有・管理者共有を作成できます。'}
        </Alert>
      )}
      {message && <Alert severity='success'>{message}</Alert>}
      {errorMessage && <Alert severity='warning'>{errorMessage}</Alert>}

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{ flexWrap: 'wrap', minWidth: 0 }}
      >
        <TextField
          select
          size='small'
          label='保存済み条件'
          value={selectedConditionId}
          onChange={(event) => setSelectedConditionId(event.target.value)}
          sx={{ minWidth: { xs: 0, md: 260 }, flex: 1 }}
          disabled={isStaffMissing || isLoading}
          helperText={conditions.length === 0 ? '保存済み条件はまだありません。' : ''}
        >
          {conditions.map((condition) => (
            <MenuItem key={condition.id} value={condition.id} sx={{ whiteSpace: 'normal' }}>
              {condition.name}（{getConditionDescription(condition)}）
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant='outlined'
          onClick={() => selectedCondition && onApply(selectedCondition.conditions)}
          disabled={!selectedCondition}
          sx={{ whiteSpace: 'nowrap' }}
        >
          読み込み
        </Button>
        <Button
          variant='outlined'
          onClick={() =>
            selectedCondition && update(selectedCondition.id, { name: conditionName.trim() })
          }
          disabled={!selectedCondition?.canUpdate || conditionName.trim() === ''}
          sx={{ whiteSpace: 'nowrap' }}
        >
          名称変更
        </Button>
        <Button
          variant='outlined'
          color='error'
          onClick={() => selectedCondition && remove(selectedCondition)}
          disabled={!selectedCondition?.canDelete}
          sx={{ whiteSpace: 'nowrap' }}
        >
          削除
        </Button>
      </Stack>

      <Divider />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{ flexWrap: 'wrap', minWidth: 0 }}
      >
        <TextField
          size='small'
          label='保存条件名'
          value={conditionName}
          onChange={(event) => setConditionName(event.target.value)}
          sx={{ minWidth: { xs: 0, md: 240 }, flex: 1 }}
        />
        <TextField
          select
          size='small'
          label='共有範囲'
          value={shareScope}
          onChange={(event) => setShareScope(event.target.value as SearchConditionShareScope)}
          sx={{ minWidth: 180 }}
        >
          {(Object.keys(SEARCH_CONDITION_SHARE_SCOPE_LABELS) as SearchConditionShareScope[]).map(
            (scope) => (
              <MenuItem key={scope} value={scope} disabled={!canCreateScope(scope, permission)}>
                {SEARCH_CONDITION_SHARE_SCOPE_LABELS[scope]}
              </MenuItem>
            ),
          )}
        </TextField>
        <Button
          variant='contained'
          onClick={handleSave}
          disabled={!canSave || isSaving}
          sx={{ whiteSpace: 'nowrap' }}
        >
          現在の条件を保存
        </Button>
        <Button
          variant='outlined'
          onClick={() =>
            selectedCondition && update(selectedCondition.id, { share_scope: shareScope })
          }
          disabled={!selectedCondition?.canUpdate || !canCreateScope(shareScope, permission)}
          sx={{ whiteSpace: 'nowrap' }}
        >
          共有範囲変更
        </Button>
      </Stack>
    </Box>
  )
}
