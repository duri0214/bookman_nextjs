import { ChangeEvent } from 'react'
import { act, renderHook } from '@testing-library/react'
import { useEditDialog } from '@/app/book/_components/useEditDialog'
import { Book } from '@/resource/book'

const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

describe('useEditDialog', () => {
  const authors = [
    { id: 1, name: '夏目漱石' },
    { id: 2, name: '国松俊英' },
  ]
  const categories = [
    { id: 1, name: '小説', color: '#ff0000' },
    { id: 2, name: '実用', color: '#00ff00' },
  ]
  const book: Book = {
    id: 10,
    category: { id: 1, name: '小説', color: '#ff0000' },
    authorIds: [1],
    name: '吾輩は猫である',
    authors: '夏目漱石',
    leadText: '紹介文',
    isbn: '9784062938426',
    totalAmount: 2,
    branchStocks: [],
    publicationDate: '2026-01-01',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  test('openEditDialogが呼び出された時に選択書籍からフォーム初期値を作るべき', () => {
    /**
     * シナリオ:
     * - 入力: カテゴリ、著者、ISBN、出版日を持つ書籍。
     * - 処理: openEditDialog を呼び出す。
     * - 期待値: 編集ダイアログが開き、フォームに書籍の現在値が入ること。
     */
    const { result } = renderHook(() => useEditDialog(authors, categories))

    act(() => {
      result.current.openEditDialog(book)
    })

    expect(result.current.isEditDialogOpen).toBe(true)
    expect(result.current.formValues).toEqual({
      category: '1',
      name: '吾輩は猫である',
      authors: '1',
      lead_text: '紹介文',
      isbn: '9784062938426',
      publication_date: '2026-01-01',
    })
  })

  test('onUpdateが成功した時に書籍更新APIへPATCHして一覧を再取得するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 編集ダイアログでカテゴリ、著者、紹介文、ISBN、出版日を変更済みの状態。
     * - 処理: onUpdate を呼び出す。
     * - 期待値: 書籍更新 API へPATCHし、一覧を再取得すること。
     */
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 10 }),
    } as Response)
    const { result } = renderHook(() => useEditDialog(authors, categories))

    act(() => {
      result.current.openEditDialog(book)
      result.current.onInputChange({
        target: { name: 'category', value: '2' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'name', value: 'Bookman 改訂版' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'authors', value: '1, 2' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'lead_text', value: '紹介文を更新' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'isbn', value: '978-4-06-293842-6' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onInputChange({
        target: { name: 'publication_date', value: '2026-02-01' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onUpdate()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/books/10', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: 2,
        name: 'Bookman 改訂版',
        authors: [1, 2],
        lead_text: '紹介文を更新',
        isbn: '9784062938426',
        publication_date: '2026-02-01',
      }),
    })
    expect(result.current.isEditDialogOpen).toBe(false)
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  test('onUpdateがbackendの項目別エラーを保持するべき', async () => {
    /**
     * シナリオ:
     * - 入力: backend が出版日の validation error を返す状態。
     * - 処理: onUpdate を呼び出す。
     * - 期待値: ダイアログを開いたまま項目名付きの更新失敗メッセージを保持すること。
     */
    jest.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        publication_date: ['Date has wrong format. Use one of these formats instead: YYYY-MM-DD.'],
      }),
    } as Response)
    const { result } = renderHook(() => useEditDialog(authors, categories))

    act(() => {
      result.current.openEditDialog(book)
    })

    await act(async () => {
      await result.current.onUpdate()
    })

    expect(result.current.isEditDialogOpen).toBe(true)
    expect(result.current.updateErrorMessage).toBe(
      '出版年月日: Date has wrong format. Use one of these formats instead: YYYY-MM-DD.',
    )
    expect(mockRefresh).not.toHaveBeenCalled()
  })
})
