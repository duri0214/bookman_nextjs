'use client'
import { useEffect } from 'react'
import { Button } from '@mui/material'
import Toolbar from '@mui/material/Toolbar'
import { Copyright } from '@/components/Copyright'
import Container from '@mui/material/Container'
import { useBranchList } from './_components/useBranchList'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { BranchList } from './_components/BranchList'
import { CreateDialog } from './_components/CreateDialog'
import { useCreateDialog } from './_components/useCreateDialog'

export default function Page() {
  const { handleLoadingBranchList, branches } = useBranchList()
  const { isDialogOpen, openDialog, onCloseDialog, onInputChange, onCreate } = useCreateDialog()

  useEffect(() => {
    handleLoadingBranchList().catch((e) => console.error('データの取得に失敗しました: ', e))
  }, [])

  if (!branches) {
    return <div>Loading...</div>
  }

  const branchListProps = {
    branches,
  }

  const dialogProps = {
    isDialogOpen,
    onCloseDialog,
    onInputChange,
    onCreate,
  }

  return (
    <>
      <Toolbar />
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Button variant='contained' color='primary' onClick={openDialog} sx={{ mb: 5 }}>
                新規登録
              </Button>
              <BranchList {...branchListProps} />
              <CreateDialog {...dialogProps} />
            </Paper>
          </Grid>
        </Grid>
        <Copyright sx={{ pt: 4 }} />
      </Container>
    </>
  )
}
