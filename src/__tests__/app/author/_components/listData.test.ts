import { convertAuthorData } from '@/app/author/_components/listData'

describe('author listData', () => {
  test('convertAuthorDataがAPIレスポンスを画面表示用データへ変換するべき', () => {
    /**
     * シナリオ:
     * - 入力: 著者IDと著者名を含むAPIレスポンス。
     * - 処理: convertAuthorData を呼び出す。
     * - 期待値: 画面で扱う camelCase の著者データへ変換されること。
     */
    expect(
      convertAuthorData([
        {
          id: 2,
          name: '夏目漱石',
        },
      ]),
    ).toEqual([
      {
        id: 2,
        name: '夏目漱石',
      },
    ])
  })
})
