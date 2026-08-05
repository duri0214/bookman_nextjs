'use client'

import {
  Alert,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import { ChangeEvent } from 'react'
import { Author, IAuthorFormValues } from '@/resource/author'

interface Props {
  authors: Author[]
  getEditingRow: (author: Author) => IAuthorFormValues
  onEditChange: (
    author: Author,
    fieldName: keyof IAuthorFormValues,
  ) => (event: ChangeEvent<HTMLInputElement>) => void
  onUpdate: (author: Author) => Promise<void>
  savingAuthorId: number | null
  onDelete: (author: Author) => Promise<void>
  deletingAuthorId: number | null
  updateErrorMessage: string | null
}

export function List({
  authors,
  getEditingRow,
  onEditChange,
  onUpdate,
  savingAuthorId,
  onDelete,
  deletingAuthorId,
  updateErrorMessage,
}: Props) {
  if (!authors || authors.length === 0) {
    return <Typography variant='body1'>著者データはまだありません。</Typography>
  }

  return (
    <Box sx={{ width: '100%' }}>
      {updateErrorMessage && (
        <Alert severity='error' sx={{ mb: 2 }}>
          {updateErrorMessage}
        </Alert>
      )}
      <TableContainer>
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 80 }}>#</TableCell>
              <TableCell>著者名</TableCell>
              <TableCell align='right' sx={{ width: 110 }}>
                保存
              </TableCell>
              <TableCell align='right' sx={{ width: 110 }}>
                削除
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {authors.map((author) => {
              const rowValues = getEditingRow(author)
              const isSaving = savingAuthorId === author.id
              const isDeleting = deletingAuthorId === author.id
              const isProcessing = isSaving || isDeleting
              return (
                <TableRow key={author.id}>
                  <TableCell>{author.id}</TableCell>
                  <TableCell>
                    <TextField
                      size='small'
                      name='name'
                      value={rowValues.name}
                      disabled={isProcessing}
                      onChange={onEditChange(author, 'name')}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell align='right'>
                    <Button
                      variant='outlined'
                      size='small'
                      startIcon={<SaveIcon />}
                      disabled={isProcessing}
                      onClick={() => onUpdate(author)}
                    >
                      {isSaving ? '保存中' : '保存'}
                    </Button>
                  </TableCell>
                  <TableCell align='right'>
                    <Button
                      variant='outlined'
                      color='error'
                      size='small'
                      startIcon={<DeleteIcon />}
                      disabled={isProcessing}
                      onClick={() => onDelete(author)}
                    >
                      {isDeleting ? '削除中' : '削除'}
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
