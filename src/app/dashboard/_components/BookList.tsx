import React from 'react'
import { Box, Typography } from '@mui/material'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'
import { Book } from '@/resource/book'

type Props = {
  books: Book[]
}

export function BookList({ books }: Props) {
  if (!books || books.length === 0) {
    return <Typography variant='h5'>No data available.</Typography>
  }
  const rows: GridRowsProp = books.map((book) => ({
    id: book.id,
    name: book.name,
    leadText: book.leadText,
  }))
  const columns: GridColDef[] = [
    { field: 'id', headerName: '#' },
    { field: 'name', headerName: '名前', width: 200 },
    { field: 'leadText', headerName: 'あらすじ', width: 800 },
  ]
  return (
    <>
      <main>
        <Box width='100%' marginTop={5}>
          <Typography variant='h4'>本の一覧</Typography>
          <DataGrid columns={columns} rows={rows} />
        </Box>
      </main>
    </>
  )
}
