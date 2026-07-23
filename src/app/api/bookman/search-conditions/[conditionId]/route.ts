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

const buildDetailUrl = (request: Request, conditionId: string): string => {
  const requestUrl = new URL(request.url)
  const apiUrl = new URL(`${getBookmanApiUrl('searchConditions')}${conditionId}/`)
  const staff = requestUrl.searchParams.get('staff')
  if (staff) {
    apiUrl.searchParams.set('staff', staff)
  }

  return apiUrl.toString()
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ conditionId: string }> },
) {
  try {
    const { conditionId } = await params
    const requestBody = await request.json()
    const response = await fetch(buildDetailUrl(request, conditionId), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    })
    const responseText = await response.text()

    return Response.json(parseResponseBody(responseText), { status: response.status })
  } catch {
    return Response.json({ message: '保存条件の更新に失敗しました。' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ conditionId: string }> },
) {
  try {
    const { conditionId } = await params
    const response = await fetch(buildDetailUrl(request, conditionId), {
      method: 'DELETE',
      cache: 'no-store',
    })
    const responseText = await response.text()

    return Response.json(parseResponseBody(responseText), { status: response.status })
  } catch {
    return Response.json({ message: '保存条件の削除に失敗しました。' }, { status: 500 })
  }
}
