import { Alert, Button, InputAdornment, TextField } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { ChangeEvent } from 'react'
import { ICategoryFormValues } from '@/resource/category'

interface CreateDialogProps {
  isDialogOpen: boolean
  onCloseDialog: () => void
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onCreate: () => Promise<void>
  formValues: ICategoryFormValues
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
      <DialogTitle>カテゴリ登録</DialogTitle>
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
          label='カテゴリ名'
          helperText='例: 児童書'
          fullWidth
          value={formValues.name}
          disabled={isCreating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='color'
          name='color'
          label='表示色'
          helperText='一覧やダッシュボードで使う色を指定してください。'
          fullWidth
          value={formValues.color}
          disabled={isCreating}
          onChange={onInputChange}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <input
                    aria-label='カテゴリ表示色'
                    type='color'
                    name='color'
                    value={formValues.color}
                    disabled={isCreating}
                    onChange={onInputChange}
                    style={{ width: 32, height: 32, border: 0, padding: 0, background: 'none' }}
                  />
                </InputAdornment>
              ),
            },
          }}
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
