import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import { Copyright } from '@/components/Copyright'
import { getCategoryListData } from './_components/listData'
import { PageClient } from './_components/PageClient'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const { categories, errorMessage, isMockData } = await getCategoryListData()

  return (
    <>
      <Toolbar />
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <PageClient categories={categories} errorMessage={errorMessage} isMockData={isMockData} />
        <Copyright sx={{ pt: 4 }} />
      </Container>
    </>
  )
}
