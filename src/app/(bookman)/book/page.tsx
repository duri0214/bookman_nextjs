import Toolbar from '@mui/material/Toolbar'
import { Copyright } from '@/components/Copyright'
import Container from '@mui/material/Container'
import { getBookListData } from './_components/listData'
import { PageClient } from './_components/PageClient'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const { books, branches, municipalities, staffMembers, errorMessage, isMockData } =
    await getBookListData()

  return (
    <>
      <Toolbar />
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <PageClient
          books={books}
          branches={branches}
          municipalities={municipalities}
          staffMembers={staffMembers}
          errorMessage={errorMessage}
          isMockData={isMockData}
        />
        <Copyright sx={{ pt: 4 }} />
      </Container>
    </>
  )
}
