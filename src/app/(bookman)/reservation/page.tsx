import { PageClient } from './_components/PageClient'
import { getReservationPageData } from './_components/listData'

export default async function ReservationPage() {
  const { customers, branchBookStocks, reservations, errorMessage, isMockData } =
    await getReservationPageData()

  return (
    <PageClient
      customers={customers}
      branchBookStocks={branchBookStocks}
      reservations={reservations}
      errorMessage={errorMessage}
      isMockData={isMockData}
    />
  )
}
