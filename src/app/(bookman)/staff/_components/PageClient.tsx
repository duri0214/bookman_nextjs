'use client'

import { Alert, Button } from '@mui/material'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { Branch } from '@/resource/branch'
import { Staff } from '@/resource/staff'
import { CreateDialog } from './CreateDialog'
import { List } from './List'
import { useStaffActions } from './useStaffActions'

interface Props {
  branches: Branch[]
  staff: Staff[]
  errorMessage: string | null
  isMockData: boolean
}

export function PageClient({ branches, staff, errorMessage, isMockData }: Props) {
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
    savingStaffId,
    onDelete,
    deletingStaffId,
    updateErrorMessage,
    actionMessage,
    actionMessageSeverity,
  } = useStaffActions()

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
            職員登録
          </Button>
          {actionMessage && (
            <Alert severity={actionMessageSeverity} sx={{ mb: 2 }}>
              {actionMessage}
            </Alert>
          )}
          <List
            branches={branches}
            staff={staff}
            getEditingRow={getEditingRow}
            onEditChange={onEditChange}
            onUpdate={onUpdate}
            savingStaffId={savingStaffId}
            onDelete={onDelete}
            deletingStaffId={deletingStaffId}
            updateErrorMessage={updateErrorMessage}
          />
          <CreateDialog
            branches={branches}
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
