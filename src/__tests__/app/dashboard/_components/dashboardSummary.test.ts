import { buildDashboardSummary } from '@/app/dashboard/_components/dashboardSummary'
import { Book } from '@/resource/book'
import { Lending } from '@/resource/lending'
import { Municipality } from '@/resource/municipality'
import { Reservation } from '@/resource/reservation'

const books: Book[] = [
  {
    id: 1,
    category: { id: 1, name: '文学', color: '#3f6a8e' },
    authorIds: [1],
    name: '銀河鉄道の夜',
    authors: '宮沢賢治',
    leadText: '支店別所蔵集計のテスト用データです。',
    isbn: '9784062938426',
    totalAmount: 5,
    branchStocks: [
      {
        id: 1,
        branchId: 1,
        branchName: '中央図書館',
        municipalityId: 1,
        municipalityName: '渋谷区',
        amount: 3,
      },
      {
        id: 2,
        branchId: 2,
        branchName: '東分館',
        municipalityId: 1,
        municipalityName: '渋谷区',
        amount: 2,
      },
    ],
    publicationDate: '2026-01-01',
  },
  {
    id: 2,
    category: { id: 2, name: '実用', color: '#264841' },
    authorIds: [2],
    name: '図書館運営メモ',
    authors: 'Bookman Team',
    leadText: '0冊支店を除外するためのテスト用データです。',
    isbn: '9784000000000',
    totalAmount: 1,
    branchStocks: [
      {
        id: 3,
        branchId: 1,
        branchName: '中央図書館',
        municipalityId: 1,
        municipalityName: '渋谷区',
        amount: 1,
      },
      {
        id: 4,
        branchId: 3,
        branchName: '休館中分館',
        municipalityId: 1,
        municipalityName: '渋谷区',
        amount: 0,
      },
    ],
    publicationDate: '2026-01-02',
  },
]

const lendings: Lending[] = [
  {
    id: 1,
    branchBookStockId: 1,
    customerId: 1,
    contactStaffId: 1,
    returnDate: new Date().toISOString().slice(0, 10),
    active: true,
    bookName: '銀河鉄道の夜',
    branchName: '中央図書館',
    customerName: '山田 太郎',
    contactStaffName: '田中 職員',
    lendingDate: '2026-01-01',
    returnedAt: null,
    originalReturnDate: null,
    returnDateAdjusted: false,
    returnDateAdjustmentReason: '',
  },
]

const reservations: Reservation[] = [
  {
    id: 1,
    branchBookStockId: 1,
    bookName: '銀河鉄道の夜',
    branchName: '中央図書館',
    customerId: 2,
    customerName: '佐藤 花子',
    status: 'held',
    statusLabel: '取り置き中',
    holdExpiresOn: '2026-01-31',
    createdAt: '2026-01-01T00:00:00+09:00',
    needsStaffFollowUp: true,
    isExpiredHold: false,
  },
]

const municipalities: Municipality[] = [
  { id: 1, name: '渋谷区' },
  { id: 2, name: '目黒区' },
]

describe('buildDashboardSummary', () => {
  test('支店別所蔵数を自治体全体の集計としてまとめるべき', () => {
    /**
     * シナリオ:
     * - 入力: 複数書籍にまたがる支店別所蔵データ。
     * - 処理: dashboard summary を構築する。
     * - 期待値: Book.amount ではなく totalAmount と branchStocks から全体と支店別の所蔵数が集計されること。
     */
    const summary = buildDashboardSummary(books, lendings, reservations, municipalities, 1)

    expect(summary.totalBooks).toBe(2)
    expect(summary.totalStocks).toBe(6)
    expect(summary.stockedBranchCount).toBe(2)
    expect(summary.selectedMunicipalityId).toBe(1)
    expect(summary.branchStocks).toEqual([
      { branchName: '中央図書館', totalAmount: 4, bookCount: 2 },
      { branchName: '東分館', totalAmount: 2, bookCount: 1 },
    ])
  })

  test('未実装指標と利用可能な導線を分けて返すべき', () => {
    /**
     * シナリオ:
     * - 入力: 書籍、貸出、予約データが存在する dashboard summary。
     * - 処理: metrics と actions を参照する。
     * - 期待値: 接続済みの書籍/貸出/予約指標と、書籍管理/館管理/CSV登録へのリンクが分かること。
     */
    const summary = buildDashboardSummary(books, lendings, reservations, municipalities, 1)

    expect(summary.metrics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ label: '自治体全体の所蔵', value: '6 冊', status: 'connected' }),
        expect.objectContaining({ label: '貸出中', value: '1 件', status: 'connected' }),
        expect.objectContaining({ label: '予約・期限注意', value: '1 件 / 1 件' }),
      ]),
    )
    expect(summary.lendingAvailableNotificationCount).toBe(1)
    expect(summary.actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ href: '/book', status: 'available' }),
        expect.objectContaining({ href: '/branch', status: 'available' }),
        expect.objectContaining({ label: '貸出・予約を見る', href: '/lending' }),
        expect.objectContaining({
          label: 'CSV登録で書籍をまとめて追加する',
          href: '/book?csvImport=1',
        }),
      ]),
    )
  })

  test('選択した自治体の支店別所蔵だけを集計するべき', () => {
    /**
     * シナリオ:
     * - 入力: 渋谷区と目黒区の支店別所蔵データ。
     * - 処理: 目黒区を選択して dashboard summary を構築する。
     * - 期待値: 目黒区に所蔵がない場合、特定自治体のフォールバック表示を返さないこと。
     */
    const summary = buildDashboardSummary(books, lendings, reservations, municipalities, 2)

    expect(summary.selectedMunicipalityId).toBe(2)
    expect(summary.totalBooks).toBe(0)
    expect(summary.totalStocks).toBe(0)
    expect(summary.branchStocks).toEqual([])
  })
})
