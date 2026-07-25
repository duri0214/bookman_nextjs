import { convertMunicipalityData } from '@/app/municipality/_components/listData'

describe('municipality listData', () => {
  test('convertMunicipalityDataがAPIレスポンスを画面表示用データへ変換するべき', () => {
    /**
     * シナリオ:
     * - 入力: 自治体IDと自治体名を含むAPIレスポンス。
     * - 処理: convertMunicipalityData を呼び出す。
     * - 期待値: 画面で扱う camelCase の自治体データへ変換されること。
     */
    expect(
      convertMunicipalityData([
        {
          id: 2,
          name: '六戸町',
        },
      ]),
    ).toEqual([
      {
        id: 2,
        name: '六戸町',
      },
    ])
  })
})
