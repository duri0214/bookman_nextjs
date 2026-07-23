'use client'

import { useMemo, useState } from 'react'
import { Alert, Box, Button, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { SearchConditionPanel } from '../../_components/SearchConditionPanel'
import { Customer } from '@/resource/customer'
import { BranchBookStock, Lending, LibraryStaff } from '@/resource/lending'
import { Reservation } from '@/resource/reservation'
import { useLendingActions } from './useLendingActions'

interface Props {
  customers: Customer[]
  staffMembers: LibraryStaff[]
  branchBookStocks: BranchBookStock[]
  lendings: Lending[]
  heldReservations: Reservation[]
  errorMessage: string | null
  isMockData: boolean
}

interface LendingFilters {
  [key: string]: unknown
  branchId: string
  dueWithinDays: string
}

const normalizeLendingFilters = (conditions: Record<string, unknown>): LendingFilters => ({
  branchId: typeof conditions.branchId === 'string' ? conditions.branchId : '',
  dueWithinDays: typeof conditions.dueWithinDays === 'string' ? conditions.dueWithinDays : '',
})

const isDueWithinDays = (returnDate: string, daysText: string): boolean => {
  if (!daysText) {
    return true
  }

  const days = Number(daysText)
  if (!Number.isInteger(days) || days < 0) {
    return true
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(returnDate)
  target.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((target.getTime() - today.getTime()) / 86400000)

  return diffDays >= 0 && diffDays <= days
}

export function PageClient({
  customers,
  staffMembers,
  branchBookStocks,
  lendings,
  heldReservations,
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
    returnDateAdjustmentMessage,
    selectedStock,
    selectedHeldReservation,
  } = useLendingActions(branchBookStocks, heldReservations)
  const [filters, setFilters] = useState<LendingFilters>({
    branchId: '',
    dueWithinDays: '',
  })

  const activeLendings = useMemo(
    () =>
      lendings.filter(
        (lending) =>
          lending.active &&
          (filters.branchId === '' ||
            branchBookStocks.some(
              (stock) =>
                stock.id === lending.branchBookStockId &&
                String(stock.branchId) === filters.branchId,
            )) &&
          isDueWithinDays(lending.returnDate, filters.dueWithinDays),
      ),
    [branchBookStocks, filters, lendings],
  )
  const selectedStockActiveLendingCount = selectedStock
    ? activeLendings.filter((lending) => lending.branchBookStockId === selectedStock.id).length
    : 0
  const selectedStockHeldReservationCount = selectedStock
    ? heldReservations.filter((reservation) => reservation.branchBookStockId === selectedStock.id)
        .length
    : 0
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
          {heldReservations.length > 0 && (
            <Alert severity='info'>
              取り置き中の利用者が{heldReservations.length}
              名います。取り置き分は貸出可能冊数から差し引かれています。
              <Typography variant='body2' sx={{ mt: 0.5 }}>
                {heldReservations
                  .map(
                    (reservation) =>
                      `${reservation.bookName} / ${reservation.branchName}: ${reservation.customerName}`,
                  )
                  .join('、')}
              </Typography>
            </Alert>
          )}
          {message && <Alert severity={messageSeverity}>{message}</Alert>}
          {returnDateAdjustmentMessage && (
            <Alert severity='info'>
              <Typography variant='body2'>
                支店: {returnDateAdjustmentMessage.branchName || '支店未設定'}
              </Typography>
              <Typography variant='body2'>
                元の返却予定日: {returnDateAdjustmentMessage.originalReturnDate}
              </Typography>
              <Typography variant='body2'>
                調整後の返却予定日: {returnDateAdjustmentMessage.adjustedReturnDate}
              </Typography>
              <Typography variant='body2'>
                休館理由: {returnDateAdjustmentMessage.reason}
              </Typography>
            </Alert>
          )}
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
            <Box sx={{ display: 'grid', gap: 0.5 }}>
              <Typography variant='body2' color='text.secondary'>
                {selectedStock.bookName} / {selectedStock.branchName} の内訳
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Typography variant='body2'>所蔵数 {selectedStock.amount}冊</Typography>
                <Typography variant='body2'>貸出中 {selectedStockActiveLendingCount}冊</Typography>
                <Typography variant='body2'>
                  取り置き中 {selectedStockHeldReservationCount}冊
                </Typography>
                <Typography variant='body2'>貸出可能 {selectedStock.availableAmount}冊</Typography>
              </Stack>
              {selectedHeldReservation && (
                <Typography variant='body2' color='success.main'>
                  {selectedHeldReservation.customerName}
                  は取り置き中のため、この本を貸出登録できます。
                </Typography>
              )}
            </Box>
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
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
            <TextField
              select
              size='small'
              label='支店'
              value={filters.branchId}
              onChange={(event) =>
                setFilters((current) => ({ ...current, branchId: event.target.value }))
              }
              sx={{ minWidth: 220 }}
            >
              <MenuItem value=''>すべて</MenuItem>
              {Array.from(
                new Map(branchBookStocks.map((stock) => [stock.branchId, stock.branchName])),
              ).map(([branchId, branchName]) => (
                <MenuItem key={branchId} value={String(branchId)}>
                  {branchName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size='small'
              label='返却期限'
              value={filters.dueWithinDays}
              onChange={(event) =>
                setFilters((current) => ({ ...current, dueWithinDays: event.target.value }))
              }
              sx={{ minWidth: 180 }}
            >
              <MenuItem value=''>すべて</MenuItem>
              <MenuItem value='3'>3日以内</MenuItem>
              <MenuItem value='7'>7日以内</MenuItem>
              <MenuItem value='14'>14日以内</MenuItem>
            </TextField>
          </Stack>
          {activeLendings.length === 0 ? (
            <Typography variant='body1'>貸出中のデータはまだありません。</Typography>
          ) : (
            <Box sx={{ width: '100%' }}>
              <DataGrid columns={columns} rows={rows} />
            </Box>
          )}
        </Paper>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <SearchConditionPanel
            targetScreen='lendings'
            title='貸出一覧の保存条件'
            staffMembers={staffMembers}
            currentConditions={filters}
            onApply={(conditions) => setFilters(normalizeLendingFilters(conditions))}
          />
        </Paper>
      </Grid>
    </Grid>
  )
}
