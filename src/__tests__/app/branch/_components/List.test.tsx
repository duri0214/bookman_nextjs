import { render, screen } from '@testing-library/react'
import { List } from '@/app/branch/_components/List'
import { Branch, BranchSummary } from '@/resource/branch'

jest.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ columns }: { columns: { field: string; headerName?: string }[] }) => (
    <div data-testid='branch-grid'>
      {columns.map((column) => (
        <span key={column.field} data-testid='branch-grid-header'>
          {column.headerName}
        </span>
      ))}
    </div>
  ),
}))

const branches: Branch[] = [
  {
    id: 1,
    municipalityId: 1,
    municipalityName: '渋谷区',
    name: '渋谷中央図書館',
    address: '東京都渋谷区',
    phone: '03-0000-0000',
    remark: '',
  },
]

const branchSummaries: BranchSummary[] = [{ branchId: 1, bookCount: 3, totalStockAmount: 5 }]

describe('Branch List', () => {
  test('編集列と削除列を名前列の直後に表示するべき', () => {
    /**
     * シナリオ:
     * - 入力: 支店一覧の表示に必要な支店データと集計データ。
     * - 処理: 支店一覧コンポーネントを表示する。
     * - 期待値: 書籍管理と同じ操作列設計として、編集列と削除列が名前列の直後に配置されること。
     */
    render(
      <List
        branches={branches}
        branchSummaries={branchSummaries}
        onEdit={jest.fn()}
        onDelete={jest.fn()}
        deletingBranchId={null}
      />,
    )

    const headers = screen.getAllByTestId('branch-grid-header').map((header) => header.textContent)

    expect(headers).toEqual([
      '#',
      '自治体',
      '名前',
      '編集',
      '削除',
      '住所',
      '問い合わせ先',
      '取扱書籍数',
      '総所蔵冊数',
      '備考',
    ])
  })
})
