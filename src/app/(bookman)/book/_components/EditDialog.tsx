import {
  Alert,
  Button,
  Checkbox,
  Link as MuiLink,
  ListItemText,
  MenuItem,
  TextField,
} from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import { ChangeEvent } from 'react'
import { Author } from '@/resource/author'
import { Category } from '@/resource/category'
import { Book, IBookFormValues } from '@/resource/book'

interface EditDialogProps {
  selectedBook: Book | null
  isEditDialogOpen: boolean
  onCloseEditDialog: () => void
  onInputChange: (event: ChangeEvent<HTMLInputElement>) => void
  onUpdate: () => Promise<void>
  formValues: Partial<IBookFormValues>
  isUpdating: boolean
  updateErrorMessage: string | null
  authors: Author[]
  categories: Category[]
}

export const EditDialog = ({
  selectedBook,
  isEditDialogOpen,
  onCloseEditDialog,
  onInputChange,
  onUpdate,
  formValues,
  isUpdating,
  updateErrorMessage,
  authors,
  categories,
}: EditDialogProps) => {
  const selectedAuthorIds = (formValues.authors ?? '').split(',').filter(Boolean)

  return (
    <Dialog open={isEditDialogOpen} onClose={onCloseEditDialog}>
      <DialogTitle>{selectedBook ? `${selectedBook.name}を編集` : '書籍編集'}</DialogTitle>
      <DialogContent>
        {updateErrorMessage && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {updateErrorMessage}
          </Alert>
        )}
        <TextField
          select
          autoFocus
          margin='dense'
          id='edit-category'
          name='category'
          label='カテゴリ'
          fullWidth
          value={formValues.category ?? ''}
          disabled={isUpdating}
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
          id='edit-name'
          name='name'
          label='名前'
          fullWidth
          value={formValues.name ?? ''}
          disabled={isUpdating}
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
          id='edit-authors'
          name='authors'
          label='著者'
          fullWidth
          value={selectedAuthorIds}
          disabled={isUpdating}
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
          id='edit-lead-text'
          name='lead_text'
          label='あらすじ'
          fullWidth
          multiline
          value={formValues.lead_text ?? ''}
          disabled={isUpdating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='edit-isbn'
          name='isbn'
          label='ISBN'
          placeholder='例: 9784062938426'
          helperText={
            <>
              ISBN-10またはISBN-13を半角数字のみで入力してください。
              <MuiLink
                href='https://isbn.jpo.or.jp/index.php/fix__about/fix__about_3/'
                target='_blank'
                rel='noopener noreferrer'
              >
                ISBNと書籍JANコードとは
              </MuiLink>
            </>
          }
          fullWidth
          slotProps={{
            htmlInput: {
              inputMode: 'numeric',
              pattern: '[0-9]*',
            },
          }}
          value={formValues.isbn ?? ''}
          disabled={isUpdating}
          onChange={onInputChange}
        />
        <TextField
          margin='dense'
          id='edit-publication-date'
          name='publication_date'
          label='出版年月日'
          type='date'
          helperText='カレンダーから選択できます。'
          fullWidth
          value={formValues.publication_date ?? ''}
          disabled={isUpdating}
          onChange={onInputChange}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onCloseEditDialog} color='primary' disabled={isUpdating}>
          キャンセル
        </Button>
        <Button onClick={onUpdate} color='primary' disabled={isUpdating}>
          {isUpdating ? '保存中' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
