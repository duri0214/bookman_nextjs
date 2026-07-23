import { getBookmanApiUrl } from '@/helpers/apiClient'
import type { SearchConditionRequest } from '@/resource/searchCondition'

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

const buildSearchConditionUrl = (request: Request): string => {
  const requestUrl = new URL(request.url)
  const apiUrl = new URL(getBookmanApiUrl('searchConditions'))
  const staff = requestUrl.searchParams.get('staff')
  const targetScreen = requestUrl.searchParams.get('target_screen')

  if (staff) {
    apiUrl.searchParams.set('staff', staff)
  }
  if (targetScreen) {
    apiUrl.searchParams.set('target_screen', targetScreen)
  }

  return apiUrl.toString()
}

export async function GET(request: Request) {
  try {
    const response = await fetch(buildSearchConditionUrl(request), {
      method: 'GET',
      cache: 'no-store',
    })
    const responseText = await response.text()

    return Response.json(parseResponseBody(responseText), { status: response.status })
  } catch {
    return Response.json({ message: '保存条件の取得に失敗しました。' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const requestBody = (await request.json()) as SearchConditionRequest
    const response = await fetch(getBookmanApiUrl('searchConditions'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    })
    const responseText = await response.text()

    return Response.json(parseResponseBody(responseText), { status: response.status })
  } catch {
    return Response.json({ message: '保存条件の登録に失敗しました。' }, { status: 500 })
  }
}
