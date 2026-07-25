import { getBookmanApiUrl } from '@/helpers/apiClient'
import { Category, ICategoryRaw } from '@/resource/category'

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true'

const MOCK_CATEGORIES: ICategoryRaw[] = [
  { id: 1, name: '技術書', color: '#1976d2' },
  { id: 2, name: 'ビジネス', color: '#2e7d32' },
]

interface CategoryListData {
  categories: Category[]
  errorMessage: string | null
  isMockData: boolean
}

export const convertCategoryData = (data: ICategoryRaw[]): Category[] =>
  data.map((category) => ({
    id: category.id,
    name: category.name,
    color: category.color,
  }))

const loadBookmanData = async <T>(apiUrl: string): Promise<T> => {
  const response = await fetch(apiUrl, { method: 'GET', cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`)
  }
  return response.json()
}

export const getCategoryListData = async (): Promise<CategoryListData> => {
  try {
    const categories = await loadBookmanData<ICategoryRaw[]>(getBookmanApiUrl('categories'))

    return {
      categories: convertCategoryData(categories),
      errorMessage: null,
      isMockData: false,
    }
  } catch (e) {
    console.error('カテゴリデータの取得に失敗しました: ', e)

    if (USE_MOCK_DATA) {
      return {
        categories: convertCategoryData(MOCK_CATEGORIES),
        errorMessage: null,
        isMockData: true,
      }
    }

    return {
      categories: [],
      errorMessage:
        'カテゴリデータの取得に失敗しました。バックエンドを起動してから再読み込みしてください。',
      isMockData: false,
    }
  }
}
