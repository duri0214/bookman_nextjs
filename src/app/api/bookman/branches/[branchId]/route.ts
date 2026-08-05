import { getBookmanApiUrl } from '@/helpers/apiClient'
import { halfWidthDigitsError, isHalfWidthDigits } from '@/helpers/numericValidation'
import type { IBranchRequest } from '@/resource/branch'

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
    branchId: string
  }>
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { branchId } = await context.params
    const requestBody = (await request.json()) as Partial<IBranchRequest>
    if (!isHalfWidthDigits(requestBody.phone)) {
      return Response.json(halfWidthDigitsError('phone'), { status: 400 })
    }

    const apiUrl = new URL(`${branchId}/`, getBookmanApiUrl('branches'))
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
    return Response.json({ message: '支店データの更新に失敗しました。' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { branchId } = await context.params
    const apiUrl = new URL(`${branchId}/`, getBookmanApiUrl('branches'))
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
    return Response.json({ message: '支店データの削除に失敗しました。' }, { status: 500 })
  }
}
