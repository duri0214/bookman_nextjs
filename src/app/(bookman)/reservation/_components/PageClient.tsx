'use client'

import { Alert, Box, Button, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { Customer } from '@/resource/customer'
import { BranchBookStock } from '@/resource/lending'
import { Reservation } from '@/resource/reservation'
import { useReservationActions } from './useReservationActions'

interface Props {
  customers: Customer[]
  branchBookStocks: BranchBookStock[]
  reservations: Reservation[]
  errorMessage: string | null
  isMockData: boolean
}

const statusColor = (
  status: Reservation['status'],
): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
  if (status === 'held') {
    return 'success'
  }
  if (status === 'waiting') {
    return 'primary'
  }
  if (status === 'expired') {
    return 'warning'
  }
  if (status === 'canceled') {
    return 'default'
  }
  return 'default'
}

export function PageClient({
  customers,
  branchBookStocks,
  reservations,
  errorMessage,
  isMockData,
}: Props) {
  const {
    reservableBranchBookStocks,
    formValues,
    onInputChange,
    onCreate,
    onCancel,
    onExpireDueHolds,
    isCreating,
    cancelingReservationId,
    isExpiring,
    message,
    messageSeverity,
    selectedStock,
  } = useReservationActions(branchBookStocks)
  const hasReservableBranchBookStock = reservableBranchBookStocks.length > 0
  const branchBookStockHelperText =
    branchBookStocks.length === 0
      ? '支店別所蔵データがありません。'
      : hasReservableBranchBookStock
        ? '貸出可能冊数が0冊の支店別所蔵に予約できます。'
        : '貸出可能冊数が0冊の支店別所蔵がないため、現在予約できる本はありません。'

  const rows: GridRowsProp = reservations.map((reservation, index) => ({
    id: reservation.id,
    rowNumber: index + 1,
    bookName: reservation.bookName,
    branchName: reservation.branchName,
    customerName: reservation.customerName,
    status: reservation.status,
    statusLabel: reservation.statusLabel,
    holdExpiresOn: reservation.holdExpiresOn ?? '',
    createdAt: reservation.createdAt,
    needsStaffFollowUp: reservation.needsStaffFollowUp,
    isExpiredHold: reservation.isExpiredHold,
  }))

  const columns: GridColDef[] = [
    { field: 'rowNumber', headerName: '#', width: 50 },
    { field: 'bookName', headerName: '本名', width: 220 },
    { field: 'branchName', headerName: '支店名', width: 160 },
    { field: 'customerName', headerName: '利用者名', width: 160 },
    {
      field: 'statusLabel',
      headerName: '状態',
      width: 150,
      renderCell: (params) => (
        <Chip
          size='small'
          label={String(params.value)}
          color={statusColor(params.row.status)}
          variant={params.row.status === 'canceled' ? 'outlined' : 'filled'}
        />
      ),
    },
    { field: 'holdExpiresOn', headerName: '取り置き期限', width: 130 },
    {
      field: 'followUp',
      headerName: '後続対応',
      width: 210,
      sortable: false,
      renderCell: (params) => {
        if (params.row.isExpiredHold) {
          return <Chip size='small' color='warning' label='期限切れ確認' />
        }
        if (params.row.needsStaffFollowUp) {
          return <Chip size='small' color='success' label='TODO: 貸出準備' />
        }
        return <Typography variant='body2'>-</Typography>
      },
    },
    {
      field: 'cancel',
      headerName: '取消',
      width: 110,
      sortable: false,
      renderCell: (params) => {
        const canCancel = params.row.status === 'waiting' || params.row.status === 'held'
        return (
          <Button
            size='small'
            variant='outlined'
            onClick={() => onCancel(Number(params.id))}
            disabled={!canCancel || cancelingReservationId === Number(params.id)}
          >
            取消
          </Button>
        )
      },
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
            予約登録
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
                disabled={branchBookStocks.length === 0 || isCreating}
                helperText={branchBookStockHelperText}
              >
                {branchBookStocks.map((branchBookStock) => (
                  <MenuItem
                    key={branchBookStock.id}
                    value={branchBookStock.id}
                    disabled={branchBookStock.availableAmount > 0}
                  >
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
          </Grid>
          {selectedStock && (
            <Typography variant='body2' color='text.secondary'>
              {selectedStock.bookName} / {selectedStock.branchName} は貸出可能{' '}
              {selectedStock.availableAmount}冊です。
            </Typography>
          )}
          <Stack direction='row' spacing={1} sx={{ justifyContent: 'flex-end' }}>
            <Button variant='outlined' onClick={onExpireDueHolds} disabled={isExpiring}>
              期限切れを反映
            </Button>
            <Button variant='contained' onClick={onCreate} disabled={isCreating}>
              予約登録
            </Button>
          </Stack>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography component='h2' variant='h6'>
            予約・取り置き一覧
          </Typography>
          {reservations.length === 0 ? (
            <Typography variant='body1'>予約データはまだありません。</Typography>
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
