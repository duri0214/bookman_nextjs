import { Alert, Button, Checkbox, ListItemText, MenuItem, TextField } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { ChangeEvent } from 'react'
import { Author } from '@/resource/author'
import { Category } from '@/resource/category'
import { IBookFormValues } from '@/resource/book'

interface CreateDialogProps {
  isDialogOpen: boolean
  onCloseDialog: () => void
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onCreate: () => Promise<void>
  formValues: Partial<IBookFormValues>
  isCreating: boolean
  createErrorMessage: string | null
  authors: Author[]
  categories: Category[]
}

export const CreateDialog = ({
  isDialogOpen,
  onCloseDialog,
  onInputChange,
  onCreate,
  formValues,
  isCreating,
  createErrorMessage,
  authors,
  categories,
}: CreateDialogProps) => {
  const selectedAuthorIds = (formValues.authors ?? '').split(',').filter(Boolean)

  return (
    <Dialog open={isDialogOpen} onClose={onCloseDialog}>
      <DialogTitle>新規登録</DialogTitle>
      <DialogContent>
        {createErrorMessage && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {createErrorMessage}
          </Alert>
        )}
        <TextField
          select
          autoFocus
          margin='dense'
          id='category'
          name='category'
          label='カテゴリ'
          helperText='カテゴリ管理で追加した分類も選択できます。'
          fullWidth
          value={formValues.category ?? ''}
          disabled={isCreating}
          onChange={onInputChange}
        >
          {categories.map((category) => (
            <MenuItem key={category.id} value={String(category.id)}>
              {category.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          margin='dense'
          id='name'
          name='name'
          label='名前'
          fullWidth
          value={formValues.name ?? ''}
          disabled={isCreating}
          onChange={onInputChange}
        />
        <TextField
          select
          slotProps={{
            select: {
              multiple: true,
              renderValue: (selected) =>
                (selected as string[])
                  .map((authorId) => authors.find((author) => String(author.id) === authorId)?.name)
                  .filter(Boolean)
                  .join(', '),
            },
          }}
          margin='dense'
          id='authors'
          name='authors'
          label='著者'
          helperText='複数の著者を選択できます。追加した著者は登録後に候補へ反映されます。'
          fullWidth
          value={selectedAuthorIds}
          disabled={isCreating}
          onChange={(event) => {
            const value = event.target.value
            onInputChange({
              target: {
                name: 'authors',
                value: Array.isArray(value) ? value.join(',') : value,
              },
            } as ChangeEvent<HTMLInputElement>)
          }}
        >
          {authors.map((author) => {
            const authorId = String(author.id)
            return (
              <MenuItem key={author.id} value={authorId}>
                <Checkbox checked={selectedAuthorIds.includes(authorId)} />
                <ListItemText primary={author.name} />
              </MenuItem>
            )
          })}
        </TextField>
        <TextField
          margin='dense'
          id='lead_text'
          name='lead_text'
          label='あらすじ'
          fullWidth
          multiline
          value={formValues.lead_text ?? ''}
          disabled={isCreating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='amount'
          name='amount'
          label='数量'
          fullWidth
          value={formValues.amount ?? ''}
          disabled={isCreating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='isbn'
          name='isbn'
          label='ISBN'
          fullWidth
          value={formValues.isbn ?? ''}
          disabled={isCreating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='publication_date'
          name='publication_date'
          label='出版年月日'
          fullWidth
          value={formValues.publication_date ?? ''}
          disabled={isCreating}
          onChange={onInputChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseDialog} color='primary' disabled={isCreating}>
          キャンセル
        </Button>
        <Button onClick={onCreate} color='primary' disabled={isCreating}>
          {isCreating ? '登録中' : '登録'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
