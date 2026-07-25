import { ChangeEvent } from 'react'
import { act, renderHook } from '@testing-library/react'
import { useCreateDialog } from '@/app/book/_components/useCreateDialog'

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
   * - 入力: 初期状態の書籍登録 hook。
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
   * - 入力: 初期状態の書籍登録 hook。
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
   * - 入力: 書籍登録 API が成功し、フォームに書籍情報が入力済みの状態。
   * - 処理: onCreate を呼び出す。
   * - 期待値: バックエンド契約に合わせた payload で POST し、一覧を再取得すること。
   */
  test('onCreateが成功した時に書籍登録APIへPOSTして一覧を再取得するべき', async () => {
    // Given
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(useCreateDialog)

    act(() => {
      result.current.openDialog()
      result.current.onInputChange({
        target: { name: 'category', value: '2' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'name', value: 'Bookman 入門' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'authors', value: '1, 2' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'lead_text', value: '紹介文' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'amount', value: '3' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'isbn', value: '9780000000001' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'publication_date', value: '2026-01-01' },
      } as ChangeEvent<HTMLInputElement>)
    })

    // When
    await act(async () => {
      await result.current.onCreate()
    })

    // Then
    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/books', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: 2,
        name: 'Bookman 入門',
        authors: [1, 2],
        lead_text: '紹介文',
        amount: 3,
        isbn: '9780000000001',
        publication_date: '2026-01-01',
      }),
    })
    expect(result.current.isDialogOpen).toBe(false)
    expect(result.current.formValues).toEqual({})
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  /**
   * シナリオ:
   * - 入力: 書籍登録 API が失敗する状態。
   * - 処理: onCreate を呼び出す。
   * - 期待値: ダイアログを開いたまま登録失敗メッセージを保持すること。
   */
  test('onCreateが失敗した時に登録失敗メッセージを保持するべき', async () => {
    // Given
    jest.mocked(global.fetch).mockResolvedValue({ ok: false } as Response)
    const { result } = renderHook(useCreateDialog)

    act(() => {
      result.current.openDialog()
      result.current.onInputChange({
        target: { name: 'authors', value: '1' },
      } as ChangeEvent<HTMLInputElement>)
    })

    // When
    await act(async () => {
      await result.current.onCreate()
    })

    // Then
    expect(result.current.isDialogOpen).toBe(true)
    expect(result.current.createErrorMessage).toBe(
      '書籍データの登録に失敗しました。入力内容とバックエンドの状態を確認してください。',
    )
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  /**
   * シナリオ:
   * - 入力: 著者が未選択の書籍登録フォーム。
   * - 処理: onCreate を呼び出す。
   * - 期待値: APIへPOSTせず、著者選択を促すエラーメッセージを保持すること。
   */
  test('onCreateが著者未選択時に書籍登録APIへPOSTしないべき', async () => {
    // Given
    const { result } = renderHook(useCreateDialog)

    act(() => {
      result.current.openDialog()
    })

    // When
    await act(async () => {
      await result.current.onCreate()
    })

    // Then
    expect(global.fetch).not.toHaveBeenCalled()
    expect(result.current.createErrorMessage).toBe('著者を1名以上選択してください。')
    expect(mockRefresh).not.toHaveBeenCalled()
  })
})
