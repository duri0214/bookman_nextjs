/**
 * Djangoから返却される branch data
 *
 * @interface IBranchRaw
 */
export interface IBranchRaw {
  id: number
  municipality?: number | null
  municipality_name?: string | null
  name: string
  address: string
  phone: string
  remark: string
}

export interface Branch {
  id: number
  municipalityId: number | null
  municipalityName: string
  name: string
  address: string
  phone: string
  remark: string
}

export interface IBranchRequest {
  municipality?: number | null
  name: string
  address: string
  phone: string
  remark: string
}

export interface IBranchClosedDayRaw {
  id: number
  branch: number
  branch_name?: string
  date: string
  reason: string
}

export interface BranchClosedDay {
  id: number
  branchId: number
  branchName: string
  date: string
  reason: string
}

export interface IBranchClosedDayFormValues {
  branch: string
  date: string
  reason: string
}

export interface IBranchClosedDayRequest {
  branch: number | null
  date: string
  reason: string
}
