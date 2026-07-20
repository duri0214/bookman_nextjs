import Toolbar from '@mui/material/Toolbar'
import { Copyright } from '@/components/Copyright'
import Container from '@mui/material/Container'
import { PageClient } from './_components/PageClient'
import { getLendingPageData } from './_components/listData'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const { customers, staffMembers, branchBookStocks, lendings, errorMessage, isMockData } =
    await getLendingPageData()

  return (
    <>
      <Toolbar />
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <PageClient
          customers={customers}
          staffMembers={staffMembers}
          branchBookStocks={branchBookStocks}
          lendings={lendings}
          errorMessage={errorMessage}
          isMockData={isMockData}
        />
        <Copyright sx={{ pt: 4 }} />
      </Container>
    </>
  )
}
