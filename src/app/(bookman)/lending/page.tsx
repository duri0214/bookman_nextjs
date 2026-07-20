import Toolbar from '@mui/material/Toolbar'
import { Copyright } from '@/components/Copyright'
import Container from '@mui/material/Container'
import { getCustomerListData } from '../customer/_components/listData'
import { PageClient } from './_components/PageClient'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const { customers, errorMessage, isMockData } = await getCustomerListData()

  return (
    <>
      <Toolbar />
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <PageClient customers={customers} errorMessage={errorMessage} isMockData={isMockData} />
        <Copyright sx={{ pt: 4 }} />
      </Container>
    </>
  )
}
