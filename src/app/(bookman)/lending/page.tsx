import Toolbar from '@mui/material/Toolbar'
import { Copyright } from '@/components/Copyright'
import Container from '@mui/material/Container'
import { PageClient } from './_components/PageClient'
import { getLendingPageData } from './_components/listData'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const {
    customers,
    staffMembers,
    branchBookStocks,
    lendings,
    heldReservations,
    errorMessage,
    isMockData,
  } = await getLendingPageData()
  const pageClientKey = branchBookStocks
    .map((branchBookStock) => `${branchBookStock.id}:${branchBookStock.availableAmount}`)
    .concat(heldReservations.map((reservation) => `held:${reservation.id}`))
    .join('|')

  return (
    <>
      <Toolbar />
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <PageClient
          key={pageClientKey}
          customers={customers}
          staffMembers={staffMembers}
          branchBookStocks={branchBookStocks}
          lendings={lendings}
          heldReservations={heldReservations}
          errorMessage={errorMessage}
          isMockData={isMockData}
        />
        <Copyright sx={{ pt: 4 }} />
      </Container>
    </>
  )
}
