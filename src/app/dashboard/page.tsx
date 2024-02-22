'use client'
import { useEffect } from 'react'
import Toolbar from '@mui/material/Toolbar'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Chart from '@/app/dashboard/_components/Chart'
import Deposits from '@/app/dashboard/_components/Deposits'
import Orders from '@/app/dashboard/_components/Orders'
import { Copyright } from '@/components/Copyright'
import Container from '@mui/material/Container'
import { BookList } from '@/app/dashboard/_components/BookList'
import { useBookList } from '@/app/dashboard/_components/useBookList'

export default function Page() {
  const { handleLoadingBookList, books } = useBookList()

  // 共通のスタイリングを定義
  const paperStyle = { p: 2, display: 'flex', flexDirection: 'column', height: 240 }

  useEffect(() => {
    handleLoadingBookList().catch((e) => console.error('データの取得に失敗しました: ', e))
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
            <Paper sx={paperStyle}>
              <Chart />
            </Paper>
          </Grid>

          {/* Recent Deposits */}
          <Grid item xs={12} md={4} lg={3}>
            <Paper sx={paperStyle}>
              <Deposits />
            </Paper>
          </Grid>

          {/* Recent Orders */}
          <Grid item xs={12}>
            <Paper sx={paperStyle}>
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
