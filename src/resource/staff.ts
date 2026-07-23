export type StaffRole = 'counter' | 'manager' | 'admin'

export interface IStaffRaw {
  id: number
  name: string
  branch: number | null
  branch_name?: string | null
  role: StaffRole
}

export interface Staff {
  id: number
  name: string
  branchId: number | null
  branchName: string
  role: StaffRole
}

export interface IStaffFormValues {
  name: string
  branch: string
  role: StaffRole
}

export interface IStaffRequest {
  name: string
  branch: number | null
  role: StaffRole
}

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  counter: 'カウンター',
  manager: '支店管理者',
  admin: '管理者',
}
