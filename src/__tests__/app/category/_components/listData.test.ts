import { convertCategoryData } from '@/app/category/_components/listData'

describe('category listData', () => {
  test('convertCategoryDataがAPIレスポンスを画面表示用データへ変換するべき', () => {
    /**
     * シナリオ:
     * - 入力: カテゴリID、カテゴリ名、表示色を含むAPIレスポンス。
     * - 処理: convertCategoryData を呼び出す。
     * - 期待値: 画面で扱うカテゴリデータへ変換されること。
     */
    expect(
      convertCategoryData([
        {
          id: 2,
          name: '児童書',
          color: '#ffcc00',
        },
      ]),
    ).toEqual([
      {
        id: 2,
        name: '児童書',
        color: '#ffcc00',
      },
    ])
  })
})
