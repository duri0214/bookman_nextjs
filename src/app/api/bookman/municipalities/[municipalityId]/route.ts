import { getBookmanApiUrl } from '@/helpers/apiClient'
import type { IMunicipalityRequest } from '@/resource/municipality'

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
    municipalityId: string
  }>
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { municipalityId } = await context.params
    const requestBody = (await request.json()) as Partial<IMunicipalityRequest>
    const apiUrl = new URL(`${municipalityId}/`, getBookmanApiUrl('municipalities'))
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
    return Response.json({ message: '自治体データの更新に失敗しました。' }, { status: 500 })
  }
}
