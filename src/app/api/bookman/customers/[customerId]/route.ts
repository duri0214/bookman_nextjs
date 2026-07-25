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

interface RouteContext {
  params: Promise<{
    customerId: string
  }>
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { customerId } = await context.params
    const requestBody = (await request.json()) as Partial<ICustomerRequest>
    const apiUrl = new URL(`${customerId}/`, getBookmanApiUrl('customers'))
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
    return Response.json({ message: '利用者データの更新に失敗しました。' }, { status: 500 })
  }
}
