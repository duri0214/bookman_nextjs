import { getBookmanApiUrl } from '@/helpers/apiClient'
import { Author, IAuthorRaw } from '@/resource/author'

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true'

const MOCK_AUTHORS: IAuthorRaw[] = [
  {
    id: 1,
    name: 'Bookman Team',
  },
  {
    id: 2,
    name: 'YOSHITAKA OKADA',
  },
]

interface AuthorListData {
  authors: Author[]
  errorMessage: string | null
  isMockData: boolean
}

export const convertAuthorData = (data: IAuthorRaw[]): Author[] =>
  data.map((author) => ({
    id: author.id,
    name: author.name,
  }))

const loadBookmanData = async <T>(apiUrl: string): Promise<T> => {
  const response = await fetch(apiUrl, { method: 'GET', cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`)
  }
  return response.json()
}

export const getAuthorListData = async (): Promise<AuthorListData> => {
  try {
    const authors = await loadBookmanData<IAuthorRaw[]>(getBookmanApiUrl('authors'))

    return {
      authors: convertAuthorData(authors),
      errorMessage: null,
      isMockData: false,
    }
  } catch (e) {
    console.error('著者データの取得に失敗しました: ', e)

    if (USE_MOCK_DATA) {
      return {
        authors: convertAuthorData(MOCK_AUTHORS),
        errorMessage: null,
        isMockData: true,
      }
    }

    return {
      authors: [],
      errorMessage:
        '著者データの取得に失敗しました。バックエンドを起動してから再読み込みしてください。',
      isMockData: false,
    }
  }
}
