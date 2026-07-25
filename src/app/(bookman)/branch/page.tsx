import Toolbar from '@mui/material/Toolbar'
import { Copyright } from '@/components/Copyright'
import Container from '@mui/material/Container'
import { getBranchListData } from './_components/listData'
import { PageClient } from './_components/PageClient'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const { branches, branchSummaries, municipalities, closedDays, errorMessage, isMockData } =
    await getBranchListData()

  return (
    <>
      <Toolbar />
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <PageClient
          branches={branches}
          branchSummaries={branchSummaries}
          municipalities={municipalities}
          closedDays={closedDays}
          errorMessage={errorMessage}
          isMockData={isMockData}
        />
        <Copyright sx={{ pt: 4 }} />
      </Container>
    </>
  )
}
