export interface ICategoryRaw {
  id: number
  name: string
  color: string
}

export interface Category {
  id: number
  name: string
  color: string
}

export interface ICategoryFormValues {
  name: string
  color: string
}

export interface ICategoryRequest {
  name: string
  color: string
}
