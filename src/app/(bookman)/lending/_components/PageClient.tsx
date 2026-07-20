'use client'

import { Alert, Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { Customer } from '@/resource/customer'
import { BranchBookStock, Lending, LibraryStaff } from '@/resource/lending'
import { useLendingActions } from './useLendingActions'

interface Props {
  customers: Customer[]
  staffMembers: LibraryStaff[]
  branchBookStocks: BranchBookStock[]
  lendings: Lending[]
  errorMessage: string | null
  isMockData: boolean
}

export function PageClient({
  customers,
  staffMembers,
  branchBookStocks,
  lendings,
  errorMessage,
  isMockData,
}: Props) {
  const {
    branchBookStocks: displayBranchBookStocks,
    formValues,
    onInputChange,
    onCreate,
    onReturn,
    isCreating,
    returningLendingId,
    message,
    messageSeverity,
    selectedStock,
  } = useLendingActions(branchBookStocks)

  const activeLendings = lendings.filter((lending) => lending.active)
  const rows: GridRowsProp = activeLendings.map((lending, index) => ({
    id: lending.id,
    rowNumber: index + 1,
    bookName: lending.bookName,
    branchName: lending.branchName,
    customerName: lending.customerName,
    contactStaffName: lending.contactStaffName,
    returnDate: lending.returnDate,
    active: lending.active ? '貸出中' : '返却済み',
  }))
  const columns: GridColDef[] = [
    { field: 'rowNumber', headerName: '#', width: 50 },
    { field: 'bookName', headerName: '本名', width: 220 },
    { field: 'branchName', headerName: '支店名', width: 160 },
    { field: 'customerName', headerName: '利用者名', width: 160 },
    { field: 'contactStaffName', headerName: '対応職員名', width: 160 },
    { field: 'returnDate', headerName: '返却予定日', width: 130 },
    { field: 'active', headerName: '状態', width: 100 },
    {
      field: 'return',
      headerName: '返却',
      width: 110,
      sortable: false,
      renderCell: (params) => (
        <Button
          size='small'
          variant='outlined'
          onClick={() => onReturn(Number(params.id))}
          disabled={returningLendingId === Number(params.id)}
        >
          返却
        </Button>
      ),
    },
  ]

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
          <Typography component='h2' variant='h6'>
            貸出登録
          </Typography>
          {message && <Alert severity={messageSeverity}>{message}</Alert>}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label='支店別所蔵'
                name='branchBookStock'
                value={formValues.branchBookStock}
                onChange={onInputChange}
                fullWidth
                disabled={displayBranchBookStocks.length === 0 || isCreating}
              >
                {displayBranchBookStocks.map((branchBookStock) => (
                  <MenuItem key={branchBookStock.id} value={branchBookStock.id}>
                    {branchBookStock.bookName} / {branchBookStock.branchName}（貸出可能{' '}
                    {branchBookStock.availableAmount}冊）
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label='利用者'
                name='customer'
                value={formValues.customer}
                onChange={onInputChange}
                fullWidth
                disabled={customers.length === 0 || isCreating}
              >
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name}（上限 {customer.maxLendingCount}冊）
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label='対応職員'
                name='contactStaff'
                value={formValues.contactStaff}
                onChange={onInputChange}
                fullWidth
                disabled={staffMembers.length === 0 || isCreating}
              >
                {staffMembers.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.name}
                    {staff.branchName ? ` / ${staff.branchName}` : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label='返却予定日'
                name='returnDate'
                type='date'
                value={formValues.returnDate}
                onChange={onInputChange}
                fullWidth
                disabled={isCreating}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
          </Grid>
          {selectedStock && (
            <Typography variant='body2' color='text.secondary'>
              {selectedStock.bookName} / {selectedStock.branchName} は貸出可能{' '}
              {selectedStock.availableAmount}冊です。
            </Typography>
          )}
          <Stack direction='row' sx={{ justifyContent: 'flex-end' }}>
            <Button variant='contained' onClick={onCreate} disabled={isCreating}>
              貸出登録
            </Button>
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography component='h2' variant='h6'>
            貸出中一覧
          </Typography>
          {activeLendings.length === 0 ? (
            <Typography variant='body1'>貸出中のデータはまだありません。</Typography>
          ) : (
            <Box sx={{ width: '100%' }}>
              <DataGrid columns={columns} rows={rows} />
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  )
}
