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

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const response = await fetch(getBookmanApiUrl('booksCsvImport'), {
      method: 'POST',
      body: formData,
      cache: 'no-store',
    })

    const responseText = await response.text()
    const responseBody = parseResponseBody(responseText)

    return Response.json(responseBody, { status: response.status })
  } catch {
    return Response.json({ message: '書籍CSV登録に失敗しました。' }, { status: 500 })
  }
}
