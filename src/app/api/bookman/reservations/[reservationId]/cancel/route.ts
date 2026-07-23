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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ reservationId: string }> },
) {
  try {
    await request.json().catch(() => null)
    const { reservationId } = await params
    const response = await fetch(`${getBookmanApiUrl('reservations')}${reservationId}/cancel/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
      cache: 'no-store',
    })

    const responseText = await response.text()
    const responseBody = parseResponseBody(responseText)

    return Response.json(responseBody, { status: response.status })
  } catch {
    return Response.json({ message: '予約取消に失敗しました。' }, { status: 500 })
  }
}
