import { getBookmanApiUrl } from '@/helpers/apiClient'

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

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const apiUrl = new URL(getBookmanApiUrl('searchConditionPermissions'))
    const staff = requestUrl.searchParams.get('staff')
    if (staff) {
      apiUrl.searchParams.set('staff', staff)
    }

    const response = await fetch(apiUrl.toString(), { method: 'GET', cache: 'no-store' })
    const responseText = await response.text()

    return Response.json(parseResponseBody(responseText), { status: response.status })
  } catch {
    return Response.json({ message: '保存条件の権限情報取得に失敗しました。' }, { status: 500 })
  }
}
