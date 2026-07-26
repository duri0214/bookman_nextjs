import { ChangeEvent, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid'

const CSV_IMPORT_API_PATH = '/api/bookman/books/import-csv'

interface CsvImportDialogProps {
  isDialogOpen: boolean
  onCloseDialog: () => void
  selectedMunicipalityId: string
}

interface CsvImportError {
  row?: number
  field?: string
  message: string
}

interface CsvImportResponse {
  created_count?: number
  failed_count?: number
  errors?: CsvImportError[]
  message?: string
}

const formatResponseError = async (response: Response): Promise<string> => {
  try {
    const responseBody = (await response.json()) as CsvImportResponse
    if (responseBody.message) {
      return responseBody.message
    }
    if (responseBody.errors && responseBody.errors.length > 0) {
      return 'CSVの内容を確認してください。'
    }
  } catch {
    // Use generic message below.
  }

  return 'CSV登録に失敗しました。入力内容とバックエンドの状態を確認してください。'
}

export const CsvImportDialog = ({
  isDialogOpen,
  onCloseDialog,
  selectedMunicipalityId,
}: CsvImportDialogProps) => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [importErrorMessage, setImportErrorMessage] = useState<string | null>(null)
  const [resultErrors, setResultErrors] = useState<CsvImportError[]>([])
  const canImport = selectedFile !== null && !isImporting
  const rows: GridRowsProp = resultErrors.map((error, index) => ({
    id: index + 1,
    rowNumber: error.row ?? '',
    field: error.field ?? '',
    message: error.message,
  }))
  const columns: GridColDef[] = [
    { field: 'rowNumber', headerName: 'CSV行', width: 80 },
    { field: 'field', headerName: '項目', width: 140 },
    { field: 'message', headerName: 'エラー', flex: 1, minWidth: 360 },
  ]

  const resetDialog = () => {
    setSelectedFile(null)
    setFileName('')
    setImportMessage(null)
    setImportErrorMessage(null)
    setResultErrors([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const closeDialog = () => {
    if (isImporting) {
      return
    }
    resetDialog()
    onCloseDialog()
  }

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setImportMessage(null)
    setImportErrorMessage(null)
    setResultErrors([])
    if (!file) {
      return
    }

    setSelectedFile(file)
    setFileName(file.name)
  }

  const onImport = async () => {
    if (!selectedMunicipalityId) {
      setImportErrorMessage('自治体を選択してからCSVを登録してください。')
      return
    }

    if (!selectedFile) {
      setImportErrorMessage('CSVファイルを選択してください。')
      return
    }

    if (!selectedFile.name.toLowerCase().endsWith('.csv') && selectedFile.type !== 'text/csv') {
      setImportErrorMessage('CSVファイルを選択してください。')
      return
    }

    setIsImporting(true)
    setImportMessage(null)
    setImportErrorMessage(null)
    setResultErrors([])

    try {
      const formData = new FormData()
      formData.append('municipality', selectedMunicipalityId)
      formData.append('file', selectedFile)

      const response = await fetch(CSV_IMPORT_API_PATH, {
        method: 'POST',
        body: formData,
      })
      const responseBody = (await response.json()) as CsvImportResponse
      setResultErrors(responseBody.errors ?? [])

      if (!response.ok) {
        setImportErrorMessage(await formatResponseError(new Response(JSON.stringify(responseBody))))
        return
      }

      setImportMessage(
        `${responseBody.created_count ?? 0}件の書籍と初期所蔵を登録しました。${
          responseBody.failed_count ? ` エラー ${responseBody.failed_count}件。` : ''
        }`,
      )
      router.refresh()
    } catch {
      setImportErrorMessage('CSV登録に失敗しました。バックエンドの状態を確認してください。')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={isDialogOpen} onClose={closeDialog} maxWidth='lg' fullWidth>
      <DialogTitle>CSV登録</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {importMessage && <Alert severity='success'>{importMessage}</Alert>}
          {importErrorMessage && <Alert severity='error'>{importErrorMessage}</Alert>}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <Button
              variant='outlined'
              startIcon={<UploadFileIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              CSVファイル選択
            </Button>
          </Stack>
          <input
            ref={fileInputRef}
            type='file'
            accept='.csv,text/csv'
            hidden
            onChange={onFileChange}
          />
          {fileName && <Typography variant='body2'>{fileName} を選択中</Typography>}
          {resultErrors.length > 0 && (
            <Box sx={{ width: '100%' }}>
              <DataGrid columns={columns} rows={rows} autoHeight />
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={closeDialog} disabled={isImporting}>
          閉じる
        </Button>
        <Button onClick={onImport} disabled={!canImport} variant='contained'>
          {isImporting ? '登録中' : '登録'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
