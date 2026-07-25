import { Alert, Button, MenuItem, TextField } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { ChangeEvent } from 'react'
import { Branch, IBranchFormValues } from '@/resource/branch'
import { Municipality } from '@/resource/municipality'

interface EditDialogProps {
  branch: Branch | null
  onCloseDialog: () => void
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onUpdate: () => Promise<void>
  formValues: IBranchFormValues
  isUpdating: boolean
  updateErrorMessage: string | null
  municipalities: Municipality[]
}

export const EditDialog = ({
  branch,
  onCloseDialog,
  onInputChange,
  onUpdate,
  formValues,
  isUpdating,
  updateErrorMessage,
  municipalities,
}: EditDialogProps) => {
  const canUpdate = Boolean(
    formValues.municipality &&
    formValues.name.trim() &&
    formValues.address.trim() &&
    formValues.phone.trim() &&
    formValues.remark.trim(),
  )

  return (
    <Dialog open={Boolean(branch)} onClose={onCloseDialog} fullWidth maxWidth='sm'>
      <DialogTitle>支店情報を編集</DialogTitle>
      <DialogContent>
        {updateErrorMessage && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {updateErrorMessage}
          </Alert>
        )}
        <TextField
          autoFocus
          select
          margin='dense'
          id='edit-municipality'
          name='municipality'
          label='自治体'
          fullWidth
          required
          value={formValues.municipality}
          disabled={isUpdating}
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
          id='edit-name'
          name='name'
          label='図書館の名前'
          fullWidth
          required
          value={formValues.name}
          disabled={isUpdating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='edit-address'
          name='address'
          label='図書館の住所'
          fullWidth
          required
          value={formValues.address}
          disabled={isUpdating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='edit-phone'
          name='phone'
          label='図書館の電話番号'
          fullWidth
          required
          value={formValues.phone}
          disabled={isUpdating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='edit-remark'
          name='remark'
          label='備考'
          multiline
          fullWidth
          required
          value={formValues.remark}
          disabled={isUpdating}
          onChange={onInputChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseDialog} color='primary' disabled={isUpdating}>
          キャンセル
        </Button>
        <Button onClick={onUpdate} color='primary' disabled={isUpdating || !canUpdate}>
          {isUpdating ? '保存中' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
