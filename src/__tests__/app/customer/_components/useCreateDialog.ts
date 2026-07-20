import { ChangeEvent } from 'react'
import { act, renderHook } from '@testing-library/react'
import { useCreateDialog } from '@/app/customer/_components/useCreateDialog'

const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

describe('customer useCreateDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  test('onCreateが成功した時に利用者登録APIへPOSTして一覧を再取得するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 利用者名、電話番号、貸出上限数を入力済みで登録 API が成功する状態。
     * - 処理: onCreate を呼び出す。
     * - 期待値: max_lending_count を数値化して POST し、ダイアログを閉じて一覧を再取得すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(useCreateDialog)

    act(() => {
      result.current.openDialog()
      result.current.onInputChange({
        target: { name: 'name', value: ' 山田 太郎 ' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'phone', value: ' 03-0000-0001 ' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'max_lending_count', value: '5' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onCreate()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '山田 太郎',
        phone: '03-0000-0001',
        max_lending_count: 5,
      }),
    })
    expect(result.current.isDialogOpen).toBe(false)
    expect(result.current.formValues).toEqual({
      name: '',
      phone: '',
      max_lending_count: '',
    })
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  test('入力値が不正な時にAPIを呼ばず入力エラーを保持するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 利用者名が空で貸出上限数が0のフォーム。
     * - 処理: onCreate を呼び出す。
     * - 期待値: 登録 API を呼ばず、入力エラーメッセージを保持すること。
     */
    const { result } = renderHook(useCreateDialog)

    act(() => {
      result.current.openDialog()
      result.current.onInputChange({
        target: { name: 'max_lending_count', value: '0' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onCreate()
    })

    expect(global.fetch).not.toHaveBeenCalled()
    expect(result.current.isDialogOpen).toBe(true)
    expect(result.current.createErrorMessage).toBe('利用者名と貸出上限数を正しく入力してください。')
  })

  test('onCreateが失敗した時に登録失敗メッセージを保持するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 必須項目を入力済みで登録 API が失敗する状態。
     * - 処理: onCreate を呼び出す。
     * - 期待値: ダイアログを開いたまま登録失敗メッセージを保持すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: false } as Response)
    const { result } = renderHook(useCreateDialog)

    act(() => {
      result.current.openDialog()
      result.current.onInputChange({
        target: { name: 'name', value: '山田 太郎' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'max_lending_count', value: '5' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onCreate()
    })

    expect(result.current.isDialogOpen).toBe(true)
    expect(result.current.createErrorMessage).toBe(
      '利用者データの登録に失敗しました。入力内容とバックエンドの状態を確認してください。',
    )
    expect(mockRefresh).not.toHaveBeenCalled()
  })
})
