import { ChangeEvent, useState } from 'react'
import { IBranchRequest } from '@/resource/branch'

export function useCreateBranchDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formValues, setFormValues] = useState<Partial<IBranchRequest>>({})

  const openDialog = () => {
    setIsDialogOpen(true)
  }

  const onCloseDialog = () => {
    setIsDialogOpen(false)
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

  const onCreateBranch = () => {
    // ... create branch logic
    console.log(formValues)
  }

  return { isDialogOpen, openDialog, onCloseDialog, formValues, onInputChange, onCreateBranch }
}
