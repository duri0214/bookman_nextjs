import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { SearchConditionPanel } from '@/app/(bookman)/_components/SearchConditionPanel'
import { LibraryStaff } from '@/resource/lending'

const staffMembers: LibraryStaff[] = [
  { id: 1, name: '田中 職員', branchId: 1, branchName: '中央図書館', role: 'counter' },
]

describe('SearchConditionPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  test('保存条件を読み込んだ時に読み込み完了メッセージを表示するべき', async () => {
    /**
     * シナリオ:
     * - 入力: mock mode の書籍一覧保存条件パネル。
     * - 処理: 保存済み条件を選択し、読み込みボタンをクリックする。
     * - 期待値: onApply が呼ばれ、読み込み完了メッセージが表示されること。
     */
    const onApply = jest.fn()

    render(
      <SearchConditionPanel
        targetScreen='books'
        title='書籍一覧の保存条件'
        staffMembers={staffMembers}
        currentConditions={{ keyword: '', branchId: '', stockedOnly: false }}
        onApply={onApply}
        isMockData
      />,
    )

    fireEvent.mouseDown(screen.getByRole('combobox', { name: '保存済み条件' }))
    fireEvent.click(await screen.findByRole('option', { name: /モック: 中央図書館の所蔵本/ }))
    fireEvent.click(screen.getByRole('button', { name: '読み込み' }))

    expect(onApply).toHaveBeenCalledWith({ keyword: '吾輩', branchId: '1', stockedOnly: true })
    await waitFor(() => {
      expect(
        screen.getByText('保存条件「モック: 中央図書館の所蔵本」を読み込みました。'),
      ).toBeTruthy()
    })
  })
})
