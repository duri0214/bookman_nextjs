import { Customer, ICustomerRaw } from '@/resource/customer'
import { getBookmanApiUrl } from '@/helpers/apiClient'

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true'

const MOCK_CUSTOMERS: ICustomerRaw[] = [
  {
    id: 1,
    name: '山田 太郎',
    phone: '03-0000-0001',
    max_lending_count: 5,
  },
  {
    id: 2,
    name: '佐藤 花子',
    phone: '090-0000-0002',
    max_lending_count: 3,
  },
]

interface CustomerListData {
  customers: Customer[]
  errorMessage: string | null
  isMockData: boolean
}

export const convertCustomerData = (data: ICustomerRaw[]): Customer[] =>
  data.map((result) => ({
    id: result.id,
    name: result.name,
    phone: result.phone,
    maxLendingCount: result.max_lending_count,
  }))

export const loadCustomerList = async (apiUrl: string): Promise<ICustomerRaw[]> => {
  const response = await fetch(apiUrl, { method: 'GET', cache: 'no-store' })
  if (!response.ok) {
    throw new Error(`Failed to fetch data: ${response.statusText}`)
  }
  return response.json()
}

export const getCustomerListData = async (): Promise<CustomerListData> => {
  try {
    const responseData = await loadCustomerList(getBookmanApiUrl('customers'))
    return {
      customers: convertCustomerData(responseData),
      errorMessage: null,
      isMockData: false,
    }
  } catch (e) {
    console.error('データの取得に失敗しました: ', e)

    if (USE_MOCK_DATA) {
      return {
        customers: convertCustomerData(MOCK_CUSTOMERS),
        errorMessage: null,
        isMockData: true,
      }
    }

    return {
      customers: [],
      errorMessage:
        '利用者データの取得に失敗しました。バックエンドを起動してから再読み込みしてください。',
      isMockData: false,
    }
  }
}
