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
          id='category'
          name='category'
          label='カテゴリー'
          fullWidth
          onChange={onInputChange}
        />
        <TextField
          autoFocus
          margin='dense'
          id='name'
          name='name'
          label='名前'
          fullWidth
          onChange={onInputChange}
        />
        <TextField
          autoFocus
          margin='dense'
          id='author'
          name='author'
          label='著者'
          fullWidth
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='leadText'
          name='leadText'
          label='あらすじ'
          fullWidth
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='publication_date'
          name='publication_date'
          label='出版年月日'
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
