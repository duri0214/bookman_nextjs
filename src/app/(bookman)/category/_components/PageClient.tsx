'use client'

import { Alert, Button } from '@mui/material'
import CategoryIcon from '@mui/icons-material/Category'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { Category } from '@/resource/category'
import { CreateDialog } from './CreateDialog'
import { List } from './List'
import { useCategoryActions } from './useCategoryActions'

interface Props {
  categories: Category[]
  errorMessage: string | null
  isMockData: boolean
}

export function PageClient({ categories, errorMessage, isMockData }: Props) {
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
    savingCategoryId,
    onDelete,
    deletingCategoryId,
    updateErrorMessage,
    actionMessage,
    actionMessageSeverity,
  } = useCategoryActions()

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
            startIcon={<CategoryIcon />}
            sx={{ mb: 3, alignSelf: 'flex-start' }}
          >
            カテゴリ登録
          </Button>
          {actionMessage && (
            <Alert severity={actionMessageSeverity} sx={{ mb: 2 }}>
              {actionMessage}
            </Alert>
          )}
          <List
            categories={categories}
            getEditingRow={getEditingRow}
            onEditChange={onEditChange}
            onUpdate={onUpdate}
            savingCategoryId={savingCategoryId}
            onDelete={onDelete}
            deletingCategoryId={deletingCategoryId}
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
