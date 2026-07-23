'use client'

import { Alert, Button } from '@mui/material'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { Branch, BranchClosedDay } from '@/resource/branch'
import { ClosedDaySettings } from './ClosedDaySettings'
import { CreateDialog } from './CreateDialog'
import { List } from './List'
import { useCreateDialog } from './useCreateDialog'

interface Props {
  branches: Branch[]
  closedDays: BranchClosedDay[]
  errorMessage: string | null
  isMockData: boolean
}

export function PageClient({ branches, closedDays, errorMessage, isMockData }: Props) {
  const {
    isDialogOpen,
    openDialog,
    onCloseDialog,
    formValues,
    onInputChange,
    onCreate,
    isCreating,
    createErrorMessage,
  } = useCreateDialog()

  const dialogProps = {
    isDialogOpen,
    onCloseDialog,
    formValues,
    onInputChange,
    onCreate,
    isCreating,
    createErrorMessage,
  }

  return (
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
          <Button variant='contained' color='primary' onClick={openDialog} sx={{ mb: 5 }}>
            新規登録
          </Button>
          <List branches={branches} />
          <CreateDialog {...dialogProps} />
        </Paper>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <ClosedDaySettings branches={branches} closedDays={closedDays} />
        </Paper>
      </Grid>
    </Grid>
  )
}
