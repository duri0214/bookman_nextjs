import { getBookmanApiUrl } from '@/helpers/apiClient'
import type { IBookRequest } from '@/resource/book'

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
    bookId: string
  }>
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { bookId } = await context.params
    const requestBody = (await request.json()) as Partial<IBookRequest>
    const apiUrl = new URL(`${bookId}/`, getBookmanApiUrl('books'))
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
    return Response.json({ message: '書籍データの更新に失敗しました。' }, { status: 500 })
  }
}
