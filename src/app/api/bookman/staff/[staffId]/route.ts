import { getBookmanApiUrl } from '@/helpers/apiClient'
import type { IStaffRequest } from '@/resource/staff'

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

interface RouteContext {
  params: Promise<{
    staffId: string
  }>
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { staffId } = await context.params
    const requestBody = (await request.json()) as Partial<IStaffRequest>
    const apiUrl = new URL(`${staffId}/`, getBookmanApiUrl('staff'))
    const response = await fetch(apiUrl.toString(), {
      method: 'PATCH',
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
    return Response.json({ message: '職員データの更新に失敗しました。' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { staffId } = await context.params
    const apiUrl = new URL(`${staffId}/`, getBookmanApiUrl('staff'))
    const response = await fetch(apiUrl.toString(), {
      method: 'DELETE',
      cache: 'no-store',
    })
    const responseText = await response.text()
    if (!responseText) {
      return new Response(null, { status: response.status })
    }

    const responseBody = parseResponseBody(responseText)

    return Response.json(responseBody, { status: response.status })
  } catch {
    return Response.json({ message: '職員データの削除に失敗しました。' }, { status: 500 })
  }
}
