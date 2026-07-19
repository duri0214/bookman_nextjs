import { buildDashboardSummary } from '@/app/dashboard/_components/dashboardSummary'
import { Book } from '@/resource/book'

const books: Book[] = [
  {
    id: 1,
    category: { id: 1, name: '文学', color: '#3f6a8e' },
    name: '銀河鉄道の夜',
    authors: '宮沢賢治',
    leadText: '支店別所蔵集計のテスト用データです。',
    totalAmount: 5,
    branchStocks: [
      { id: 1, branchId: 1, branchName: '中央図書館', amount: 3 },
      { id: 2, branchId: 2, branchName: '東分館', amount: 2 },
    ],
    publicationDate: '2026-01-01',
  },
  {
    id: 2,
    category: { id: 2, name: '実用', color: '#264841' },
    name: '図書館運営メモ',
    authors: 'Bookman Team',
    leadText: '0冊支店を除外するためのテスト用データです。',
    totalAmount: 1,
    branchStocks: [
      { id: 3, branchId: 1, branchName: '中央図書館', amount: 1 },
      { id: 4, branchId: 3, branchName: '休館中分館', amount: 0 },
    ],
    publicationDate: '2026-01-02',
  },
]

describe('buildDashboardSummary', () => {
  test('支店別所蔵数を自治体全体の集計としてまとめるべき', () => {
    /**
     * シナリオ:
     * - 入力: 複数書籍にまたがる支店別所蔵データ。
     * - 処理: dashboard summary を構築する。
     * - 期待値: Book.amount ではなく totalAmount と branchStocks から全体と支店別の所蔵数が集計されること。
     */
    const summary = buildDashboardSummary(books)

    expect(summary.totalBooks).toBe(2)
    expect(summary.totalStocks).toBe(6)
    expect(summary.stockedBranchCount).toBe(2)
    expect(summary.branchStocks).toEqual([
      { branchName: '中央図書館', totalAmount: 4, bookCount: 2 },
      { branchName: '東分館', totalAmount: 2, bookCount: 1 },
    ])
  })

  test('未実装指標と利用可能な導線を分けて返すべき', () => {
    /**
     * シナリオ:
     * - 入力: 書籍データが存在する dashboard summary。
     * - 処理: metrics と actions を参照する。
     * - 期待値: 接続済みの書籍指標、書籍管理/館管理へのリンク、未接続業務の準備中状態が分かること。
     */
    const summary = buildDashboardSummary(books)

    expect(summary.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: '自治体全体の所蔵', value: '6 冊', status: 'connected' }),
        expect.objectContaining({ label: '貸出中', value: '未接続', status: 'planned' }),
      ]),
    )
    expect(summary.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: '/book', status: 'available' }),
        expect.objectContaining({ href: '/branch', status: 'available' }),
        expect.objectContaining({ label: '貸出・予約を見る', status: 'planned' }),
      ]),
    )
  })
})
