import { getBookmanApiUrl } from '@/helpers/apiClient'

interface BranchBookStockResponse {
  id: number
  branch: number
  book: number
  amount: number
}

interface TransferRequest {
  book?: number
  fromBranch?: number
  toBranch?: number
  amount?: number
}

const parseResponseBody = async (response: Response) => {
  const responseText = await response.text()
  if (!responseText) {
    return null
  }

  try {
    return JSON.parse(responseText)
  } catch {
    return { message: responseText }
  }
}

const getStockDetailUrl = (stockId: number): string =>
  `${getBookmanApiUrl('branchBookStocks')}${stockId}/`

const isPositiveInteger = (value: unknown): value is number =>
  Number.isInteger(value) && Number(value) > 0

const patchStockAmount = async (stockId: number, amount: number): Promise<Response> =>
  fetch(getStockDetailUrl(stockId), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ amount }),
    cache: 'no-store',
  })

const createStock = async (book: number, branch: number, amount: number): Promise<Response> =>
  fetch(getBookmanApiUrl('branchBookStocks'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ book, branch, amount }),
    cache: 'no-store',
  })

export async function POST(request: Request) {
  try {
    const requestBody = (await request.json()) as TransferRequest
    const { book, fromBranch, toBranch, amount } = requestBody

    if (
      !isPositiveInteger(book) ||
      !isPositiveInteger(fromBranch) ||
      !isPositiveInteger(toBranch) ||
      !isPositiveInteger(amount)
    ) {
      return Response.json(
        { message: '移動元、移動先、冊数を正しく入力してください。' },
        { status: 400 },
      )
    }

    if (fromBranch === toBranch) {
      return Response.json(
        { message: '移動元支店と移動先支店は別の支店を選択してください。' },
        { status: 400 },
      )
    }

    const stocksResponse = await fetch(getBookmanApiUrl('branchBookStocks'), {
      method: 'GET',
      cache: 'no-store',
    })

    if (!stocksResponse.ok) {
      return Response.json(
        { message: '支店別所蔵数の取得に失敗しました。' },
        { status: stocksResponse.status },
      )
    }

    const stocks = (await stocksResponse.json()) as BranchBookStockResponse[]
    const sourceStock = stocks.find((stock) => stock.book === book && stock.branch === fromBranch)
    const targetStock = stocks.find((stock) => stock.book === book && stock.branch === toBranch)

    if (!sourceStock || sourceStock.amount < amount) {
      return Response.json({ message: '移動元支店の所蔵数が不足しています。' }, { status: 400 })
    }

    const sourceResponse = await patchStockAmount(sourceStock.id, sourceStock.amount - amount)
    if (!sourceResponse.ok) {
      return Response.json(await parseResponseBody(sourceResponse), {
        status: sourceResponse.status,
      })
    }

    const targetResponse = targetStock
      ? await patchStockAmount(targetStock.id, targetStock.amount + amount)
      : await createStock(book, toBranch, amount)

    return Response.json(await parseResponseBody(targetResponse), {
      status: targetResponse.status,
    })
  } catch {
    return Response.json({ message: '支店間の書籍移動に失敗しました。' }, { status: 500 })
  }
}
