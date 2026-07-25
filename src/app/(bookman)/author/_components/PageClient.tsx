'use client'

import { Alert, Button } from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { Author } from '@/resource/author'
import { CreateDialog } from './CreateDialog'
import { List } from './List'
import { useAuthorActions } from './useAuthorActions'

interface Props {
  authors: Author[]
  errorMessage: string | null
  isMockData: boolean
}

export function PageClient({ authors, errorMessage, isMockData }: Props) {
  const {
    isDialogOpen,
    openDialog,
    onCloseDialog,
    formValues,
    onInputChange,
    onCreate,
    isCreating,
    createErrorMessage,
    getEditingRow,
    onEditChange,
    onUpdate,
    savingAuthorId,
    updateErrorMessage,
  } = useAuthorActions()

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
          <Button
            variant='contained'
            color='primary'
            onClick={openDialog}
            startIcon={<PersonAddIcon />}
            sx={{ mb: 3, alignSelf: 'flex-start' }}
          >
            著者登録
          </Button>
          <List
            authors={authors}
            getEditingRow={getEditingRow}
            onEditChange={onEditChange}
            onUpdate={onUpdate}
            savingAuthorId={savingAuthorId}
            updateErrorMessage={updateErrorMessage}
          />
          <CreateDialog
            isDialogOpen={isDialogOpen}
            onCloseDialog={onCloseDialog}
            formValues={formValues}
            onInputChange={onInputChange}
            onCreate={onCreate}
            isCreating={isCreating}
            createErrorMessage={createErrorMessage}
          />
        </Paper>
      </Grid>
    </Grid>
  )
}
