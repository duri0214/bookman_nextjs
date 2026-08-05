'use client'

import { Alert, Button } from '@mui/material'
import AddHomeWorkIcon from '@mui/icons-material/AddHomeWork'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { Municipality } from '@/resource/municipality'
import { CreateDialog } from './CreateDialog'
import { List } from './List'
import { useMunicipalityActions } from './useMunicipalityActions'

interface Props {
  municipalities: Municipality[]
  errorMessage: string | null
  isMockData: boolean
}

export function PageClient({ municipalities, errorMessage, isMockData }: Props) {
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
    savingMunicipalityId,
    onDelete,
    deletingMunicipalityId,
    updateErrorMessage,
    actionMessage,
    actionMessageSeverity,
  } = useMunicipalityActions()

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
            startIcon={<AddHomeWorkIcon />}
            sx={{ mb: 3, alignSelf: 'flex-start' }}
          >
            自治体登録
          </Button>
          {actionMessage && (
            <Alert severity={actionMessageSeverity} sx={{ mb: 2 }}>
              {actionMessage}
            </Alert>
          )}
          <List
            municipalities={municipalities}
            getEditingRow={getEditingRow}
            onEditChange={onEditChange}
            onUpdate={onUpdate}
            savingMunicipalityId={savingMunicipalityId}
            onDelete={onDelete}
            deletingMunicipalityId={deletingMunicipalityId}
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
