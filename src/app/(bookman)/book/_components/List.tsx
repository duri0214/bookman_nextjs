import React from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { Box, Button, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'
import { Book } from '@/resource/book'

interface Props {
  books: Book[]
  onEditClick: (book: Book) => void
  onDeleteClick: (book: Book) => void
  onTransferClick: (book: Book) => void
  deletingBookId: number | null
}

export function List({
  books,
  onEditClick,
  onDeleteClick,
  onTransferClick,
  deletingBookId,
}: Props) {
  if (!books || books.length === 0) {
    return <Typography variant='body1'>書籍データはまだありません。</Typography>
  }
  const rows: GridRowsProp = books.map((book, index) => {
    const stockedBranches = book.branchStocks.filter((branchStock) => branchStock.amount > 0)

    return {
      id: book.id,
      rowNumber: index + 1,
      name: book.name,
      authors: book.authors,
      category: book.category?.name ?? '',
      leadText: book.leadText,
      totalAmount: book.totalAmount,
      branchStocks:
        stockedBranches.length > 0
          ? stockedBranches
              .map((branchStock) => `${branchStock.branchName}: ${branchStock.amount}冊`)
              .join(' / ')
          : '支店別所蔵なし',
      publicationDate: book.publicationDate,
    }
  })
  const columns: GridColDef[] = [
    { field: 'rowNumber', headerName: '#', width: 50 },
    { field: 'category', headerName: 'カテゴリ', width: 100 },
    { field: 'name', headerName: '名前', width: 200 },
    {
      field: 'edit',
      headerName: '編集',
      width: 110,
      sortable: false,
      renderCell: (params) => {
        const book = books.find((book) => book.id === params.id)
        const isDeleting = deletingBookId === Number(params.id)
        return (
          <Button
            size='small'
            variant='outlined'
            startIcon={<EditIcon />}
            disabled={isDeleting}
            onClick={() => book && onEditClick(book)}
          >
            編集
          </Button>
        )
      },
    },
    {
      field: 'delete',
      headerName: '削除',
      width: 110,
      sortable: false,
      renderCell: (params) => {
        const book = books.find((book) => book.id === params.id)
        const isDeleting = deletingBookId === Number(params.id)
        return (
          <Button
            size='small'
            variant='outlined'
            color='error'
            startIcon={<DeleteIcon />}
            disabled={isDeleting}
            onClick={() => book && onDeleteClick(book)}
          >
            {isDeleting ? '削除中' : '削除'}
          </Button>
        )
      },
    },
    {
      field: 'transfer',
      headerName: '支店間移動',
      width: 120,
      sortable: false,
      renderCell: (params) => {
        const book = books.find((book) => book.id === params.id)
        const canTransfer =
          !!book && book.branchStocks.some((branchStock) => branchStock.amount > 0)
        return (
          <Button
            size='small'
            variant='outlined'
            disabled={!canTransfer}
            onClick={() => book && onTransferClick(book)}
          >
            支店間移動
          </Button>
        )
      },
    },
    { field: 'authors', headerName: '著者', width: 150 },
    {
      field: 'totalAmount',
      headerName: '自治体所蔵数',
      width: 120,
      align: 'right',
    },
    { field: 'branchStocks', headerName: '支店別所蔵数', width: 320 },
    { field: 'leadText', headerName: 'あらすじ', width: 400 },
    { field: 'publicationDate', headerName: '出版年月日', width: 120 },
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
