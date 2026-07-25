export type ReservationStatus = 'waiting' | 'held' | 'canceled' | 'expired' | 'fulfilled'

export interface IReservationRaw {
  id: number
  branch_book_stock: number
  book_name?: string
  branch_name?: string
  customer: number
  customer_name?: string
  status: ReservationStatus
  hold_expires_on: string | null
  created_at: string
}

export interface Reservation {
  id: number
  branchBookStockId: number
  bookName: string
  branchName: string
  customerId: number
  customerName: string
  status: ReservationStatus
  statusLabel: string
  holdExpiresOn: string | null
  createdAt: string
  needsStaffFollowUp: boolean
  isExpiredHold: boolean
}

export interface IReservationFormValues {
  branchBookStock: string
  customer: string
}

export interface IReservationRequest {
  municipality?: number | null
  branch_book_stock: number | null
  customer: number | null
}
