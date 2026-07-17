import { Alert, Button, TextField } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { ChangeEvent } from 'react'
import { IBookFormValues } from '@/resource/book'

interface CreateDialogProps {
  isDialogOpen: boolean
  onCloseDialog: () => void
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onCreate: () => Promise<void>
  formValues: Partial<IBookFormValues>
  isCreating: boolean
  createErrorMessage: string | null
}

export const CreateDialog = ({
  isDialogOpen,
  onCloseDialog,
  onInputChange,
  onCreate,
  formValues,
  isCreating,
  createErrorMessage,
}: CreateDialogProps) => {
  return (
    <Dialog open={isDialogOpen} onClose={onCloseDialog}>
      <DialogTitle>新規登録</DialogTitle>
      <DialogContent>
        {createErrorMessage && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {createErrorMessage}
          </Alert>
        )}
        <TextField
          autoFocus
          margin='dense'
          id='category'
          name='category'
          label='カテゴリーID'
          fullWidth
          value={formValues.category ?? ''}
          disabled={isCreating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='name'
          name='name'
          label='名前'
          fullWidth
          value={formValues.name ?? ''}
          disabled={isCreating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='authors'
          name='authors'
          label='著者ID'
          helperText='複数の著者はカンマ区切りで入力'
          fullWidth
          value={formValues.authors ?? ''}
          disabled={isCreating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='lead_text'
          name='lead_text'
          label='あらすじ'
          fullWidth
          multiline
          value={formValues.lead_text ?? ''}
          disabled={isCreating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='amount'
          name='amount'
          label='数量'
          fullWidth
          value={formValues.amount ?? ''}
          disabled={isCreating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='isbn'
          name='isbn'
          label='ISBN'
          fullWidth
          value={formValues.isbn ?? ''}
          disabled={isCreating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='publication_date'
          name='publication_date'
          label='出版年月日'
          fullWidth
          value={formValues.publication_date ?? ''}
          disabled={isCreating}
          onChange={onInputChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseDialog} color='primary' disabled={isCreating}>
          キャンセル
        </Button>
        <Button onClick={onCreate} color='primary' disabled={isCreating}>
          {isCreating ? '登録中' : '登録'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
