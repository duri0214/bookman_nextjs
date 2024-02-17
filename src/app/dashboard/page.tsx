'use client'
import { useEffect, useState } from 'react'
import { Book } from '@/resource/book'
import Toolbar from '@mui/material/Toolbar'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Chart from '@/app/dashboard/_components/Chart'
import Deposits from '@/app/dashboard/_components/Deposits'
import Orders from '@/app/dashboard/_components/Orders'
import { Copyright } from '@/components/Copyright'
import Container from '@mui/material/Container'
import { BookList } from '@/app/dashboard/_components/BookList'

export default function Page() {
  const [books, setBooks] = useState<Book[]>([])

  // TODO: dbからのデータを取得します。別のところに移したい
  useEffect(() => {
    const fetchData = async (): Promise<Book[]> => {
      const apiUrl = 'http://127.0.0.1:8000/bookman/api/books/'

      try {
        const response = await fetch(apiUrl, {
          method: 'GET',
        })

        if (response.ok) {
          const responseData = await response.json()
          const formattedData: Book[] = responseData.map((result: any) => ({
            id: result.id,
            name: result.name,
            leadText: result.lead_text,
          }))
          setBooks(formattedData)
          return formattedData
        } else {
          console.error('Error fetching data:', response.statusText)
          return []
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        return []
      }
    }
    fetchData()
  }, [])

  if (!books) {
    return <div>Loading...</div>
  }

  const props = {
    books,
  }

  return (
    <>
      <Toolbar />
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          {/* Chart */}
          <Grid item xs={12} md={8} lg={9}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 240,
              }}
            >
              <Chart />
            </Paper>
          </Grid>

          {/* Recent Deposits */}
          <Grid item xs={12} md={4} lg={3}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 240,
              }}
            >
              <Deposits />
            </Paper>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Orders />
            </Paper>
          </Grid>
        </Grid>

        {/* ここに Django から持ってきたデータを表示するコンポーネントを統合します */}
        <BookList {...props} />

        <Copyright sx={{ pt: 4 }} />
      </Container>
    </>
  )
}
