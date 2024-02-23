'use client'
import { useEffect } from 'react'
import Toolbar from '@mui/material/Toolbar'
import { Copyright } from '@/components/Copyright'
import Container from '@mui/material/Container'
import { useBookList } from '@/app/book/_components/useBookList'
import { BookList } from './_components/BookList'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'

export default function Page() {
  const { handleLoadingBookList, books } = useBookList()
  useEffect(() => {
    handleLoadingBookList().catch((e) => console.error('データの取得に失敗しました: ', e))
  }, [])

  if (!books) {
    return <div>Loading...</div>
  }

  const props = {
    books,
  }

  return (
    <>
      <Toolbar />
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
              <BookList {...props} />
            </Paper>
          </Grid>
        </Grid>
        <Copyright sx={{ pt: 4 }} />
      </Container>
    </>
  )
}
