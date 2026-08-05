import { Alert, Button, MenuItem, TextField } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { ChangeEvent } from 'react'
import { IBranchFormValues } from '@/resource/branch'
import { Municipality } from '@/resource/municipality'

interface CreateDialogProps {
  isDialogOpen: boolean
  onCloseDialog: () => void
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onCreate: () => Promise<void>
  formValues: IBranchFormValues
  isCreating: boolean
  createErrorMessage: string | null
  municipalities: Municipality[]
}

export const CreateDialog = ({
  isDialogOpen,
  onCloseDialog,
  onInputChange,
  onCreate,
  formValues,
  isCreating,
  createErrorMessage,
  municipalities,
}: CreateDialogProps) => {
  const canCreate = Boolean(
    formValues.municipality &&
    formValues.name.trim() &&
    formValues.address.trim() &&
    formValues.phone.trim() &&
    formValues.remark.trim(),
  )

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
          select
          margin='dense'
          id='municipality'
          name='municipality'
          label='自治体'
          fullWidth
          required
          value={formValues.municipality}
          disabled={isCreating}
          onChange={onInputChange}
        >
          <MenuItem value='' disabled>
            自治体を選択してください
          </MenuItem>
          {municipalities.map((municipality) => (
            <MenuItem key={municipality.id} value={String(municipality.id)}>
              {municipality.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          margin='dense'
          id='name'
          name='name'
          label='図書館の名前'
          fullWidth
          required
          value={formValues.name}
          disabled={isCreating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='address'
          name='address'
          label='図書館の住所'
          fullWidth
          required
          value={formValues.address}
          disabled={isCreating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='phone'
          name='phone'
          label='図書館の電話番号'
          helperText='半角数字のみで入力してください。'
          fullWidth
          required
          slotProps={{
            htmlInput: {
              inputMode: 'numeric',
              pattern: '[0-9]*',
            },
          }}
          value={formValues.phone}
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
          required
          value={formValues.remark}
          disabled={isCreating}
          onChange={onInputChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseDialog} color='primary' disabled={isCreating}>
          キャンセル
        </Button>
        <Button onClick={onCreate} color='primary' disabled={isCreating || !canCreate}>
          {isCreating ? '登録中' : '登録'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
