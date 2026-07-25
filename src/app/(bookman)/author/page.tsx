import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import { Copyright } from '@/components/Copyright'
import { getAuthorListData } from './_components/listData'
import { PageClient } from './_components/PageClient'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const { authors, errorMessage, isMockData } = await getAuthorListData()

  return (
    <>
      <Toolbar />
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <PageClient authors={authors} errorMessage={errorMessage} isMockData={isMockData} />
        <Copyright sx={{ pt: 4 }} />
      </Container>
    </>
  )
}
