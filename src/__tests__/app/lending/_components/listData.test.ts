import {
  convertBranchBookStockData,
  convertHeldReservationData,
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
          municipality: 1,
          municipality_name: '渋谷区',
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
        municipalityId: 1,
        municipalityName: '渋谷区',
        bookId: 2,
        branchName: '中央図書館',
        bookName: 'Bookman 入門',
        amount: 3,
        availableAmount: 1,
      },
    ])
  })

  test('convertBranchBookStockDataが貸出可能冊数の欠落を所蔵数で補完しないべき', () => {
    /**
     * シナリオ:
     * - 入力: available_amount を含まない支店別所蔵APIレスポンス。
     * - 処理: convertBranchBookStockData を呼び出す。
     * - 期待値: amount で補完せず、API契約違反として例外を投げること。
     */
    const responseWithoutAvailableAmount = {
      id: 10,
      branch: 1,
      book: 2,
      amount: 3,
      branch_name: '中央図書館',
      book_name: 'Bookman 入門',
    } as Parameters<typeof convertBranchBookStockData>[0][number]

    expect(() => convertBranchBookStockData([responseWithoutAvailableAmount])).toThrow(
      '支店別所蔵APIの available_amount が不足しています。',
    )
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
    ).toEqual([{ id: 1, name: '田中 職員', branchId: 2, branchName: '東図書館', role: '' }])
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
        originalReturnDate: null,
        returnDateAdjusted: false,
        returnDateAdjustmentReason: '',
      },
    ])
  })

  test('convertHeldReservationDataが取り置き中予約だけを貸出画面用データへ変換するべき', () => {
    /**
     * シナリオ:
     * - 入力: 取り置き中と取消済みを含む予約APIレスポンス。
     * - 処理: convertHeldReservationData を呼び出す。
     * - 期待値: 取り置き中だけが貸出可能冊数の補足表示用データへ変換されること。
     */
    expect(
      convertHeldReservationData([
        {
          id: 8,
          branch_book_stock: 10,
          book_name: 'Bookman 入門',
          branch_name: '中央図書館',
          customer: 20,
          customer_name: '佐藤 花子',
          status: 'held',
          hold_expires_on: '2026-01-27',
          created_at: '2026-01-20T09:00:00+09:00',
        },
        {
          id: 9,
          branch_book_stock: 10,
          customer: 21,
          status: 'canceled',
          hold_expires_on: null,
          created_at: '2026-01-20T09:00:00+09:00',
        },
      ]),
    ).toEqual([
      {
        id: 8,
        branchBookStockId: 10,
        bookName: 'Bookman 入門',
        branchName: '中央図書館',
        customerId: 20,
        customerName: '佐藤 花子',
        status: 'held',
        statusLabel: '取り置き中',
        holdExpiresOn: '2026-01-27',
        createdAt: '2026-01-20T09:00:00+09:00',
        needsStaffFollowUp: true,
        isExpiredHold: false,
      },
    ])
  })
})
