'use client'
import { useEffect } from 'react'
import Toolbar from '@mui/material/Toolbar'
import { Copyright } from '@/components/Copyright'
import Container from '@mui/material/Container'
import { useBranchList } from './_components/useBranchList'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { BranchList } from './_components/BranchList'

export default function Page() {
  const { handleLoadingBranchList, branches } = useBranchList()
  useEffect(() => {
    handleLoadingBranchList().catch((e) => console.error('データの取得に失敗しました: ', e))
  }, [])

  if (!branches) {
    return <div>Loading...</div>
  }

  const props = {
    branches,
  }

  return (
    <>
      <Toolbar />
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <BranchList {...props} />
            </Paper>
          </Grid>
        </Grid>
        <Copyright sx={{ pt: 4 }} />
      </Container>
    </>
  )
}
