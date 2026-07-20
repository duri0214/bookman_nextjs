import { Alert, Button, TextField } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { ChangeEvent } from 'react'
import { ICustomerFormValues } from '@/resource/customer'

interface CreateDialogProps {
  isDialogOpen: boolean
  onCloseDialog: () => void
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onCreate: () => Promise<void>
  formValues: ICustomerFormValues
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
    <Dialog open={isDialogOpen} onClose={onCloseDialog} fullWidth maxWidth='sm'>
      <DialogTitle>利用者登録</DialogTitle>
      <DialogContent>
        {createErrorMessage && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {createErrorMessage}
          </Alert>
        )}
        <TextField
          autoFocus
          required
          margin='dense'
          id='name'
          name='name'
          label='利用者名'
          fullWidth
          value={formValues.name}
          disabled={isCreating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='phone'
          name='phone'
          label='電話番号'
          fullWidth
          value={formValues.phone}
          disabled={isCreating}
          onChange={onInputChange}
        />
        <TextField
          required
          margin='dense'
          id='max_lending_count'
          name='max_lending_count'
          label='貸出上限数'
          type='number'
          fullWidth
          value={formValues.max_lending_count}
          disabled={isCreating}
          onChange={onInputChange}
          slotProps={{ htmlInput: { min: 1 } }}
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
