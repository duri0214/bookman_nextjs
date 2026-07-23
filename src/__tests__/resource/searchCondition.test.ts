import {
  convertSearchCondition,
  convertSearchConditionPermission,
} from '@/resource/searchCondition'

describe('searchCondition resource', () => {
  test('convertSearchConditionが保存条件APIレスポンスを画面表示用データへ変換するべき', () => {
    /**
     * シナリオ:
     * - 入力: 保存条件名、共有範囲、操作可否を含むAPIレスポンス。
     * - 処理: convertSearchCondition を呼び出す。
     * - 期待値: 画面で扱う camelCase の保存条件データへ変換されること。
     */
    expect(
      convertSearchCondition({
        id: 1,
        target_screen: 'lendings',
        name: '返却期限間近',
        conditions: { dueWithinDays: '3' },
        created_by: 10,
        created_by_name: '田中 職員',
        branch: 2,
        branch_name: '中央図書館',
        share_scope: 'branch',
        owner_type: 'staff',
        can_update: true,
        can_delete: false,
      }),
    ).toEqual({
      id: 1,
      targetScreen: 'lendings',
      name: '返却期限間近',
      conditions: { dueWithinDays: '3' },
      createdBy: 10,
      createdByName: '田中 職員',
      branchId: 2,
      branchName: '中央図書館',
      shareScope: 'branch',
      ownerType: 'staff',
      canUpdate: true,
      canDelete: false,
    })
  })

  test('convertSearchConditionPermissionがdisabled表示に使う権限情報へ変換するべき', () => {
    /**
     * シナリオ:
     * - 入力: counter 職員向けの権限コンテキストAPIレスポンス。
     * - 処理: convertSearchConditionPermission を呼び出す。
     * - 期待値: disabled 理由と作成可否を画面用の名前で参照できること。
     */
    expect(
      convertSearchConditionPermission({
        staff: 10,
        role: 'counter',
        branch: { id: 2, name: '中央図書館' },
        can_create_personal: true,
        can_create_branch: false,
        can_create_admin: false,
        record_scope: 'own_branch',
        disabled_reason: '支店共有と管理者共有の作成には manager または admin 権限が必要です。',
      }),
    ).toEqual({
      staffId: 10,
      role: 'counter',
      branch: { id: 2, name: '中央図書館' },
      canCreatePersonal: true,
      canCreateBranch: false,
      canCreateAdmin: false,
      recordScope: 'own_branch',
      disabledReason: '支店共有と管理者共有の作成には manager または admin 権限が必要です。',
    })
  })
})
