import { Button, TextField } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { ChangeEvent } from 'react'

interface CreateDialogProps {
  isDialogOpen: boolean
  onCloseDialog: () => void
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onCreate: () => void
}

export const CreateDialog = ({
  isDialogOpen,
  onCloseDialog,
  onInputChange,
  onCreate,
}: CreateDialogProps) => {
  return (
    <Dialog open={isDialogOpen} onClose={onCloseDialog}>
      <DialogTitle>新規登録</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin='dense'
          id='name'
          name='name'
          label='図書館の名前'
          fullWidth
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='address'
          name='address'
          label='図書館の住所'
          fullWidth
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='phone'
          name='phone'
          label='図書館の電話番号'
          fullWidth
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='remark'
          name='remark'
          label='備考'
          multiline
          fullWidth
          onChange={onInputChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseDialog} color='primary'>
          キャンセル
        </Button>
        <Button onClick={onCreate} color='primary'>
          登録
        </Button>
      </DialogActions>
    </Dialog>
  )
}
