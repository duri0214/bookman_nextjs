import Toolbar from '@mui/material/Toolbar'
import { Copyright } from '@/components/Copyright'
import Container from '@mui/material/Container'
import { getStaffListData } from './_components/listData'
import { PageClient } from './_components/PageClient'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const { branches, staff, errorMessage, isMockData } = await getStaffListData()

  return (
    <>
      <Toolbar />
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <PageClient
          branches={branches}
          staff={staff}
          errorMessage={errorMessage}
          isMockData={isMockData}
        />
        <Copyright sx={{ pt: 4 }} />
      </Container>
    </>
  )
}
