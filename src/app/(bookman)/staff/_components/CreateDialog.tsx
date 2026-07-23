import { Alert, Button, MenuItem, TextField } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { ChangeEvent } from 'react'
import { Branch } from '@/resource/branch'
import { IStaffFormValues, STAFF_ROLE_LABELS } from '@/resource/staff'

interface CreateDialogProps {
  branches: Branch[]
  isDialogOpen: boolean
  onCloseDialog: () => void
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onCreate: () => Promise<void>
  formValues: IStaffFormValues
  isCreating: boolean
  createErrorMessage: string | null
}

export const CreateDialog = ({
  branches,
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
      <DialogTitle>職員登録</DialogTitle>
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
          label='職員名'
          fullWidth
          value={formValues.name}
          disabled={isCreating}
          onChange={onInputChange}
        />
        <TextField
          select
          margin='dense'
          id='branch'
          name='branch'
          label='所属支店'
          fullWidth
          value={formValues.branch}
          disabled={isCreating}
          onChange={onInputChange}
        >
          <MenuItem value=''>未所属</MenuItem>
          {branches.map((branch) => (
            <MenuItem key={branch.id} value={String(branch.id)}>
              {branch.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          required
          margin='dense'
          id='role'
          name='role'
          label='ロール'
          fullWidth
          value={formValues.role}
          disabled={isCreating}
          onChange={onInputChange}
        >
          {Object.entries(STAFF_ROLE_LABELS).map(([role, label]) => (
            <MenuItem key={role} value={role}>
              {label}
            </MenuItem>
          ))}
        </TextField>
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
