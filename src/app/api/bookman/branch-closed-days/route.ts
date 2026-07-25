import { getBookmanApiUrl } from '@/helpers/apiClient'
import type { IBranchClosedDayRequest } from '@/resource/branch'

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

const getScopedApiUrl = (municipality: number): string => {
  const apiUrl = new URL(getBookmanApiUrl('branchClosedDays'))
  apiUrl.searchParams.set('municipality', municipality.toString())
  return apiUrl.toString()
}

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const branchId = requestUrl.searchParams.get('branch')
    const apiUrl = new URL(getBookmanApiUrl('branchClosedDays'))
    if (branchId) {
      apiUrl.searchParams.set('branch', branchId)
    }

    const response = await fetch(apiUrl.toString(), { method: 'GET', cache: 'no-store' })
    const responseText = await response.text()
    const responseBody = parseResponseBody(responseText)

    return Response.json(responseBody, { status: response.status })
  } catch {
    return Response.json({ message: '休館日データの取得に失敗しました。' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { municipality, ...requestBody } =
      (await request.json()) as Partial<IBranchClosedDayRequest>
    if (!municipality) {
      return Response.json({ message: '自治体を指定してください。' }, { status: 400 })
    }

    const response = await fetch(getScopedApiUrl(municipality), {
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
    return Response.json({ message: '休館日の登録に失敗しました。' }, { status: 500 })
  }
}
