export type SearchConditionShareScope = 'personal' | 'branch' | 'admin'

export interface ISearchConditionRaw {
  id: number
  target_screen: string
  name: string
  conditions: Record<string, unknown>
  created_by: number
  created_by_name?: string
  branch: number | null
  branch_name?: string
  share_scope: SearchConditionShareScope
  owner_type: string
  can_update: boolean
  can_delete: boolean
}

export interface SearchCondition {
  id: number
  targetScreen: string
  name: string
  conditions: Record<string, unknown>
  createdBy: number
  createdByName: string
  branchId: number | null
  branchName: string
  shareScope: SearchConditionShareScope
  ownerType: string
  canUpdate: boolean
  canDelete: boolean
}

export interface ISearchConditionPermissionRaw {
  staff: number | null
  role: string
  branch: { id: number; name: string } | null
  can_create_personal: boolean
  can_create_branch: boolean
  can_create_admin: boolean
  record_scope: 'none' | 'own_branch' | 'all'
  disabled_reason: string
}

export interface SearchConditionPermission {
  staffId: number | null
  role: string
  branch: { id: number; name: string } | null
  canCreatePersonal: boolean
  canCreateBranch: boolean
  canCreateAdmin: boolean
  recordScope: 'none' | 'own_branch' | 'all'
  disabledReason: string
}

export interface SearchConditionRequest {
  target_screen: string
  name: string
  conditions: Record<string, unknown>
  created_by: number
  branch?: number | null
  share_scope: SearchConditionShareScope
}

export const SEARCH_CONDITION_SHARE_SCOPE_LABELS: Record<SearchConditionShareScope, string> = {
  personal: '個人',
  branch: '支店共有',
  admin: '管理者共有',
}

export const convertSearchCondition = (raw: ISearchConditionRaw): SearchCondition => ({
  id: raw.id,
  targetScreen: raw.target_screen,
  name: raw.name,
  conditions: raw.conditions,
  createdBy: raw.created_by,
  createdByName: raw.created_by_name ?? `職員 #${raw.created_by}`,
  branchId: raw.branch,
  branchName: raw.branch_name ?? '',
  shareScope: raw.share_scope,
  ownerType: raw.owner_type,
  canUpdate: raw.can_update,
  canDelete: raw.can_delete,
})

export const convertSearchConditionPermission = (
  raw: ISearchConditionPermissionRaw,
): SearchConditionPermission => ({
  staffId: raw.staff,
  role: raw.role,
  branch: raw.branch,
  canCreatePersonal: raw.can_create_personal,
  canCreateBranch: raw.can_create_branch,
  canCreateAdmin: raw.can_create_admin,
  recordScope: raw.record_scope,
  disabledReason: raw.disabled_reason,
})
