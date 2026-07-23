import { convertStaffData } from '@/app/staff/_components/listData'

describe('staff listData', () => {
  test('convertStaffDataがAPIレスポンスを画面表示用データへ変換するべき', () => {
    /**
     * シナリオ:
     * - 入力: 支店名とロールを含む職員APIレスポンス。
     * - 処理: convertStaffData を呼び出す。
     * - 期待値: 画面で扱う camelCase の職員データへ変換されること。
     */
    expect(
      convertStaffData([
        {
          id: 5,
          name: '山田 太郎',
          branch: 2,
          branch_name: '児童書分館',
          role: 'manager',
        },
      ]),
    ).toEqual([
      {
        id: 5,
        name: '山田 太郎',
        branchId: 2,
        branchName: '児童書分館',
        role: 'manager',
      },
    ])
  })

  test('convertStaffDataが支店名なしの職員にフォールバック名を補うべき', () => {
    /**
     * シナリオ:
     * - 入力: branch_name がない職員APIレスポンス。
     * - 処理: convertStaffData を呼び出す。
     * - 期待値: 支店IDまたは未所属の表示名が補われること。
     */
    expect(
      convertStaffData([
        {
          id: 6,
          name: '管理者',
          branch: null,
          role: 'admin',
        },
      ]),
    ).toEqual([
      {
        id: 6,
        name: '管理者',
        branchId: null,
        branchName: '未所属',
        role: 'admin',
      },
    ])
  })
})
