import { getBookmanApiUrl } from '@/helpers/apiClient'
import { IMunicipalityRaw, Municipality } from '@/resource/municipality'

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true'

const MOCK_MUNICIPALITIES: IMunicipalityRaw[] = [
  {
    id: 1,
    name: '渋谷区',
  },
]

interface MunicipalityListData {
  municipalities: Municipality[]
  errorMessage: string | null
  isMockData: boolean
}

export const convertMunicipalityData = (data: IMunicipalityRaw[]): Municipality[] =>
  data.map((municipality) => ({
    id: municipality.id,
    name: municipality.name,
  }))

const loadBookmanData = async <T>(apiUrl: string): Promise<T> => {
  const response = await fetch(apiUrl, { method: 'GET', cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`)
  }
  return response.json()
}

export const getMunicipalityListData = async (): Promise<MunicipalityListData> => {
  try {
    const municipalities = await loadBookmanData<IMunicipalityRaw[]>(
      getBookmanApiUrl('municipalities'),
    )

    return {
      municipalities: convertMunicipalityData(municipalities),
      errorMessage: null,
      isMockData: false,
    }
  } catch (e) {
    console.error('自治体データの取得に失敗しました: ', e)

    if (USE_MOCK_DATA) {
      return {
        municipalities: convertMunicipalityData(MOCK_MUNICIPALITIES),
        errorMessage: null,
        isMockData: true,
      }
    }

    return {
      municipalities: [],
      errorMessage:
        '自治体データの取得に失敗しました。バックエンドを起動してから再読み込みしてください。',
      isMockData: false,
    }
  }
}
