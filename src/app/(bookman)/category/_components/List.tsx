'use client'

import {
  Alert,
  Box,
  Button,
  Stack,
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
import { Category, ICategoryFormValues } from '@/resource/category'

interface Props {
  categories: Category[]
  getEditingRow: (category: Category) => ICategoryFormValues
  onEditChange: (
    category: Category,
    fieldName: keyof ICategoryFormValues,
  ) => (event: ChangeEvent<HTMLInputElement>) => void
  onUpdate: (category: Category) => Promise<void>
  savingCategoryId: number | null
  onDelete: (category: Category) => Promise<void>
  deletingCategoryId: number | null
  updateErrorMessage: string | null
}

export function List({
  categories,
  getEditingRow,
  onEditChange,
  onUpdate,
  savingCategoryId,
  onDelete,
  deletingCategoryId,
  updateErrorMessage,
}: Props) {
  if (!categories || categories.length === 0) {
    return <Typography variant='body1'>カテゴリデータはまだありません。</Typography>
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
              <TableCell>カテゴリ名</TableCell>
              <TableCell sx={{ width: 260 }}>表示色</TableCell>
              <TableCell align='right' sx={{ width: 210 }}>
                操作
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => {
              const rowValues = getEditingRow(category)
              const isSaving = savingCategoryId === category.id
              const isDeleting = deletingCategoryId === category.id
              const isProcessing = isSaving || isDeleting
              return (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell>
                    <TextField
                      size='small'
                      name='name'
                      value={rowValues.name}
                      disabled={isProcessing}
                      onChange={onEditChange(category, 'name')}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: 1,
                          bgcolor: rowValues.color,
                          border: '1px solid',
                          borderColor: 'divider',
                          flex: '0 0 auto',
                        }}
                      />
                      <TextField
                        size='small'
                        name='color'
                        value={rowValues.color}
                        disabled={isProcessing}
                        onChange={onEditChange(category, 'color')}
                        fullWidth
                      />
                    </Stack>
                  </TableCell>
                  <TableCell align='right'>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        variant='outlined'
                        size='small'
                        startIcon={<SaveIcon />}
                        disabled={isProcessing}
                        onClick={() => onUpdate(category)}
                      >
                        {isSaving ? '保存中' : '保存'}
                      </Button>
                      <Button
                        variant='outlined'
                        color='error'
                        size='small'
                        startIcon={<DeleteIcon />}
                        disabled={isProcessing}
                        onClick={() => onDelete(category)}
                      >
                        {isDeleting ? '削除中' : '削除'}
                      </Button>
                    </Box>
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
