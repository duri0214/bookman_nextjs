'use client'

import { Alert, MenuItem, TextField, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { Customer } from '@/resource/customer'
import { ChangeEvent, useState } from 'react'

interface Props {
  customers: Customer[]
  errorMessage: string | null
  isMockData: boolean
}

export function PageClient({ customers, errorMessage, isMockData }: Props) {
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const selectedCustomer = customers.find(
    (customer) => customer.id.toString() === selectedCustomerId,
  )

  const onCustomerChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedCustomerId(event.target.value)
  }

  return (
    <Grid container spacing={3}>
      {errorMessage && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='warning'>{errorMessage}</Alert>
        </Grid>
      )}
      {isMockData && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='info'>
            バックエンド API に接続できないため、開発用モックデータを表示しています。
          </Alert>
        </Grid>
      )}
      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            select
            label='利用者'
            value={selectedCustomerId}
            onChange={onCustomerChange}
            fullWidth
            disabled={customers.length === 0}
          >
            {customers.map((customer) => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name}（上限 {customer.maxLendingCount}冊）
              </MenuItem>
            ))}
          </TextField>
          {customers.length === 0 && (
            <Typography variant='body1'>選択できる利用者データはまだありません。</Typography>
          )}
          {selectedCustomer && (
            <Typography variant='body1'>
              {selectedCustomer.name} / {selectedCustomer.phone || '電話番号未登録'} / 貸出上限{' '}
              {selectedCustomer.maxLendingCount}冊
            </Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  )
}
