'use client'

import { Alert, Button } from '@mui/material'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { Branch, BranchClosedDay, BranchSummary } from '@/resource/branch'
import { Municipality } from '@/resource/municipality'
import { ClosedDaySettings } from './ClosedDaySettings'
import { CreateDialog } from './CreateDialog'
import { EditDialog } from './EditDialog'
import { List } from './List'
import { useCreateDialog } from './useCreateDialog'

interface Props {
  branches: Branch[]
  branchSummaries: BranchSummary[]
  municipalities: Municipality[]
  closedDays: BranchClosedDay[]
  errorMessage: string | null
  isMockData: boolean
}

export function PageClient({
  branches,
  branchSummaries,
  municipalities,
  closedDays,
  errorMessage,
  isMockData,
}: Props) {
  const {
    isDialogOpen,
    openDialog,
    onCloseDialog,
    formValues,
    onInputChange,
    onCreate,
    isCreating,
    createErrorMessage,
    editingBranch,
    openEditDialog,
    onCloseEditDialog,
    editFormValues,
    onEditInputChange,
    onUpdate,
    isUpdating,
    updateErrorMessage,
    onDelete,
    deletingBranchId,
    actionMessage,
    actionMessageSeverity,
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
          {actionMessage && (
            <Alert severity={actionMessageSeverity} sx={{ mb: 2 }}>
              {actionMessage}
            </Alert>
          )}
          <List
            branches={branches}
            branchSummaries={branchSummaries}
            onEdit={openEditDialog}
            onDelete={onDelete}
            deletingBranchId={deletingBranchId}
          />
          <CreateDialog {...dialogProps} municipalities={municipalities} />
          <EditDialog
            branch={editingBranch}
            onCloseDialog={onCloseEditDialog}
            formValues={editFormValues}
            onInputChange={onEditInputChange}
            onUpdate={onUpdate}
            isUpdating={isUpdating}
            updateErrorMessage={updateErrorMessage}
            municipalities={municipalities}
          />
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
