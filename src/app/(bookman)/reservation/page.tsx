import Toolbar from '@mui/material/Toolbar'
import Container from '@mui/material/Container'
import { Copyright } from '@/components/Copyright'
import { PageClient } from './_components/PageClient'
import { getReservationPageData } from './_components/listData'

export default async function ReservationPage() {
  const { customers, branchBookStocks, lendings, reservations, errorMessage, isMockData } =
    await getReservationPageData()

  return (
    <>
      <Toolbar />
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <PageClient
          customers={customers}
          branchBookStocks={branchBookStocks}
          lendings={lendings}
          reservations={reservations}
          errorMessage={errorMessage}
          isMockData={isMockData}
        />
        <Copyright sx={{ pt: 4 }} />
      </Container>
    </>
  )
}
