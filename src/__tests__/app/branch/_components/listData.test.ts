import {
  convertBranchClosedDayData,
  convertBranchSummaries,
} from '@/app/branch/_components/listData'

describe('branch listData', () => {
  test('convertBranchClosedDayDataがAPIレスポンスを画面表示用データへ変換するべき', () => {
    /**
     * シナリオ:
     * - 入力: 支店名と理由を含む休館日APIレスポンス。
     * - 処理: convertBranchClosedDayData を呼び出す。
     * - 期待値: 画面で扱う camelCase の休館日データへ変換されること。
     */
    expect(
      convertBranchClosedDayData([
        {
          id: 3,
          branch: 1,
          branch_name: '中央図書館',
          date: '2026-01-15',
          reason: '蔵書点検',
        },
      ]),
    ).toEqual([
      {
        id: 3,
        branchId: 1,
        branchName: '中央図書館',
        date: '2026-01-15',
        reason: '蔵書点検',
      },
    ])
  })

  test('convertBranchSummariesが支店別の取扱書籍数と総所蔵冊数を集計するべき', () => {
    /**
     * シナリオ:
     * - 入力: 同一支店に複数書籍の在庫を含む支店別所蔵APIレスポンス。
     * - 処理: convertBranchSummaries を呼び出す。
     * - 期待値: 支店ごとに重複しない書籍数と所蔵冊数合計が返されること。
     */
    expect(
      convertBranchSummaries([
        { id: 1, branch: 10, book: 100, amount: 2 },
        { id: 2, branch: 10, book: 101, amount: 3 },
        { id: 3, branch: 11, book: 100, amount: 1 },
      ]),
    ).toEqual([
      { branchId: 10, bookCount: 2, totalStockAmount: 5 },
      { branchId: 11, bookCount: 1, totalStockAmount: 1 },
    ])
  })
})
