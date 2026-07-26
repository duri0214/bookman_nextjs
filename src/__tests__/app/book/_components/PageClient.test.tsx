import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { PageClient } from '@/app/book/_components/PageClient'
import { Author } from '@/resource/author'
import { Book } from '@/resource/book'
import { Branch } from '@/resource/branch'
import { Municipality } from '@/resource/municipality'
import { Category } from '@/resource/category'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}))

jest.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ rows }: { rows: { id: number; name: string }[] }) => (
    <div data-testid='book-grid'>
      {rows.map((row) => (
        <div key={row.id}>{row.name}</div>
      ))}
    </div>
  ),
}))

const municipalities: Municipality[] = [
  { id: 2, name: '豊島区' },
  { id: 1, name: '渋谷区' },
]

const branches: Branch[] = [
  {
    id: 1,
    municipalityId: 1,
    municipalityName: '渋谷区',
    name: '渋谷中央図書館',
    address: '',
    phone: '',
    remark: '',
  },
  {
    id: 2,
    municipalityId: 2,
    municipalityName: '豊島区',
    name: '豊島中央図書館',
    address: '',
    phone: '',
    remark: '',
  },
]

const authors: Author[] = [
  { id: 1, name: '夏目漱石' },
  { id: 2, name: '国松俊英' },
]

const categories: Category[] = [{ id: 1, name: '小説', color: '#ff0000' }]

const books: Book[] = [
  {
    id: 10,
    category: { id: 1, name: '小説', color: '#ff0000' },
    authorIds: [1],
    name: '吾輩は猫である',
    authors: '夏目漱石',
    leadText: '近代文学の代表作です。',
    isbn: '9784062938426',
    totalAmount: 5,
    publicationDate: '2026-01-01',
    branchStocks: [
      {
        id: 1,
        branchId: 1,
        branchName: '渋谷中央図書館',
        municipalityId: 1,
        municipalityName: '渋谷区',
        amount: 3,
      },
      {
        id: 2,
        branchId: 2,
        branchName: '豊島中央図書館',
        municipalityId: 2,
        municipalityName: '豊島区',
        amount: 2,
      },
    ],
  },
  {
    id: 11,
    category: { id: 1, name: '小説', color: '#ff0000' },
    authorIds: [2],
    name: '豊島区だけの本',
    authors: '国松俊英',
    leadText: '豊島区の支店だけが所蔵しています。',
    isbn: '9784000000000',
    totalAmount: 2,
    publicationDate: '2026-01-02',
    branchStocks: [
      {
        id: 3,
        branchId: 2,
        branchName: '豊島中央図書館',
        municipalityId: 2,
        municipalityName: '豊島区',
        amount: 2,
      },
    ],
  },
]

const renderPageClient = () =>
  render(
    <PageClient
      books={books}
      authors={authors}
      categories={categories}
      branches={branches}
      municipalities={municipalities}
      staffMembers={[]}
      errorMessage={null}
      isMockData={false}
    />,
  )

describe('Book PageClient', () => {
  test('自治体を選択した時に支店候補と書籍一覧を選択自治体配下の所蔵だけに絞るべき', async () => {
    /**
     * シナリオ:
     * - 入力: 渋谷区と豊島区、それぞれに紐づく支店を持つ書籍一覧画面。
     * - 処理: 自治体セレクトで渋谷区を選択し、支店フィルターを開く。
     * - 期待値: 支店フィルターと書籍一覧が渋谷区配下の所蔵だけに絞られ、豊島区だけの本は表示されないこと。
     */
    await act(async () => {
      renderPageClient()
      await Promise.resolve()
    })

    fireEvent.mouseDown(screen.getByRole('combobox', { name: '自治体' }))
    fireEvent.click(screen.getByRole('option', { name: '渋谷区' }))

    fireEvent.mouseDown(screen.getByRole('combobox', { name: '支店' }))
    const listbox = screen.getByRole('listbox')

    expect(within(listbox).getByRole('option', { name: '渋谷中央図書館' })).toBeTruthy()
    expect(within(listbox).queryByRole('option', { name: '豊島中央図書館' })).toBeNull()
    expect(screen.getByText('吾輩は猫である')).toBeTruthy()
    expect(screen.queryByText('豊島区だけの本')).toBeNull()
  })

  test('CSV登録導線が未実装として無効表示されるべき', async () => {
    /**
     * シナリオ:
     * - 入力: 書籍一覧画面。
     * - 処理: CSV登録ボタンをクリックする。
     * - 期待値: CSV登録ダイアログが開き、ファイル選択導線が表示されること。
     */
    await act(async () => {
      renderPageClient()
      await Promise.resolve()
    })

    fireEvent.click(screen.getByRole('button', { name: 'CSV登録' }))

    expect(screen.getByRole('dialog', { name: 'CSV登録' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'CSVファイル選択' })).toBeTruthy()
  })
})
