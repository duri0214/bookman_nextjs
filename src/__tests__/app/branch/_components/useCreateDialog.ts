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
      target: { name: 'name', value: 'テスト図書館' },
    } as ChangeEvent<HTMLInputElement>
    act(() => {
      result.current.onInputChange(inputEvent)
    })
    expect(result.current.formValues).toEqual({
      municipality: '',
      name: 'テスト図書館',
      address: '',
      phone: '',
      remark: '',
    })
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
        target: { name: 'name', value: '中央図書館' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'phone', value: '000-9000-0000' },
      } as ChangeEvent<HTMLInputElement>)
    })
    expect(result.current.formValues).toEqual({
      municipality: '',
      name: '中央図書館',
      address: '',
      phone: '000-9000-0000',
      remark: '',
    })
  })

  /**
   * シナリオ:
   * - 入力: 支店登録 API が成功し、フォームに自治体と支店名が入力済みの状態。
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
        target: { name: 'municipality', value: '10' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'name', value: 'テスト図書館' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'address', value: 'テスト住所' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'phone', value: '000-9000-0000' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'remark', value: 'テスト備考' },
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
        municipality: 10,
        name: 'テスト図書館',
        address: 'テスト住所',
        phone: '000-9000-0000',
        remark: 'テスト備考',
      }),
    })
    expect(result.current.isDialogOpen).toBe(false)
    expect(result.current.formValues).toEqual({
      municipality: '',
      name: '',
      address: '',
      phone: '',
      remark: '',
    })
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  /**
   * シナリオ:
   * - 入力: 既存支店を編集ダイアログで開き、住所を変更した状態。
   * - 処理: onUpdate を呼び出す。
   * - 期待値: 支店更新 API に PATCH し、編集ダイアログを閉じて一覧を再取得すること。
   */
  test('onUpdateが成功した時に支店更新APIへPATCHして一覧を再取得するべき', async () => {
    // Given
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(useCreateDialog)

    act(() => {
      result.current.openEditDialog({
        id: 3,
        municipalityId: 10,
        municipalityName: '六戸町',
        name: '六戸町図書館',
        address: '旧住所',
        phone: '000-9000-0000',
        remark: '本館',
      })
      result.current.onEditInputChange({
        target: { name: 'address', value: '新住所' },
      } as ChangeEvent<HTMLInputElement>)
    })

    // When
    await act(async () => {
      await result.current.onUpdate()
    })

    // Then
    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/branches/3', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        municipality: 10,
        name: '六戸町図書館',
        address: '新住所',
        phone: '000-9000-0000',
        remark: '本館',
      }),
    })
    expect(result.current.editingBranch).toBeNull()
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  /**
   * シナリオ:
   * - 入力: 自治体が未選択の支店登録フォーム。
   * - 処理: onCreate を呼び出す。
   * - 期待値: APIへPOSTせず、必須項目の入力を促すエラーメッセージを保持すること。
   */
  test('onCreateが必須項目未入力時に支店登録APIへPOSTしないべき', async () => {
    // Given
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
    expect(global.fetch).not.toHaveBeenCalled()
    expect(result.current.isDialogOpen).toBe(true)
    expect(result.current.createErrorMessage).toBe('必須項目をすべて入力してください。')
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  /**
   * シナリオ:
   * - 入力: 支店登録 API が失敗する状態。
   * - 処理: onCreate を呼び出す。
   * - 期待値: ダイアログを開いたまま登録失敗メッセージを保持すること。
   */
  test('onCreateが失敗した時に登録失敗メッセージを保持するべき', async () => {
    // Given
    jest.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({ remark: ['This field may not be blank.'] }),
    } as unknown as Response)
    const { result } = renderHook(useCreateDialog)

    act(() => {
      result.current.openDialog()
      result.current.onInputChange({
        target: { name: 'municipality', value: '10' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'name', value: 'テスト図書館' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'address', value: 'テスト住所' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'phone', value: '000-9000-0000' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'remark', value: 'テスト備考' },
      } as ChangeEvent<HTMLInputElement>)
    })

    // When
    await act(async () => {
      await result.current.onCreate()
    })

    // Then
    expect(result.current.isDialogOpen).toBe(true)
    expect(result.current.createErrorMessage).toBe('備考: This field may not be blank.')
    expect(mockRefresh).not.toHaveBeenCalled()
  })
})
