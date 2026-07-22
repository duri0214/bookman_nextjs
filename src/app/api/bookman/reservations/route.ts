import { getBookmanApiUrl } from '@/helpers/apiClient'

interface ReservationRequest {
  branch_book_stock?: number
  customer?: number
}

interface BranchBookStockResponse {
  id: number
  book: number
}

interface LendingResponse {
  branch_book_stock: number
  customer: number
  active: boolean
}

const parseResponseBody = (responseText: string) => {
  if (!responseText) {
    return null
  }

  try {
    return JSON.parse(responseText)
  } catch {
    return { message: responseText }
  }
}

export async function POST(request: Request) {
  try {
    const requestBody = (await request.json()) as ReservationRequest
    const [stocksResponse, lendingsResponse] = await Promise.all([
      fetch(getBookmanApiUrl('branchBookStocks'), { method: 'GET', cache: 'no-store' }),
      fetch(getBookmanApiUrl('lendings'), { method: 'GET', cache: 'no-store' }),
    ])

    if (stocksResponse.ok && lendingsResponse.ok) {
      const stocks = (await stocksResponse.json()) as BranchBookStockResponse[]
      const lendings = (await lendingsResponse.json()) as LendingResponse[]
      const selectedStock = stocks.find((stock) => stock.id === requestBody.branch_book_stock)
      const isCustomerLendingSameBook =
        selectedStock !== undefined &&
        lendings
          .filter((lending) => lending.active && lending.customer === requestBody.customer)
          .some((lending) => {
            const lendingStock = stocks.find((stock) => stock.id === lending.branch_book_stock)
            return lendingStock?.book === selectedStock.book
          })

      if (isCustomerLendingSameBook) {
        return Response.json(
          {
            code: 'duplicate_book_reservation',
            message: '同じ本を貸出中の利用者は予約できません。',
          },
          { status: 400 },
        )
      }
    }

    const response = await fetch(getBookmanApiUrl('reservations'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    })

    const responseText = await response.text()
    const responseBody = parseResponseBody(responseText)

    return Response.json(responseBody, { status: response.status })
  } catch {
    return Response.json({ message: '予約登録に失敗しました。' }, { status: 500 })
  }
}
