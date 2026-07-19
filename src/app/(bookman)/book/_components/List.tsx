import React from 'react'
import { Box, Button, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'
import { Book } from '@/resource/book'

interface Props {
  books: Book[]
  onTransferClick: (book: Book) => void
}

export function List({ books, onTransferClick }: Props) {
  if (!books || books.length === 0) {
    return <Typography variant='body1'>書籍データはまだありません。</Typography>
  }
  const rows: GridRowsProp = books.map((book, index) => ({
    id: book.id,
    rowNumber: index + 1,
    name: book.name,
    authors: book.authors,
    category: book.category?.name ?? '',
    leadText: book.leadText,
    totalAmount: book.totalAmount,
    branchStocks:
      book.branchStocks.length > 0
        ? book.branchStocks
            .map((branchStock) => `${branchStock.branchName}: ${branchStock.amount}冊`)
            .join(' / ')
        : '支店別所蔵なし',
    publicationDate: book.publicationDate,
  }))
  const columns: GridColDef[] = [
    { field: 'rowNumber', headerName: '#', width: 50 },
    { field: 'category', headerName: 'カテゴリ', width: 100 },
    { field: 'name', headerName: '名前', width: 200 },
    {
      field: 'transfer',
      headerName: '支店間移動',
      width: 120,
      sortable: false,
      renderCell: (params) => {
        const book = books.find((book) => book.id === params.id)
        return (
          <Button
            size='small'
            variant='outlined'
            disabled={!book || book.branchStocks.length === 0}
            onClick={() => book && onTransferClick(book)}
          >
            支店間移動
          </Button>
        )
      },
    },
    { field: 'authors', headerName: '著者', width: 150 },
    { field: 'totalAmount', headerName: '合計所蔵数', width: 100 },
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
