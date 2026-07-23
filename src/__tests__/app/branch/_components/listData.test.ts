import { convertBranchClosedDayData } from '@/app/branch/_components/listData'

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
})
