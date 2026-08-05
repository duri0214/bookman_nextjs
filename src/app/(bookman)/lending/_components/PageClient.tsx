'use client'

import { useMemo, useState } from 'react'
import { Alert, Box, Button, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { SearchConditionPanel } from '../../_components/SearchConditionPanel'
import { Customer } from '@/resource/customer'
import { BranchBookStock, Lending, LibraryStaff } from '@/resource/lending'
import { Reservation } from '@/resource/reservation'
import { useReservationActions } from '@/app/reservation/_components/useReservationActions'
import {
  filterActiveLendings,
  filterBranchBookStocks,
  getBranchOptions,
  getMunicipalityOptions,
  LendingFilters,
} from './lendingFilters'
import { useLendingActions } from './useLendingActions'

interface Props {
  customers: Customer[]
  staffMembers: LibraryStaff[]
  branchBookStocks: BranchBookStock[]
  lendings: Lending[]
  heldReservations: Reservation[]
  reservations: Reservation[]
  errorMessage: string | null
  isMockData: boolean
}

type ReservationFilter = 'open' | 'all'

interface ReservationFilters {
  [key: string]: unknown
  reservationFilter: ReservationFilter
  branchId: string
}

const normalizeLendingFilters = (conditions: Record<string, unknown>): LendingFilters => ({
  municipalityId: typeof conditions.municipalityId === 'string' ? conditions.municipalityId : '',
  branchId: typeof conditions.branchId === 'string' ? conditions.branchId : '',
  dueWithinDays: typeof conditions.dueWithinDays === 'string' ? conditions.dueWithinDays : '',
})

const normalizeReservationFilters = (conditions: Record<string, unknown>): ReservationFilters => ({
  reservationFilter: conditions.reservationFilter === 'all' ? 'all' : 'open',
  branchId: typeof conditions.branchId === 'string' ? conditions.branchId : '',
})

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
  return 'default'
}

export function PageClient({
  customers,
  staffMembers,
  branchBookStocks,
  lendings,
  heldReservations,
  reservations,
  errorMessage,
  isMockData,
}: Props) {
  const {
    branchBookStocks: displayBranchBookStocks,
    formValues,
    onInputChange,
    clearBranchBookStock,
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
  const {
    reservableBranchBookStocks,
    formValues: reservationFormValues,
    onInputChange: onReservationInputChange,
    onCreate: onCreateReservation,
    onCancel,
    onExpireDueHolds,
    isCreating: isCreatingReservation,
    cancelingReservationId,
    isExpiring,
    message: reservationMessage,
    messageSeverity: reservationMessageSeverity,
    selectedStock: selectedReservationStock,
    customersLendingSelectedBook,
  } = useReservationActions(branchBookStocks, lendings)
  const [filters, setFilters] = useState<LendingFilters>({
    municipalityId: '',
    branchId: '',
    dueWithinDays: '',
  })
  const [reservationFilters, setReservationFilters] = useState<ReservationFilters>({
    reservationFilter: 'open',
    branchId: '',
  })

  const municipalities = useMemo(() => getMunicipalityOptions(branchBookStocks), [branchBookStocks])
  const filteredBranchBookStocks = useMemo(
    () => filterBranchBookStocks(displayBranchBookStocks, filters),
    [displayBranchBookStocks, filters],
  )
  const branchOptions = useMemo(
    () => getBranchOptions(branchBookStocks, filters.municipalityId),
    [branchBookStocks, filters.municipalityId],
  )
  const activeLendings = useMemo(
    () => filterActiveLendings(lendings, branchBookStocks, filters),
    [branchBookStocks, filters, lendings],
  )
  const selectedStockActiveLendingCount = selectedStock
    ? activeLendings.filter((lending) => lending.branchBookStockId === selectedStock.id).length
    : 0
  const selectedStockHeldReservationCount = selectedStock
    ? heldReservations.filter((reservation) => reservation.branchBookStockId === selectedStock.id)
        .length
    : 0
  const hasReservableBranchBookStock = reservableBranchBookStocks.length > 0
  const branchBookStockHelperText =
    branchBookStocks.length === 0
      ? '支店別所蔵データがありません。'
      : filteredBranchBookStocks.length === 0
        ? '選択中の自治体・支店に該当する支店別所蔵データがありません。'
        : hasReservableBranchBookStock
          ? `${reservableBranchBookStocks.length}件の支店別所蔵が予約条件を満たしています。`
          : '貸出可能冊数が0冊の支店別所蔵がないため、現在予約できる本はありません。'
  const onMunicipalityFilterChange = (municipalityId: string) => {
    setFilters((current) => ({
      ...current,
      municipalityId,
      branchId: '',
    }))
    clearBranchBookStock()
  }
  const onBranchFilterChange = (branchId: string) => {
    setFilters((current) => ({ ...current, branchId }))
    clearBranchBookStock()
  }
  const filteredReservations = reservations.filter((reservation) => {
    if (reservationFilters.branchId !== '') {
      const stock = branchBookStocks.find((stock) => stock.id === reservation.branchBookStockId)
      if (String(stock?.branchId ?? '') !== reservationFilters.branchId) {
        return false
      }
    }
    if (reservationFilters.reservationFilter === 'all') {
      return true
    }
    return reservation.status === 'waiting' || reservation.status === 'held'
  })
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
  const lendingColumns: GridColDef[] = [
    { field: 'rowNumber', headerName: '#', width: 50 },
    { field: 'bookName', headerName: '本名', width: 220 },
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
    { field: 'branchName', headerName: '支店名', width: 160 },
    { field: 'customerName', headerName: '利用者名', width: 160 },
    { field: 'contactStaffName', headerName: '対応職員名', width: 160 },
    { field: 'returnDate', headerName: '返却予定日', width: 130 },
    { field: 'active', headerName: '状態', width: 100 },
  ]
  const reservationRows: GridRowsProp = filteredReservations.map((reservation, index) => ({
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
  const reservationColumns: GridColDef[] = [
    { field: 'rowNumber', headerName: '#', width: 50 },
    { field: 'bookName', headerName: '本名', width: 220 },
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
          return <Chip size='small' color='success' label='貸出準備' />
        }
        return <Typography variant='body2'>-</Typography>
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
            貸出・予約カウンター
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
                label='自治体'
                value={filters.municipalityId}
                onChange={(event) => onMunicipalityFilterChange(event.target.value)}
                fullWidth
              >
                <MenuItem value=''>すべての自治体</MenuItem>
                {municipalities.map(([municipalityId, municipalityName]) => (
                  <MenuItem key={municipalityId} value={municipalityId}>
                    {municipalityName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label='支店'
                value={filters.branchId}
                onChange={(event) => onBranchFilterChange(event.target.value)}
                fullWidth
              >
                <MenuItem value=''>選択中自治体の全支店</MenuItem>
                {branchOptions.map(([branchId, branchName]) => (
                  <MenuItem key={branchId} value={String(branchId)}>
                    {branchName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          <Typography variant='body2' color='text.secondary'>
            支店未選択時は、選択中自治体に属する全支店の所蔵と貸出中データを表示します。
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label='支店別所蔵'
                name='branchBookStock'
                value={formValues.branchBookStock}
                onChange={onInputChange}
                fullWidth
                disabled={filteredBranchBookStocks.length === 0 || isCreating}
              >
                {filteredBranchBookStocks.map((branchBookStock) => (
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
            予約登録
          </Typography>
          {hasReservableBranchBookStock ? (
            <Alert severity='success'>
              貸出可能冊数が0冊の支店別所蔵が{reservableBranchBookStocks.length}
              件あります。このまま利用者を選択して予約登録できます。
            </Alert>
          ) : (
            <Alert severity='warning'>
              貸出可能冊数が0冊の支店別所蔵がないため、現在予約できる本はありません。
            </Alert>
          )}
          <Typography variant='body2' color='text.secondary'>
            貸出できない本はこの画面内で予約へ進めます。同じ本を貸出中の利用者は予約できません。
          </Typography>
          {reservationMessage && (
            <Alert severity={reservationMessageSeverity}>{reservationMessage}</Alert>
          )}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                label='支店別所蔵'
                name='branchBookStock'
                value={reservationFormValues.branchBookStock}
                onChange={onReservationInputChange}
                fullWidth
                disabled={branchBookStocks.length === 0 || isCreatingReservation}
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
                value={reservationFormValues.customer}
                onChange={onReservationInputChange}
                fullWidth
                disabled={
                  customers.length === 0 || isCreatingReservation || !selectedReservationStock
                }
                helperText={
                  selectedReservationStock
                    ? '選択した本を貸出中の利用者は選択できません。'
                    : '先に支店別所蔵を選択してください。'
                }
              >
                {customers.map((customer) => (
                  <MenuItem
                    key={customer.id}
                    value={customer.id}
                    disabled={customersLendingSelectedBook.has(customer.id)}
                  >
                    {customer.name}（上限 {customer.maxLendingCount}冊）
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
          {selectedReservationStock && (
            <Typography variant='body2' color='text.secondary'>
              {selectedReservationStock.bookName} / {selectedReservationStock.branchName} は貸出可能{' '}
              {selectedReservationStock.availableAmount}冊です。
            </Typography>
          )}
          <Stack direction='row' spacing={1} sx={{ justifyContent: 'flex-end' }}>
            <Button variant='outlined' onClick={onExpireDueHolds} disabled={isExpiring}>
              期限切れを反映
            </Button>
            <Button
              variant='contained'
              onClick={onCreateReservation}
              disabled={isCreatingReservation}
            >
              予約登録
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
              label='自治体'
              value={filters.municipalityId}
              onChange={(event) => onMunicipalityFilterChange(event.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value=''>すべて</MenuItem>
              {municipalities.map(([municipalityId, municipalityName]) => (
                <MenuItem key={municipalityId} value={municipalityId}>
                  {municipalityName}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size='small'
              label='支店'
              value={filters.branchId}
              onChange={(event) => onBranchFilterChange(event.target.value)}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value=''>選択中自治体の全支店</MenuItem>
              {branchOptions.map(([branchId, branchName]) => (
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
              <DataGrid columns={lendingColumns} rows={rows} />
            </Box>
          )}
        </Paper>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' } }}
          >
            <Typography component='h2' variant='h6'>
              予約・取り置き一覧
            </Typography>
            <ToggleButtonGroup
              value={reservationFilters.reservationFilter}
              exclusive
              size='small'
              onChange={(_, value: ReservationFilter | null) => {
                if (value) {
                  setReservationFilters((current) => ({ ...current, reservationFilter: value }))
                }
              }}
              aria-label='予約一覧フィルタ'
            >
              <ToggleButton value='open'>未完了のみ</ToggleButton>
              <ToggleButton value='all'>すべて</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <Typography variant='body2' color='text.secondary'>
            取り置き期間は1週間です。
          </Typography>
          <TextField
            select
            size='small'
            label='支店'
            value={reservationFilters.branchId}
            onChange={(event) =>
              setReservationFilters((current) => ({ ...current, branchId: event.target.value }))
            }
            sx={{ maxWidth: 260 }}
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
          {filteredReservations.length === 0 ? (
            <Typography variant='body1'>
              {reservations.length === 0
                ? '予約データはまだありません。'
                : '選択中のフィルタに該当する予約データはありません。'}
            </Typography>
          ) : (
            <Box sx={{ width: '100%' }}>
              <DataGrid columns={reservationColumns} rows={reservationRows} />
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
            isMockData={isMockData}
          />
        </Paper>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <SearchConditionPanel
            targetScreen='reservations'
            title='予約一覧の保存条件'
            staffMembers={staffMembers}
            currentConditions={reservationFilters}
            onApply={(conditions) => setReservationFilters(normalizeReservationFilters(conditions))}
            isMockData={isMockData}
          />
        </Paper>
      </Grid>
    </Grid>
  )
}
