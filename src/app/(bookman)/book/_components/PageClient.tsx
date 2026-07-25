'use client'

import { useMemo, useState } from 'react'
import { Alert, Button, MenuItem, Stack, TextField } from '@mui/material'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { SearchConditionPanel } from '../../_components/SearchConditionPanel'
import { Book } from '@/resource/book'
import { Author } from '@/resource/author'
import { Category } from '@/resource/category'
import { Branch } from '@/resource/branch'
import { LibraryStaff } from '@/resource/lending'
import { Municipality } from '@/resource/municipality'
import { CreateDialog } from './CreateDialog'
import { List } from './List'
import { TransferDialog } from './TransferDialog'
import { useCreateDialog } from './useCreateDialog'
import { useTransferDialog } from './useTransferDialog'

interface Props {
  books: Book[]
  authors: Author[]
  categories: Category[]
  branches: Branch[]
  municipalities: Municipality[]
  staffMembers: LibraryStaff[]
  errorMessage: string | null
  isMockData: boolean
}

interface BookFilters {
  [key: string]: unknown
  keyword: string
  branchId: string
  stockedOnly: boolean
}

const normalizeBookFilters = (conditions: Record<string, unknown>): BookFilters => ({
  keyword: typeof conditions.keyword === 'string' ? conditions.keyword : '',
  branchId: typeof conditions.branchId === 'string' ? conditions.branchId : '',
  stockedOnly: conditions.stockedOnly === true,
})

export function PageClient({
  books,
  authors,
  categories,
  branches,
  municipalities,
  staffMembers,
  errorMessage,
  isMockData,
}: Props) {
  const [selectedMunicipalityId, setSelectedMunicipalityId] = useState(
    municipalities[0]?.id.toString() ?? '',
  )
  const [filters, setFilters] = useState<BookFilters>({
    keyword: '',
    branchId: '',
    stockedOnly: false,
  })
  const filteredBranches = useMemo(
    () =>
      branches.filter(
        (branch) =>
          selectedMunicipalityId !== '' && String(branch.municipalityId) === selectedMunicipalityId,
      ),
    [branches, selectedMunicipalityId],
  )
  const {
    isDialogOpen,
    openDialog,
    onCloseDialog,
    formValues,
    onInputChange,
    onCreate,
    isCreating,
    createErrorMessage,
  } = useCreateDialog(authors, categories, filteredBranches, selectedMunicipalityId)
  const {
    selectedBook,
    isTransferDialogOpen,
    openTransferDialog,
    onCloseTransferDialog,
    formValues: transferFormValues,
    onTransferInputChange,
    onTransfer,
    isTransferring,
    transferErrorMessage,
  } = useTransferDialog(selectedMunicipalityId)

  const dialogProps = {
    isDialogOpen,
    onCloseDialog,
    formValues,
    onInputChange,
    onCreate,
    isCreating,
    createErrorMessage,
    authors,
    categories,
    branches: filteredBranches,
  }
  const scopedBooks = useMemo(
    () =>
      books.map((book) => {
        const branchStocks = book.branchStocks.filter(
          (branchStock) =>
            selectedMunicipalityId !== '' &&
            String(branchStock.municipalityId) === selectedMunicipalityId,
        )

        return {
          ...book,
          branchStocks,
          totalAmount: branchStocks.reduce((total, branchStock) => total + branchStock.amount, 0),
        }
      }),
    [books, selectedMunicipalityId],
  )
  const filteredBooks = useMemo(
    () =>
      scopedBooks.filter((book) => {
        const keyword = filters.keyword.trim().toLowerCase()
        const matchesMunicipality = book.branchStocks.length > 0
        const matchesKeyword =
          keyword === '' ||
          [book.name, book.authors, book.category?.name ?? '', book.leadText].some((value) =>
            value.toLowerCase().includes(keyword),
          )
        const matchesBranch =
          filters.branchId === '' ||
          book.branchStocks.some((branchStock) => String(branchStock.branchId) === filters.branchId)
        const matchesStock =
          !filters.stockedOnly ||
          book.branchStocks.some(
            (branchStock) =>
              branchStock.amount > 0 &&
              (filters.branchId === '' || String(branchStock.branchId) === filters.branchId),
          )

        return matchesMunicipality && matchesKeyword && matchesBranch && matchesStock
      }),
    [filters, scopedBooks],
  )

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
      {municipalities.length === 0 && (
        <Grid size={{ xs: 12 }}>
          <Alert severity='warning'>
            自治体データがないため、支店別所蔵を自治体スコープで表示できません。
          </Alert>
        </Grid>
      )}
      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <Button variant='contained' color='primary' onClick={openDialog} sx={{ mb: 5 }}>
            新規登録
          </Button>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
            <TextField
              select
              size='small'
              label='自治体'
              value={selectedMunicipalityId}
              onChange={(event) => {
                setSelectedMunicipalityId(event.target.value)
                setFilters((current) => ({ ...current, branchId: '' }))
              }}
              sx={{ minWidth: 220 }}
            >
              {municipalities.map((municipality) => (
                <MenuItem key={municipality.id} value={String(municipality.id)}>
                  {municipality.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size='small'
              label='キーワード'
              value={filters.keyword}
              onChange={(event) =>
                setFilters((current) => ({ ...current, keyword: event.target.value }))
              }
              sx={{ flex: 1 }}
            />
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
              {filteredBranches.map((branch) => (
                <MenuItem key={branch.id} value={String(branch.id)}>
                  {branch.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size='small'
              label='所蔵'
              value={filters.stockedOnly ? 'stocked' : 'all'}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  stockedOnly: event.target.value === 'stocked',
                }))
              }
              sx={{ minWidth: 160 }}
            >
              <MenuItem value='all'>すべて</MenuItem>
              <MenuItem value='stocked'>所蔵あり</MenuItem>
            </TextField>
          </Stack>
          <List books={filteredBooks} onTransferClick={openTransferDialog} />
          <CreateDialog {...dialogProps} />
          <TransferDialog
            selectedBook={selectedBook}
            branches={filteredBranches}
            isTransferDialogOpen={isTransferDialogOpen}
            onCloseTransferDialog={onCloseTransferDialog}
            formValues={transferFormValues}
            onTransferInputChange={onTransferInputChange}
            onTransfer={onTransfer}
            isTransferring={isTransferring}
            transferErrorMessage={transferErrorMessage}
          />
        </Paper>
      </Grid>
      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
          <SearchConditionPanel
            targetScreen='books'
            title='書籍一覧の保存条件'
            staffMembers={staffMembers}
            currentConditions={filters}
            onApply={(conditions) => setFilters(normalizeBookFilters(conditions))}
          />
        </Paper>
      </Grid>
    </Grid>
  )
}
