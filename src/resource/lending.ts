export interface IBranchBookStockRaw {
  id: number
  branch: number
  book: number
  amount: number
  available_amount?: number
  branch_name?: string
  book_name?: string
}

export interface BranchBookStock {
  id: number
  branchId: number
  bookId: number
  branchName: string
  bookName: string
  amount: number
  availableAmount: number
}

export interface ILibraryStaffRaw {
  id: number
  name: string
  branch?: number
  branch_name?: string
}

export interface LibraryStaff {
  id: number
  name: string
  branchId: number | null
  branchName: string
}

export interface ILendingRaw {
  id: number
  branch_book_stock: number
  customer: number
  contact_staff: number
  return_date: string
  active: boolean
  book_name?: string
  branch_name?: string
  customer_name?: string
  contact_staff_name?: string
  lending_date?: string
  returned_at?: string | null
}

export interface Lending {
  id: number
  branchBookStockId: number
  customerId: number
  contactStaffId: number
  returnDate: string
  active: boolean
  bookName: string
  branchName: string
  customerName: string
  contactStaffName: string
  lendingDate: string
  returnedAt: string | null
}

export interface ILendingFormValues {
  branchBookStock: string
  customer: string
  contactStaff: string
  returnDate: string
}

export interface ILendingRequest {
  branch_book_stock: number | null
  customer: number | null
  contact_staff: number | null
  return_date: string
}
