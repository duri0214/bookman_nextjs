export interface ICustomerRaw {
  id: number
  name: string
  phone: string
  max_lending_count: number
}

export interface Customer {
  id: number
  name: string
  phone: string
  maxLendingCount: number
}

export interface ICustomerRequest {
  name: string
  phone: string
  max_lending_count: number
}

export interface ICustomerFormValues {
  name: string
  phone: string
  max_lending_count: string
}
