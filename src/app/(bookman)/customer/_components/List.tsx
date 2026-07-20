import React from 'react'
import { Box, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'
import { Customer } from '@/resource/customer'

interface Props {
  customers: Customer[]
}

export function List({ customers }: Props) {
  if (!customers || customers.length === 0) {
    return <Typography variant='body1'>利用者データはまだありません。</Typography>
  }

  const rows: GridRowsProp = customers.map((customer, index) => ({
    id: customer.id,
    rowNumber: index + 1,
    name: customer.name,
    phone: customer.phone,
    maxLendingCount: customer.maxLendingCount,
  }))
  const columns: GridColDef[] = [
    { field: 'rowNumber', headerName: '#', width: 50 },
    { field: 'name', headerName: '利用者名', width: 220 },
    { field: 'phone', headerName: '電話番号', width: 180 },
    { field: 'maxLendingCount', headerName: '貸出上限数', width: 120 },
  ]

  return (
    <main>
      <Box sx={{ width: '100%' }}>
        <DataGrid columns={columns} rows={rows} />
      </Box>
    </main>
  )
}
