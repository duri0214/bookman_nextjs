'use client'

import {
  Alert,
  Box,
  Button,
  MenuItem,
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
import { Branch } from '@/resource/branch'
import { IStaffFormValues, STAFF_ROLE_LABELS, Staff } from '@/resource/staff'

interface Props {
  branches: Branch[]
  staff: Staff[]
  getEditingRow: (staff: Staff) => IStaffFormValues
  onEditChange: (
    staff: Staff,
    fieldName: keyof IStaffFormValues,
  ) => (event: ChangeEvent<HTMLInputElement>) => void
  onUpdate: (staff: Staff) => Promise<void>
  savingStaffId: number | null
  updateErrorMessage: string | null
}

export function List({
  branches,
  staff,
  getEditingRow,
  onEditChange,
  onUpdate,
  savingStaffId,
  updateErrorMessage,
}: Props) {
  if (!staff || staff.length === 0) {
    return <Typography variant='body1'>職員データはまだありません。</Typography>
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
              <TableCell>職員名</TableCell>
              <TableCell>所属支店</TableCell>
              <TableCell>ロール</TableCell>
              <TableCell align='right' sx={{ width: 120 }}>
                操作
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((staffMember) => {
              const rowValues = getEditingRow(staffMember)
              const isSaving = savingStaffId === staffMember.id
              return (
                <TableRow key={staffMember.id}>
                  <TableCell>{staffMember.id}</TableCell>
                  <TableCell>
                    <TextField
                      size='small'
                      name='name'
                      value={rowValues.name}
                      disabled={isSaving}
                      onChange={onEditChange(staffMember, 'name')}
                      fullWidth
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      select
                      size='small'
                      name='branch'
                      value={rowValues.branch}
                      disabled={isSaving}
                      onChange={onEditChange(staffMember, 'branch')}
                      fullWidth
                    >
                      <MenuItem value=''>未所属</MenuItem>
                      {branches.map((branch) => (
                        <MenuItem key={branch.id} value={String(branch.id)}>
                          {branch.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell>
                    <TextField
                      select
                      size='small'
                      name='role'
                      value={rowValues.role}
                      disabled={isSaving}
                      onChange={onEditChange(staffMember, 'role')}
                      fullWidth
                    >
                      {Object.entries(STAFF_ROLE_LABELS).map(([role, label]) => (
                        <MenuItem key={role} value={role}>
                          {label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </TableCell>
                  <TableCell align='right'>
                    <Button
                      variant='outlined'
                      size='small'
                      startIcon={<SaveIcon />}
                      disabled={isSaving}
                      onClick={() => onUpdate(staffMember)}
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
