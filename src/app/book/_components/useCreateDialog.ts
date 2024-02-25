import { ChangeEvent, useState } from 'react'
import { IBookRequest } from '@/resource/book'

export function useCreateDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formValues, setFormValues] = useState<Partial<IBookRequest>>({})

  const openDialog = () => {
    setIsDialogOpen(true)
  }

  const onCloseDialog = () => {
    setIsDialogOpen(false)
    setFormValues({})
  }

  /**
   * Updates the values of the book state based on the input change.
   *
   * @param {ChangeEvent<HTMLInputElement>} event - The input change event.
   * @returns {void}
   */
  const onInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setFormValues((formValues) => ({
      ...formValues,
      [event.target.name]: event.target.value,
    }))
  }

  const onCreate = () => {
    // ... create book logic
    console.log(formValues)
    onCloseDialog()
  }

  return { isDialogOpen, openDialog, onCloseDialog, formValues, onInputChange, onCreate }
}
