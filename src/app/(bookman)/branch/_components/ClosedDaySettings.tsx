'use client'

import { Alert, Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'
import Grid from '@mui/material/Grid'
import { Branch, BranchClosedDay } from '@/resource/branch'
import { useBranchClosedDayActions } from './useBranchClosedDayActions'

interface Props {
  branches: Branch[]
  closedDays: BranchClosedDay[]
}

export function ClosedDaySettings({ branches, closedDays }: Props) {
  const {
    formValues,
    onInputChange,
    onCreate,
    onDelete,
    isCreating,
    deletingClosedDayId,
    message,
    messageSeverity,
  } = useBranchClosedDayActions(branches)

  const rows: GridRowsProp = closedDays.map((closedDay, index) => ({
    id: closedDay.id,
    rowNumber: index + 1,
    branchName: closedDay.branchName,
    date: closedDay.date,
    reason: closedDay.reason || '理由未設定',
  }))
  const columns: GridColDef[] = [
    { field: 'rowNumber', headerName: '#', width: 50 },
    { field: 'branchName', headerName: '支店名', width: 180 },
    { field: 'date', headerName: '休館日', width: 130 },
    { field: 'reason', headerName: '理由', flex: 1, minWidth: 180 },
    {
      field: 'delete',
      headerName: '削除',
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Button
          size='small'
          variant='outlined'
          color='error'
          onClick={() => onDelete(Number(params.id))}
          disabled={deletingClosedDayId === Number(params.id)}
        >
          削除
        </Button>
      ),
    },
  ]

  return (
    <Stack spacing={2}>
      <Typography component='h2' variant='h6'>
        休館日設定
      </Typography>
      {message && <Alert severity={messageSeverity}>{message}</Alert>}
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            select
            label='支店'
            name='branch'
            value={formValues.branch}
            onChange={onInputChange}
            fullWidth
            disabled={branches.length === 0 || isCreating}
          >
            {branches.map((branch) => (
              <MenuItem key={branch.id} value={branch.id}>
                {branch.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label='休館日'
            name='date'
            type='date'
            value={formValues.date}
            onChange={onInputChange}
            fullWidth
            disabled={isCreating}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TextField
            label='理由'
            name='reason'
            value={formValues.reason}
            onChange={onInputChange}
            fullWidth
            disabled={isCreating}
            placeholder='祝日、蔵書点検、臨時休館'
          />
        </Grid>
      </Grid>
      <Stack direction='row' sx={{ justifyContent: 'flex-end' }}>
        <Button variant='contained' onClick={onCreate} disabled={isCreating}>
          休館日を登録
        </Button>
      </Stack>
      {closedDays.length === 0 ? (
        <Typography variant='body1'>休館日はまだ登録されていません。</Typography>
      ) : (
        <Box sx={{ width: '100%' }}>
          <DataGrid columns={columns} rows={rows} />
        </Box>
      )}
    </Stack>
  )
}
