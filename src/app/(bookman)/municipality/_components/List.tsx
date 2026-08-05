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
import { IMunicipalityFormValues, Municipality } from '@/resource/municipality'

interface Props {
  municipalities: Municipality[]
  getEditingRow: (municipality: Municipality) => IMunicipalityFormValues
  onEditChange: (
    municipality: Municipality,
    fieldName: keyof IMunicipalityFormValues,
  ) => (event: ChangeEvent<HTMLInputElement>) => void
  onUpdate: (municipality: Municipality) => Promise<void>
  savingMunicipalityId: number | null
  onDelete: (municipality: Municipality) => Promise<void>
  deletingMunicipalityId: number | null
  updateErrorMessage: string | null
}

export function List({
  municipalities,
  getEditingRow,
  onEditChange,
  onUpdate,
  savingMunicipalityId,
  onDelete,
  deletingMunicipalityId,
  updateErrorMessage,
}: Props) {
  if (!municipalities || municipalities.length === 0) {
    return <Typography variant='body1'>自治体データはまだありません。</Typography>
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
              <TableCell>自治体名</TableCell>
              <TableCell align='right' sx={{ width: 210 }}>
                操作
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {municipalities.map((municipality) => {
              const rowValues = getEditingRow(municipality)
              const isSaving = savingMunicipalityId === municipality.id
              const isDeleting = deletingMunicipalityId === municipality.id
              const isProcessing = isSaving || isDeleting
              return (
                <TableRow key={municipality.id}>
                  <TableCell>{municipality.id}</TableCell>
                  <TableCell>
                    <TextField
                      size='small'
                      name='name'
                      value={rowValues.name}
                      disabled={isProcessing}
                      onChange={onEditChange(municipality, 'name')}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell align='right'>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button
                        variant='outlined'
                        size='small'
                        startIcon={<SaveIcon />}
                        disabled={isProcessing}
                        onClick={() => onUpdate(municipality)}
                      >
                        {isSaving ? '保存中' : '保存'}
                      </Button>
                      <Button
                        variant='outlined'
                        color='error'
                        size='small'
                        startIcon={<DeleteIcon />}
                        disabled={isProcessing}
                        onClick={() => onDelete(municipality)}
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
