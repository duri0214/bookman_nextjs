import { convertReservationData } from '@/app/reservation/_components/listData'

describe('reservation listData', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-22T00:00:00.000Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('convertReservationDataが取り置き中予約をTODO対象として変換するべき', () => {
    /**
     * シナリオ:
     * - 入力: 取り置き中で期限内の予約APIレスポンス。
     * - 処理: convertReservationData を呼び出す。
     * - 期待値: 状態ラベルと後続対応フラグを持つ画面表示用データへ変換されること。
     */
    expect(
      convertReservationData([
        {
          id: 7,
          branch_book_stock: 10,
          book_name: 'Bookman 入門',
          branch_name: '中央図書館',
          customer: 20,
          customer_name: '山田 太郎',
          status: 'held',
          hold_expires_on: '2026-01-25',
          created_at: '2026-01-20T09:00:00+09:00',
        },
      ]),
    ).toEqual([
      {
        id: 7,
        branchBookStockId: 10,
        bookName: 'Bookman 入門',
        branchName: '中央図書館',
        customerId: 20,
        customerName: '山田 太郎',
        status: 'held',
        statusLabel: '取り置き中',
        holdExpiresOn: '2026-01-25',
        createdAt: '2026-01-20T09:00:00+09:00',
        needsStaffFollowUp: true,
        isExpiredHold: false,
      },
    ])
  })

  test('convertReservationDataが期限切れの取り置きを利用者向け注意対象として変換するべき', () => {
    /**
     * シナリオ:
     * - 入力: 取り置き中だが期限日が今日より前の予約APIレスポンス。
     * - 処理: convertReservationData を呼び出す。
     * - 期待値: 期限切れ表示用フラグが true になること。
     */
    const [reservation] = convertReservationData([
      {
        id: 8,
        branch_book_stock: 10,
        customer: 20,
        status: 'held',
        hold_expires_on: '2026-01-21',
        created_at: '2026-01-20T09:00:00+09:00',
      },
    ])

    expect(reservation.isExpiredHold).toBe(true)
    expect(reservation.bookName).toBe('支店別所蔵 #10')
    expect(reservation.customerName).toBe('利用者 #20')
  })
})
