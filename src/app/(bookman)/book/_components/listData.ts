import { Book, IBookRaw } from '@/resource/book'
import { Category, ICategoryRaw } from '@/resource/category'
import { Author, IAuthorRaw } from '@/resource/author'
import { Branch, IBranchRaw } from '@/resource/branch'
import { IMunicipalityRaw, Municipality } from '@/resource/municipality'
import { getBookmanApiUrl } from '@/helpers/apiClient'
import { ILibraryStaffRaw, LibraryStaff } from '@/resource/lending'
import { convertStaffData } from '@/app/lending/_components/listData'
import { convertMunicipalityData } from '@/app/municipality/_components/listData'

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true'

const MOCK_BOOKS: IBookRaw[] = [
  {
    id: 1,
    name: 'Bookman 入門',
    thumbnail: null,
    category: 1,
    authors: [1],
    lead_text: '開発用モックデータです。',
    total_amount: 3,
    branch_stocks: [
      { id: 1, branch: 1, branch_name: '中央図書館', amount: 2 },
      { id: 2, branch: 2, branch_name: '西原図書館', amount: 1 },
    ],
    amount: 1,
    isbn: '9780000000001',
    publication_date: '2026-01-01',
  },
  {
    id: 2,
    name: '店舗運営ハンドブック',
    thumbnail: null,
    category: 2,
    authors: [2],
    lead_text: 'バックエンド未起動時の表示確認に使うデータです。',
    total_amount: 1,
    branch_stocks: [{ id: 3, branch: 1, branch_name: '中央図書館', amount: 1 }],
    amount: 1,
    isbn: '9780000000002',
    publication_date: '2026-01-02',
  },
]

const MOCK_CATEGORIES: ICategoryRaw[] = [
  { id: 1, name: '技術書', color: '#1976d2' },
  { id: 2, name: 'ビジネス', color: '#2e7d32' },
]

const MOCK_AUTHORS: IAuthorRaw[] = [
  { id: 1, name: 'Bookman Team' },
  { id: 2, name: 'YOSHITAKA OKADA' },
]

interface BookListData {
  books: Book[]
  authors: Author[]
  categories: Category[]
  branches: Branch[]
  municipalities: Municipality[]
  staffMembers: LibraryStaff[]
  errorMessage: string | null
  isMockData: boolean
}

const MOCK_STAFF: ILibraryStaffRaw[] = [
  { id: 1001, name: '図書館対応者', branch: 1, branch_name: '中央図書館', role: 'counter' },
]

const convertBranchData = (branches: IBranchRaw[]): Branch[] =>
  branches.map((branch) => ({
    id: branch.id,
    municipalityId: branch.municipality ?? null,
    municipalityName: branch.municipality_name ?? '未設定',
    name: branch.name,
    address: branch.address,
    phone: branch.phone,
    remark: branch.remark,
  }))

export const convertCategoryData = (data: ICategoryRaw[]): Category[] =>
  data.map((category) => ({
    id: category.id,
    name: category.name,
    color: category.color,
  }))

const convertBookData = (
  books: IBookRaw[],
  categories: Category[],
  authors: Author[],
  branches: Branch[],
): Book[] => {
  const categoriesById = new Map(categories.map((category) => [category.id, category]))
  const authorsById = new Map(authors.map((author) => [author.id, author]))
  const branchesById = new Map(branches.map((branch) => [branch.id, branch]))

  return books.map((result: IBookRaw) => ({
    id: result.id,
    category: categoriesById.get(result.category) ?? null,
    authorIds: result.authors,
    name: result.name,
    authors: result.authors
      .map((authorId) => authorsById.get(authorId)?.name ?? `#${authorId}`)
      .join(', '),
    leadText: result.lead_text,
    isbn: result.isbn,
    totalAmount: result.total_amount,
    branchStocks: result.branch_stocks.map((branchStock) => ({
      id: branchStock.id,
      branchId: branchStock.branch,
      branchName: branchStock.branch_name,
      municipalityId: branchesById.get(branchStock.branch)?.municipalityId ?? null,
      municipalityName: branchesById.get(branchStock.branch)?.municipalityName ?? '未設定',
      amount: branchStock.amount,
    })),
    publicationDate: result.publication_date,
  }))
}

const loadBookmanData = async <T>(apiUrl: string): Promise<T> => {
  const response = await fetch(apiUrl, { method: 'GET', cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`)
  }
  return response.json()
}

export const getBookListData = async (): Promise<BookListData> => {
  try {
    const [books, categories, authors, branches, municipalities, staffMembers] = await Promise.all([
      loadBookmanData<IBookRaw[]>(getBookmanApiUrl('books')),
      loadBookmanData<ICategoryRaw[]>(getBookmanApiUrl('categories')),
      loadBookmanData<IAuthorRaw[]>(getBookmanApiUrl('authors')),
      loadBookmanData<IBranchRaw[]>(getBookmanApiUrl('branches')),
      loadBookmanData<IMunicipalityRaw[]>(getBookmanApiUrl('municipalities')),
      loadBookmanData<ILibraryStaffRaw[]>(getBookmanApiUrl('staff')),
    ])
    const convertedBranches = convertBranchData(branches)
    const convertedCategories = convertCategoryData(categories)

    return {
      books: convertBookData(books, convertedCategories, authors, convertedBranches),
      authors,
      categories: convertedCategories,
      branches: convertedBranches,
      municipalities: convertMunicipalityData(municipalities),
      staffMembers: convertStaffData(staffMembers),
      errorMessage: null,
      isMockData: false,
    }
  } catch (e) {
    console.error('データの取得に失敗しました: ', e)

    if (USE_MOCK_DATA) {
      const mockBranches = convertBranchData([
        {
          id: 1,
          municipality: 1,
          municipality_name: '渋谷区',
          name: '中央図書館',
          address: '東京都渋谷区神宮前1-4-1',
          phone: '03-3403-2591',
          remark: '鉄筋コンクリート造 地下1階地上5階 4,450㎡（294席）',
        },
        {
          id: 2,
          municipality: 1,
          municipality_name: '渋谷区',
          name: '西原図書館',
          address: '東京都渋谷区西原2-28-9',
          phone: '03-3460-8535',
          remark: '鉄筋コンクリート造 地下1階地上3階の2・3階部分 631㎡（61席）',
        },
      ])

      return {
        books: convertBookData(
          MOCK_BOOKS,
          convertCategoryData(MOCK_CATEGORIES),
          MOCK_AUTHORS,
          mockBranches,
        ),
        authors: MOCK_AUTHORS,
        categories: convertCategoryData(MOCK_CATEGORIES),
        branches: mockBranches,
        municipalities: [{ id: 1, name: '渋谷区' }],
        staffMembers: convertStaffData(MOCK_STAFF),
        errorMessage: null,
        isMockData: true,
      }
    }

    return {
      books: [],
      authors: [],
      categories: [],
      branches: [],
      municipalities: [],
      staffMembers: [],
      errorMessage:
        '書籍データの取得に失敗しました。バックエンドを起動してから再読み込みしてください。',
      isMockData: false,
    }
  }
}
