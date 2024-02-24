import { ChangeEvent } from 'react'
import { act, renderHook } from '@testing-library/react'
import { useCreateDialog } from '@/app/branch/_components/useCreateDialog'

describe('useCreateDialog', () => {
  test('openDialogが呼び出された時にダイアログが開くべき', () => {
    const { result } = renderHook(useCreateDialog)
    act(() => {
      result.current.openDialog()
    })
    expect(result.current.isDialogOpen).toBe(true)
  })

  test('closeDialogが呼び出された時にダイアログが閉じるべき', () => {
    const { result } = renderHook(useCreateDialog)
    act(() => {
      result.current.onCloseDialog()
    })
    expect(result.current.isDialogOpen).toBe(false)
  })

  test('handleInputChangeが呼び出された時にformValuesが更新されるべき', () => {
    const { result } = renderHook(useCreateDialog)
    const inputEvent = {
      target: { name: 'testName', value: 'testValue' },
    } as ChangeEvent<HTMLInputElement>
    act(() => {
      result.current.onInputChange(inputEvent)
    })
    expect(result.current.formValues).toEqual({ testName: 'testValue' })
  })

  test('handleInputChangeが複数回呼び出されたときにformValuesが複数回更新されるべき', () => {
    const { result } = renderHook(useCreateDialog)
    act(() => {
      result.current.onInputChange({
        target: { name: 'firstName', value: 'John' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'lastName', value: 'Doe' },
      } as ChangeEvent<HTMLInputElement>)
    })
    expect(result.current.formValues).toEqual({ firstName: 'John', lastName: 'Doe' })
  })
})
