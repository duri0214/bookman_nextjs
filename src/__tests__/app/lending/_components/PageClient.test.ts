import {
  filterActiveLendings,
  filterBranchBookStocks,
  getBranchOptions,
  getMunicipalityOptions,
  LendingFilters,
} from '@/app/lending/_components/lendingFilters'
import { BranchBookStock, Lending } from '@/resource/lending'

const branchBookStocks: BranchBookStock[] = [
  {
    id: 10,
    branchId: 1,
    municipalityId: 1,
    municipalityName: '渋谷区',
    bookId: 100,
    branchName: '中央図書館',
    bookName: 'Bookman 入門',
    amount: 3,
    availableAmount: 2,
  },
  {
    id: 11,
    branchId: 2,
    municipalityId: 1,
    municipalityName: '渋谷区',
    bookId: 101,
    branchName: '東図書館',
    bookName: '店舗運営ハンドブック',
    amount: 2,
    availableAmount: 1,
  },
  {
    id: 12,
    branchId: 3,
    municipalityId: 2,
    municipalityName: '豊島区',
    bookId: 102,
    branchName: '西図書館',
    bookName: '予約管理ガイド',
    amount: 1,
    availableAmount: 1,
  },
]

const lendings: Lending[] = [
  {
    id: 20,
    branchBookStockId: 10,
    customerId: 1,
    contactStaffId: 1,
    returnDate: '2026-01-30',
    active: true,
    bookName: 'Bookman 入門',
    branchName: '中央図書館',
    customerName: '山田 太郎',
    contactStaffName: '田中 職員',
    lendingDate: '2026-01-20',
    returnedAt: null,
    originalReturnDate: null,
    returnDateAdjusted: false,
    returnDateAdjustmentReason: '',
  },
  {
    id: 21,
    branchBookStockId: 11,
    customerId: 2,
    contactStaffId: 1,
    returnDate: '2026-01-31',
    active: true,
    bookName: '店舗運営ハンドブック',
    branchName: '東図書館',
    customerName: '佐藤 花子',
    contactStaffName: '田中 職員',
    lendingDate: '2026-01-21',
    returnedAt: null,
    originalReturnDate: null,
    returnDateAdjusted: false,
    returnDateAdjustmentReason: '',
  },
  {
    id: 22,
    branchBookStockId: 12,
    customerId: 3,
    contactStaffId: 2,
    returnDate: '2026-02-01',
    active: true,
    bookName: '予約管理ガイド',
    branchName: '西図書館',
    customerName: '鈴木 一郎',
    contactStaffName: '高橋 職員',
    lendingDate: '2026-01-22',
    returnedAt: null,
    originalReturnDate: null,
    returnDateAdjusted: false,
    returnDateAdjustmentReason: '',
  },
]

describe('lending PageClient filters', () => {
  const baseFilters: LendingFilters = {
    municipalityId: '',
    branchId: '',
    dueWithinDays: '',
  }

  test('getMunicipalityOptionsが支店別所蔵から自治体選択肢を重複なく作るべき', () => {
    /**
     * シナリオ:
     * - 入力: 同じ自治体に複数支店を含む支店別所蔵データ。
     * - 処理: 自治体選択肢を作成する。
     * - 期待値: 自治体ID単位で重複しない選択肢が返ること。
     */
    expect(getMunicipalityOptions(branchBookStocks)).toEqual([
      ['1', '渋谷区'],
      ['2', '豊島区'],
    ])
  })

  test('自治体選択時は支店未選択でも自治体配下の全支店を対象にするべき', () => {
    /**
     * シナリオ:
     * - 入力: 自治体IDだけを指定し、支店IDは空のフィルター。
     * - 処理: 支店別所蔵候補と貸出中一覧を絞り込む。
     * - 期待値: 選択中自治体に属する全支店のデータだけが返ること。
     */
    const filters = { ...baseFilters, municipalityId: '1' }

    expect(getBranchOptions(branchBookStocks, filters.municipalityId)).toEqual([
      [1, '中央図書館'],
      [2, '東図書館'],
    ])
    expect(filterBranchBookStocks(branchBookStocks, filters).map((stock) => stock.id)).toEqual([
      10, 11,
    ])
    expect(
      filterActiveLendings(lendings, branchBookStocks, filters).map((lending) => lending.id),
    ).toEqual([20, 21])
  })

  test('支店選択時は選択中自治体と支店の両方で絞り込むべき', () => {
    /**
     * シナリオ:
     * - 入力: 自治体IDと支店IDを指定したフィルター。
     * - 処理: 支店別所蔵候補と貸出中一覧を絞り込む。
     * - 期待値: 選択中支店に紐づくデータだけが返ること。
     */
    const filters = { ...baseFilters, municipalityId: '1', branchId: '2' }

    expect(filterBranchBookStocks(branchBookStocks, filters).map((stock) => stock.id)).toEqual([11])
    expect(
      filterActiveLendings(lendings, branchBookStocks, filters).map((lending) => lending.id),
    ).toEqual([21])
  })
})
