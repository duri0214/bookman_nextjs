'use client'

import { Alert, Button } from '@mui/material'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { Book } from '@/resource/book'
import { Branch } from '@/resource/branch'
import { CreateDialog } from './CreateDialog'
import { List } from './List'
import { TransferDialog } from './TransferDialog'
import { useCreateDialog } from './useCreateDialog'
import { useTransferDialog } from './useTransferDialog'

interface Props {
  books: Book[]
  branches: Branch[]
  errorMessage: string | null
  isMockData: boolean
}

export function PageClient({ books, branches, errorMessage, isMockData }: Props) {
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
  const {
    selectedBook,
    isTransferDialogOpen,
    openTransferDialog,
    onCloseTransferDialog,
    formValues: transferFormValues,
    onTransferInputChange,
    onTransfer,
    isTransferring,
    transferErrorMessage,
  } = useTransferDialog()

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
          <List books={books} onTransferClick={openTransferDialog} />
          <CreateDialog {...dialogProps} />
          <TransferDialog
            selectedBook={selectedBook}
            branches={branches}
            isTransferDialogOpen={isTransferDialogOpen}
            onCloseTransferDialog={onCloseTransferDialog}
            formValues={transferFormValues}
            onTransferInputChange={onTransferInputChange}
            onTransfer={onTransfer}
            isTransferring={isTransferring}
            transferErrorMessage={transferErrorMessage}
          />
        </Paper>
      </Grid>
    </Grid>
  )
}
