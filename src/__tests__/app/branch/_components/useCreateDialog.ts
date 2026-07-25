import { ChangeEvent } from 'react'
import { act, renderHook } from '@testing-library/react'
import { useCreateDialog } from '@/app/branch/_components/useCreateDialog'

const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

describe('useCreateDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  /**
   * シナリオ:
   * - 入力: 初期状態の支店登録 hook。
   * - 処理: openDialog を呼び出す。
   * - 期待値: 登録ダイアログが開くこと。
   */
  test('openDialogが呼び出された時にダイアログが開くべき', () => {
    const { result } = renderHook(useCreateDialog)
    act(() => {
      result.current.openDialog()
    })
    expect(result.current.isDialogOpen).toBe(true)
  })

  /**
   * シナリオ:
   * - 入力: 初期状態の支店登録 hook。
   * - 処理: onCloseDialog を呼び出す。
   * - 期待値: 登録ダイアログが閉じること。
   */
  test('closeDialogが呼び出された時にダイアログが閉じるべき', () => {
    const { result } = renderHook(useCreateDialog)
    act(() => {
      result.current.onCloseDialog()
    })
    expect(result.current.isDialogOpen).toBe(false)
  })

  /**
   * シナリオ:
   * - 入力: name=testName / value=testValue の input change event。
   * - 処理: onInputChange を呼び出す。
   * - 期待値: formValues に入力値が反映されること。
   */
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

  /**
   * シナリオ:
   * - 入力: firstName と lastName の input change event。
   * - 処理: onInputChange を複数回呼び出す。
   * - 期待値: formValues に複数の入力値が保持されること。
   */
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

  /**
   * シナリオ:
   * - 入力: 支店登録 API が成功し、フォームに支店名が入力済みの状態。
   * - 処理: onCreate を呼び出す。
   * - 期待値: 登録 API に POST し、ダイアログを閉じて一覧を再取得すること。
   */
  test('onCreateが成功した時に支店登録APIへPOSTして一覧を再取得するべき', async () => {
    // Given
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(useCreateDialog)

    act(() => {
      result.current.openDialog()
      result.current.onInputChange({
        target: { name: 'name', value: 'テスト図書館' },
      } as ChangeEvent<HTMLInputElement>)
    })

    // When
    await act(async () => {
      await result.current.onCreate()
    })

    // Then
    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/branches', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        municipality: null,
        name: 'テスト図書館',
        address: '',
        phone: '',
        remark: '',
      }),
    })
    expect(result.current.isDialogOpen).toBe(false)
    expect(result.current.formValues).toEqual({})
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  /**
   * シナリオ:
   * - 入力: 支店登録 API が失敗する状態。
   * - 処理: onCreate を呼び出す。
   * - 期待値: ダイアログを開いたまま登録失敗メッセージを保持すること。
   */
  test('onCreateが失敗した時に登録失敗メッセージを保持するべき', async () => {
    // Given
    jest.mocked(global.fetch).mockResolvedValue({ ok: false } as Response)
    const { result } = renderHook(useCreateDialog)

    act(() => {
      result.current.openDialog()
    })

    // When
    await act(async () => {
      await result.current.onCreate()
    })

    // Then
    expect(result.current.isDialogOpen).toBe(true)
    expect(result.current.createErrorMessage).toBe(
      '支店データの登録に失敗しました。入力内容とバックエンドの状態を確認してください。',
    )
    expect(mockRefresh).not.toHaveBeenCalled()
  })
})
