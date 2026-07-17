'use client'
import { useEffect } from 'react'
import { Alert, Button, Typography } from '@mui/material'
import Toolbar from '@mui/material/Toolbar'
import { Copyright } from '@/components/Copyright'
import Container from '@mui/material/Container'
import { useList } from './_components/useList'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { List } from './_components/List'
import { CreateDialog } from './_components/CreateDialog'
import { useCreateDialog } from './_components/useCreateDialog'

export default function Page() {
  const { loading, books, isLoading, errorMessage, isMockData } = useList()
  const { isDialogOpen, openDialog, onCloseDialog, onInputChange, onCreate } = useCreateDialog()

  useEffect(() => {
    void loading()
  }, [loading])

  const branchListProps = {
    books,
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
          {errorMessage && (
            <Grid size={{ xs: 12 }}>
              <Alert severity='warning'>{errorMessage}</Alert>
            </Grid>
          )}
          {isMockData && (
            <Grid size={{ xs: 12 }}>
              <Alert severity='info'>
                バックエンド API に接続できないため、開発用モックデータを表示しています。
              </Alert>
            </Grid>
          )}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <Button
                variant='contained'
                color='primary'
                onClick={openDialog}
                disabled={isLoading}
                sx={{ mb: 5 }}
              >
                新規登録
              </Button>
              {isLoading ? (
                <Typography variant='body1'>読み込み中...</Typography>
              ) : (
                <List {...branchListProps} />
              )}
              <CreateDialog {...dialogProps} />
            </Paper>
          </Grid>
        </Grid>
        <Copyright sx={{ pt: 4 }} />
      </Container>
    </>
  )
}
