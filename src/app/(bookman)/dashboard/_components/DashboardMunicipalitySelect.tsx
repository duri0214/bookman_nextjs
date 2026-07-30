'use client'

import { useRouter } from 'next/navigation'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import { MunicipalityOption } from './dashboardSummary'

interface Props {
  municipalityOptions: MunicipalityOption[]
  selectedMunicipalityId: number | null
}

export function DashboardMunicipalitySelect({
  municipalityOptions,
  selectedMunicipalityId,
}: Props) {
  const router = useRouter()

  return (
    <TextField
      select
      fullWidth
      size='small'
      label='自治体'
      value={selectedMunicipalityId?.toString() ?? ''}
      onChange={(event) => {
        const municipalityId = event.target.value
        router.push(municipalityId ? `/dashboard?municipalityId=${municipalityId}` : '/dashboard')
      }}
      sx={{ minWidth: { xs: '100%', md: 240 } }}
    >
      {municipalityOptions.length === 0 && <MenuItem value=''>自治体なし</MenuItem>}
      {municipalityOptions.map((municipality) => (
        <MenuItem key={municipality.id} value={municipality.id.toString()}>
          {municipality.name}
        </MenuItem>
      ))}
    </TextField>
  )
}
