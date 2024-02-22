'use client'
import Toolbar from '@mui/material/Toolbar'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Chart from '@/app/dashboard/_components/Chart'
import Deposits from '@/app/dashboard/_components/Deposits'
import Orders from '@/app/dashboard/_components/Orders'
import { Copyright } from '@/components/Copyright'
import Container from '@mui/material/Container'

export default function Page() {
  // 共通のスタイリングを定義
  const paperStyle = { p: 2, display: 'flex', flexDirection: 'column', height: 240 }

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

        <Copyright sx={{ pt: 4 }} />
      </Container>
    </>
  )
}
