import { ChangeEvent, useState } from 'react'
import { IBranchRequest } from '@/resource/branch'

export function useCreateDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formValues, setFormValues] = useState<Partial<IBranchRequest>>({})

  const openDialog = () => {
    setIsDialogOpen(true)
  }

  const onCloseDialog = () => {
    setIsDialogOpen(false)
    setFormValues({})
  }

  /**
   * Updates the values of the branch state based on the input change.
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
    // ... create branch logic
    console.log(formValues)
    setFormValues({})
  }

  return { isDialogOpen, openDialog, onCloseDialog, formValues, onInputChange, onCreate }
}
