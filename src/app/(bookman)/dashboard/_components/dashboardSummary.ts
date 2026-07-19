import { Book, BookBranchStock } from '@/resource/book'

export interface BranchStockSummary {
  branchName: string
  totalAmount: number
  bookCount: number
}

export interface DashboardMetric {
  label: string
  value: string
  helperText: string
  status: 'connected' | 'planned'
}

export interface DashboardAction {
  label: string
  href?: string
  helperText: string
  status: 'available' | 'planned'
}

export interface DashboardSummary {
  totalBooks: number
  totalStocks: number
  stockedBranchCount: number
  branchStocks: BranchStockSummary[]
  metrics: DashboardMetric[]
  actions: DashboardAction[]
}

const stockedOnly = (branchStock: BookBranchStock) => branchStock.amount > 0

export const buildDashboardSummary = (books: Book[]): DashboardSummary => {
  const branchStockMap = new Map<string, BranchStockSummary>()
  const totalStocks = books.reduce((sum, book) => sum + book.totalAmount, 0)

  books.forEach((book) => {
    book.branchStocks.filter(stockedOnly).forEach((branchStock) => {
      const current = branchStockMap.get(branchStock.branchName) ?? {
        branchName: branchStock.branchName,
        totalAmount: 0,
        bookCount: 0,
      }

      branchStockMap.set(branchStock.branchName, {
        ...current,
        totalAmount: current.totalAmount + branchStock.amount,
        bookCount: current.bookCount + 1,
      })
    })
  })

  const branchStocks = Array.from(branchStockMap.values()).sort(
    (a, b) => b.totalAmount - a.totalAmount || a.branchName.localeCompare(b.branchName),
  )

  return {
    totalBooks: books.length,
    totalStocks,
    stockedBranchCount: branchStocks.length,
    branchStocks,
    metrics: [
      {
        label: '書籍タイトル',
        value: `${books.length.toLocaleString()} 件`,
        helperText: '書籍 API から取得した登録タイトル数',
        status: 'connected',
      },
      {
        label: '自治体全体の所蔵',
        value: `${totalStocks.toLocaleString()} 冊`,
        helperText: '支店別所蔵数の合計を表示',
        status: 'connected',
      },
      {
        label: '貸出中',
        value: '未接続',
        helperText: '貸出 API 実装後に連携予定',
        status: 'planned',
      },
      {
        label: '予約・期限注意',
        value: '未接続',
        helperText: '予約、返却期限、表彰候補は後続で集計予定',
        status: 'planned',
      },
    ],
    actions: [
      {
        label: '支店別所蔵数と支店間移動を見る',
        href: '/book',
        helperText: '書籍管理画面で支店別所蔵と支店間移動を確認',
        status: 'available',
      },
      {
        label: '図書館を管理する',
        href: '/branch',
        helperText: '支店の基本情報を登録・更新',
        status: 'available',
      },
      {
        label: '貸出・予約を見る',
        helperText: '貸出、予約、表彰候補ランキングは未実装',
        status: 'planned',
      },
    ],
  }
}
