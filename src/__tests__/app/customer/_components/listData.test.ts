import { convertCustomerData } from '@/app/customer/_components/listData'

describe('customer listData', () => {
  test('convertCustomerDataがAPIレスポンスを画面表示用データへ変換するべき', () => {
    /**
     * シナリオ:
     * - 入力: max_lending_count を含むバックエンドの利用者データ。
     * - 処理: convertCustomerData を呼び出す。
     * - 期待値: maxLendingCount を持つフロントエンド用データへ変換されること。
     */
    expect(
      convertCustomerData([
        {
          id: 1,
          name: '山田 太郎',
          phone: '03-0000-0001',
          max_lending_count: 5,
        },
      ]),
    ).toEqual([
      {
        id: 1,
        name: '山田 太郎',
        phone: '03-0000-0001',
        maxLendingCount: 5,
      },
    ])
  })
})
