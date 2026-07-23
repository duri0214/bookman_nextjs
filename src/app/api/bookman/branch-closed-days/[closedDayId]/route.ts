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

interface Params {
  params: Promise<{
    closedDayId: string
  }>
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { closedDayId } = await params
    const apiUrl = new URL(`${closedDayId}/`, getBookmanApiUrl('branchClosedDays'))
    const response = await fetch(apiUrl.toString(), {
      method: 'DELETE',
      cache: 'no-store',
    })
    const responseText = await response.text()
    const responseBody = parseResponseBody(responseText)

    return Response.json(responseBody, { status: response.status })
  } catch {
    return Response.json({ message: '休館日の削除に失敗しました。' }, { status: 500 })
  }
}
