import React from 'react'
import { Box, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'
import { Book } from '@/resource/book'

interface Props {
  books: Book[]
}

export function BookList({ books }: Props) {
  if (!books || books.length === 0) {
    return <Typography variant='h5'>No data available.</Typography>
  }
  const rows: GridRowsProp = books.map((book, index) => ({
    id: index + 1,
    name: book.name,
    authors: book.authors,
    category: book.category.name,
    leadText: book.leadText,
  }))
  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', width: 50 },
    { field: 'category', headerName: 'カテゴリ', width: 100 },
    { field: 'name', headerName: '名前', width: 200 },
    { field: 'authors', headerName: '著者', width: 150 },
    { field: 'leadText', headerName: 'あらすじ', width: 450 },
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
