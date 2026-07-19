import { Alert, Button, MenuItem, TextField, Typography } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { ChangeEvent } from 'react'
import { Book } from '@/resource/book'
import { Branch } from '@/resource/branch'
import { TransferFormValues } from './useTransferDialog'

interface TransferDialogProps {
  selectedBook: Book | null
  branches: Branch[]
  isTransferDialogOpen: boolean
  onCloseTransferDialog: () => void
  formValues: TransferFormValues
  onTransferInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onTransfer: () => Promise<void>
  isTransferring: boolean
  transferErrorMessage: string | null
}

export const TransferDialog = ({
  selectedBook,
  branches,
  isTransferDialogOpen,
  onCloseTransferDialog,
  formValues,
  onTransferInputChange,
  onTransfer,
  isTransferring,
  transferErrorMessage,
}: TransferDialogProps) => {
  return (
    <Dialog open={isTransferDialogOpen} onClose={onCloseTransferDialog} fullWidth maxWidth='sm'>
      <DialogTitle>支店間移動</DialogTitle>
      <DialogContent>
        {selectedBook && (
          <Typography variant='subtitle1' sx={{ mb: 2 }}>
            {selectedBook.name}
          </Typography>
        )}
        {transferErrorMessage && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {transferErrorMessage}
          </Alert>
        )}
        <TextField
          select
          margin='dense'
          id='fromBranch'
          name='fromBranch'
          label='移動元支店'
          fullWidth
          value={formValues.fromBranch}
          disabled={isTransferring}
          onChange={onTransferInputChange}
        >
          {selectedBook?.branchStocks.map((branchStock) => (
            <MenuItem key={branchStock.branchId} value={branchStock.branchId}>
              {branchStock.branchName}（{branchStock.amount}冊）
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          margin='dense'
          id='toBranch'
          name='toBranch'
          label='移動先支店'
          fullWidth
          value={formValues.toBranch}
          disabled={isTransferring}
          onChange={onTransferInputChange}
        >
          {branches.map((branch) => (
            <MenuItem key={branch.id} value={branch.id}>
              {branch.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          margin='dense'
          id='amount'
          name='amount'
          label='冊数'
          type='number'
          fullWidth
          value={formValues.amount}
          disabled={isTransferring}
          onChange={onTransferInputChange}
          slotProps={{ htmlInput: { min: 1 } }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseTransferDialog} color='primary' disabled={isTransferring}>
          キャンセル
        </Button>
        <Button onClick={onTransfer} color='primary' disabled={isTransferring}>
          {isTransferring ? '移動中' : '移動'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
