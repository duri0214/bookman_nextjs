import React from 'react'
import { Box, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'
import { Branch } from '@/resource/branch'

interface Props {
  branches: Branch[]
}

export function BranchList({ branches }: Props) {
  if (!branches || branches.length === 0) {
    return <Typography variant='h5'>No data available.</Typography>
  }
  const rows: GridRowsProp = branches.map((branch) => ({
    id: branch.id,
    name: branch.name,
    address: branch.address,
    phone: branch.phone,
    remark: branch.remark,
  }))
  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', width: 50 },
    { field: 'name', headerName: '名前', width: 200 },
    { field: 'address', headerName: '住所', width: 200 },
    { field: 'phone', headerName: '問い合わせ先', width: 150 },
    { field: 'remark', headerName: '備考', width: 300 },
  ]
  return (
    <>
      <main>
        <Box width='100%'>
          <DataGrid columns={columns} rows={rows} />
        </Box>
      </main>
    </>
  )
}
