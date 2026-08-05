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

export async function POST(request: Request) {
  try {
    const requestBody = (await request.json()) as Partial<IBranchRequest>
    if (!isHalfWidthDigits(requestBody.phone)) {
      return Response.json(halfWidthDigitsError('phone'), { status: 400 })
    }

    const response = await fetch(getBookmanApiUrl('branches'), {
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
    return Response.json({ message: '支店データの登録に失敗しました。' }, { status: 500 })
  }
}
