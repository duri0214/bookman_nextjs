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

export async function POST() {
  try {
    const response = await fetch(getBookmanApiUrl('reservationExpire'), {
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
    return Response.json({ message: '取り置き期限切れの反映に失敗しました。' }, { status: 500 })
  }
}
