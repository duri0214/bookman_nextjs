/**
 * Djangoから返却される branch data
 *
 * @interface IBranchRaw
 */
export interface IBranchRaw {
  id: number
  name: string
  address: string
  phone: string
  remark: string
}

export interface Branch {
  id: number
  name: string
  address: string
  phone: string
  remark: string
}
