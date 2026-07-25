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
  updateErrorMessage: string | null
}

export function List({
  categories,
  getEditingRow,
  onEditChange,
  onUpdate,
  savingCategoryId,
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
              <TableCell align='right' sx={{ width: 120 }}>
                操作
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => {
              const rowValues = getEditingRow(category)
              const isSaving = savingCategoryId === category.id
              return (
                <TableRow key={category.id}>
                  <TableCell>{category.id}</TableCell>
                  <TableCell>
                    <TextField
                      size='small'
                      name='name'
                      value={rowValues.name}
                      disabled={isSaving}
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
                        disabled={isSaving}
                        onChange={onEditChange(category, 'color')}
                        fullWidth
                      />
                    </Stack>
                  </TableCell>
                  <TableCell align='right'>
                    <Button
                      variant='outlined'
                      size='small'
                      startIcon={<SaveIcon />}
                      disabled={isSaving}
                      onClick={() => onUpdate(category)}
                    >
                      {isSaving ? '保存中' : '保存'}
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
