import {
  convertBranchBookStockData,
  convertLendingData,
  convertStaffData,
} from '@/app/lending/_components/listData'

describe('lending listData', () => {
  test('convertBranchBookStockDataがAPIレスポンスを画面表示用データへ変換するべき', () => {
    /**
     * シナリオ:
     * - 入力: 書籍名、支店名、貸出可能冊数を含む支店別所蔵データ。
     * - 処理: convertBranchBookStockData を呼び出す。
     * - 期待値: 画面で扱う camelCase の支店別所蔵データへ変換されること。
     */
    expect(
      convertBranchBookStockData([
        {
          id: 10,
          branch: 1,
          book: 2,
          amount: 3,
          available_amount: 1,
          branch_name: '中央図書館',
          book_name: 'Bookman 入門',
        },
      ]),
    ).toEqual([
      {
        id: 10,
        branchId: 1,
        bookId: 2,
        branchName: '中央図書館',
        bookName: 'Bookman 入門',
        amount: 3,
        availableAmount: 1,
      },
    ])
  })

  test('convertStaffDataが職員APIレスポンスを画面表示用データへ変換するべき', () => {
    /**
     * シナリオ:
     * - 入力: 所属支店を持つ職員データ。
     * - 処理: convertStaffData を呼び出す。
     * - 期待値: branchId と branchName を持つ職員データへ変換されること。
     */
    expect(
      convertStaffData([{ id: 1, name: '田中 職員', branch: 2, branch_name: '東図書館' }]),
    ).toEqual([{ id: 1, name: '田中 職員', branchId: 2, branchName: '東図書館' }])
  })

  test('convertLendingDataが貸出一覧APIレスポンスを画面表示用データへ変換するべき', () => {
    /**
     * シナリオ:
     * - 入力: 本名、支店名、利用者名、対応職員名を含む貸出中データ。
     * - 処理: convertLendingData を呼び出す。
     * - 期待値: 貸出中一覧で表示する項目を持つデータへ変換されること。
     */
    expect(
      convertLendingData([
        {
          id: 5,
          branch_book_stock: 10,
          customer: 20,
          contact_staff: 30,
          return_date: '2026-01-30',
          active: true,
          book_name: 'Bookman 入門',
          branch_name: '中央図書館',
          customer_name: '山田 太郎',
          contact_staff_name: '田中 職員',
          lending_date: '2026-01-20',
          returned_at: null,
        },
      ]),
    ).toEqual([
      {
        id: 5,
        branchBookStockId: 10,
        customerId: 20,
        contactStaffId: 30,
        returnDate: '2026-01-30',
        active: true,
        bookName: 'Bookman 入門',
        branchName: '中央図書館',
        customerName: '山田 太郎',
        contactStaffName: '田中 職員',
        lendingDate: '2026-01-20',
        returnedAt: null,
      },
    ])
  })
})
