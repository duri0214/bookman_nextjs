import React from 'react'
import EditIcon from '@mui/icons-material/Edit'
import { Box, Button, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'
import { Branch, BranchSummary } from '@/resource/branch'

interface Props {
  branches: Branch[]
  branchSummaries: BranchSummary[]
  onEdit: (branch: Branch) => void
}

export function List({ branches, branchSummaries, onEdit }: Props) {
  if (!branches || branches.length === 0) {
    return <Typography variant='body1'>支店データはまだありません。</Typography>
  }
  const summariesByBranchId = new Map(branchSummaries.map((summary) => [summary.branchId, summary]))
  const rows: GridRowsProp = branches.map((branch) => ({
    id: branch.id,
    municipalityName: branch.municipalityName,
    name: branch.name,
    address: branch.address,
    phone: branch.phone,
    remark: branch.remark,
    bookCount: summariesByBranchId.get(branch.id)?.bookCount ?? 0,
    totalStockAmount: summariesByBranchId.get(branch.id)?.totalStockAmount ?? 0,
  }))
  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', width: 50 },
    { field: 'municipalityName', headerName: '自治体', width: 160 },
    { field: 'name', headerName: '名前', width: 200 },
    { field: 'address', headerName: '住所', width: 200 },
    { field: 'phone', headerName: '問い合わせ先', width: 150 },
    { field: 'bookCount', headerName: '取扱書籍数', type: 'number', width: 120 },
    { field: 'totalStockAmount', headerName: '総所蔵冊数', type: 'number', width: 120 },
    { field: 'remark', headerName: '備考', width: 300 },
    {
      field: 'actions',
      headerName: '操作',
      width: 120,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const branch = branches.find((item) => item.id === params.row.id)
        if (!branch) {
          return null
        }
        return (
          <Button
            variant='outlined'
            size='small'
            startIcon={<EditIcon />}
            onClick={() => onEdit(branch)}
          >
            編集
          </Button>
        )
      },
    },
  ]
  return (
    <>
      <main>
        <Box sx={{ width: '100%' }}>
          <DataGrid columns={columns} rows={rows} />
        </Box>
      </main>
    </>
  )
}
