import { Alert, Button, TextField } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { ChangeEvent } from 'react'

interface CreateDialogProps {
  isDialogOpen: boolean
  onCloseDialog: () => void
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onCreate: () => Promise<void>
  formValues: {
    name?: string
    address?: string
    phone?: string
    remark?: string
  }
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
          id='name'
          name='name'
          label='図書館の名前'
          fullWidth
          value={formValues.name ?? ''}
          disabled={isCreating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='address'
          name='address'
          label='図書館の住所'
          fullWidth
          value={formValues.address ?? ''}
          disabled={isCreating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='phone'
          name='phone'
          label='図書館の電話番号'
          fullWidth
          value={formValues.phone ?? ''}
          disabled={isCreating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='remark'
          name='remark'
          label='備考'
          multiline
          fullWidth
          value={formValues.remark ?? ''}
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
