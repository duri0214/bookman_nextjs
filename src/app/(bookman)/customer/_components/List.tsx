import React from 'react'
import {
  Alert,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import SaveIcon from '@mui/icons-material/Save'
import { ChangeEvent } from 'react'
import { Customer, ICustomerFormValues } from '@/resource/customer'

interface Props {
  customers: Customer[]
  getEditingRow: (customer: Customer) => ICustomerFormValues
  onEditChange: (
    customer: Customer,
    fieldName: keyof ICustomerFormValues,
  ) => (event: ChangeEvent<HTMLInputElement>) => void
  onUpdate: (customer: Customer) => Promise<void>
  savingCustomerId: number | null
  updateErrorMessage: string | null
}

export function List({
  customers,
  getEditingRow,
  onEditChange,
  onUpdate,
  savingCustomerId,
  updateErrorMessage,
}: Props) {
  if (!customers || customers.length === 0) {
    return <Typography variant='body1'>利用者データはまだありません。</Typography>
  }

  return (
    <Box sx={{ width: '100%' }}>
      {updateErrorMessage && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {updateErrorMessage}
        </Alert>
      )}
      <TableContainer>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 80 }}>#</TableCell>
              <TableCell>利用者名</TableCell>
              <TableCell>電話番号</TableCell>
              <TableCell>貸出上限数</TableCell>
              <TableCell align='right' sx={{ width: 120 }}>
                操作
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => {
              const rowValues = getEditingRow(customer)
              const isSaving = savingCustomerId === customer.id
              return (
                <TableRow key={customer.id}>
                  <TableCell>{customer.id}</TableCell>
                  <TableCell>
                    <TextField
                      size='small'
                      name='name'
                      value={rowValues.name}
                      disabled={isSaving}
                      onChange={onEditChange(customer, 'name')}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size='small'
                      name='phone'
                      value={rowValues.phone}
                      disabled={isSaving}
                      onChange={onEditChange(customer, 'phone')}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size='small'
                      name='max_lending_count'
                      type='number'
                      value={rowValues.max_lending_count}
                      disabled={isSaving}
                      onChange={onEditChange(customer, 'max_lending_count')}
                      slotProps={{ htmlInput: { min: 1 } }}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell align='right'>
                    <Button
                      variant='outlined'
                      size='small'
                      startIcon={<SaveIcon />}
                      disabled={isSaving}
                      onClick={() => onUpdate(customer)}
                    >
                      {isSaving ? '保存中' : '保存'}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
