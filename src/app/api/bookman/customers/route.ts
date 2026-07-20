import { getBookmanApiUrl } from '@/helpers/apiClient'
import type { ICustomerRequest } from '@/resource/customer'

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
    const requestBody = (await request.json()) as Partial<ICustomerRequest>
    const response = await fetch(getBookmanApiUrl('customers'), {
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
    return Response.json({ message: '利用者データの登録に失敗しました。' }, { status: 500 })
  }
}
