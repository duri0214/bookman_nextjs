import { BranchBookStock, Lending } from '@/resource/lending'

export interface LendingFilters {
  [key: string]: unknown
  municipalityId: string
  branchId: string
  dueWithinDays: string
}

const isDueWithinDays = (returnDate: string, daysText: string): boolean => {
  if (!daysText) {
    return true
  }

  const days = Number(daysText)
  if (!Number.isInteger(days) || days < 0) {
    return true
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(returnDate)
  target.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((target.getTime() - today.getTime()) / 86400000)

  return diffDays >= 0 && diffDays <= days
}

export const getMunicipalityOptions = (branchBookStocks: BranchBookStock[]): [string, string][] =>
  Array.from(
    new Map(
      branchBookStocks
        .filter((stock) => stock.municipalityId !== null)
        .map((stock) => [String(stock.municipalityId), stock.municipalityName]),
    ),
  )

export const getBranchOptions = (
  branchBookStocks: BranchBookStock[],
  municipalityId: string,
): [number, string][] =>
  Array.from(
    new Map(
      branchBookStocks
        .filter(
          (stock) => municipalityId === '' || String(stock.municipalityId ?? '') === municipalityId,
        )
        .map((stock) => [stock.branchId, stock.branchName]),
    ),
  )

export const filterBranchBookStocks = (
  branchBookStocks: BranchBookStock[],
  filters: Pick<LendingFilters, 'municipalityId' | 'branchId'>,
): BranchBookStock[] =>
  branchBookStocks.filter(
    (stock) =>
      (filters.municipalityId === '' ||
        String(stock.municipalityId ?? '') === filters.municipalityId) &&
      (filters.branchId === '' || String(stock.branchId) === filters.branchId),
  )

export const filterActiveLendings = (
  lendings: Lending[],
  branchBookStocks: BranchBookStock[],
  filters: LendingFilters,
): Lending[] =>
  lendings.filter((lending) => {
    const stock = branchBookStocks.find((stock) => stock.id === lending.branchBookStockId)
    if (!stock) {
      return false
    }

    return (
      lending.active &&
      (filters.municipalityId === '' ||
        String(stock.municipalityId ?? '') === filters.municipalityId) &&
      (filters.branchId === '' || String(stock.branchId) === filters.branchId) &&
      isDueWithinDays(lending.returnDate, filters.dueWithinDays)
    )
  })
