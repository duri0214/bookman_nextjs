import { ChangeEvent } from 'react'
import { act, renderHook } from '@testing-library/react'
import { useCustomerActions } from '@/app/customer/_components/useCustomerActions'

const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

describe('useCustomerActions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
    window.confirm = jest.fn(() => true)
  })

  test('onCreateが成功した時に利用者登録APIへPOSTして一覧を再取得するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 利用者名、電話番号、貸出上限数を入力済みで登録 API が成功する状態。
     * - 処理: onCreate を呼び出す。
     * - 期待値: 登録 API に POST し、ダイアログを閉じて一覧を再取得すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(useCustomerActions)

    act(() => {
      result.current.openDialog()
      result.current.onInputChange({
        target: { name: 'name', value: ' 山田 太郎 ' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'phone', value: ' 090-1234-5678 ' },
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
        phone: '090-1234-5678',
        max_lending_count: 5,
      }),
    })
    expect(result.current.isDialogOpen).toBe(false)
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  test('onUpdateが成功した時に利用者更新APIへPATCHして一覧を再取得するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 編集中の利用者名、電話番号、貸出上限数、利用者ID。
     * - 処理: onUpdate を呼び出す。
     * - 期待値: 更新 API に PATCH し、一覧を再取得すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(useCustomerActions)
    const customer = {
      id: 20,
      name: '旧利用者',
      phone: '03-0000-0000',
      maxLendingCount: 3,
    }

    act(() => {
      result.current.onEditChange(
        customer,
        'name',
      )({
        target: { name: 'name', value: '新利用者' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onEditChange(
        customer,
        'phone',
      )({
        target: { name: 'phone', value: '090-1111-2222' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onEditChange(
        customer,
        'max_lending_count',
      )({
        target: { name: 'max_lending_count', value: '7' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onUpdate(customer)
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/customers/20', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: '新利用者',
        phone: '090-1111-2222',
        max_lending_count: 7,
      }),
    })
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  test('onUpdateが利用者名未入力時に利用者更新APIへPATCHしないべき', async () => {
    /**
     * シナリオ:
     * - 入力: 利用者名が空で貸出上限数が入力済みの編集行。
     * - 処理: onUpdate を呼び出す。
     * - 期待値: APIへPATCHせず、入力エラーメッセージを保持すること。
     */
    const { result } = renderHook(useCustomerActions)
    const customer = {
      id: 20,
      name: '旧利用者',
      phone: '03-0000-0000',
      maxLendingCount: 3,
    }

    act(() => {
      result.current.onEditChange(
        customer,
        'name',
      )({
        target: { name: 'name', value: ' ' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onUpdate(customer)
    })

    expect(global.fetch).not.toHaveBeenCalled()
    expect(result.current.updateErrorMessage).toBe('利用者名と貸出上限数を正しく入力してください。')
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  test('onUpdateがbackend未対応のHTMLエラーを表示しないべき', async () => {
    /**
     * シナリオ:
     * - 入力: 利用者更新 API が backend の HTML 404 を message として返す状態。
     * - 処理: onUpdate を呼び出す。
     * - 期待値: HTML本文を表示せず、汎用の更新失敗メッセージを保持すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ message: '<!DOCTYPE html><html><body>Page not found</body></html>' }),
    } as Response)
    const { result } = renderHook(useCustomerActions)
    const customer = {
      id: 20,
      name: '旧利用者',
      phone: '03-0000-0000',
      maxLendingCount: 3,
    }

    await act(async () => {
      await result.current.onUpdate(customer)
    })

    expect(result.current.updateErrorMessage).toBe(
      '利用者データの保存に失敗しました。入力内容とバックエンドの状態を確認してください。',
    )
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  test('onDeleteが成功した時に利用者削除APIへDELETEして一覧を再取得するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 削除確認済みの利用者。
     * - 処理: onDelete を呼び出す。
     * - 期待値: 利用者削除APIへDELETEし、成功メッセージを保持して一覧を再取得すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(useCustomerActions)
    const customer = {
      id: 20,
      name: '山田 太郎',
      phone: '03-0000-0000',
      maxLendingCount: 3,
    }

    await act(async () => {
      await result.current.onDelete(customer)
    })

    expect(window.confirm).toHaveBeenCalledWith('利用者「山田 太郎」を削除します。よろしいですか？')
    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/customers/20', {
      method: 'DELETE',
    })
    expect(result.current.actionMessage).toBe('利用者データを削除しました。')
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })
})
