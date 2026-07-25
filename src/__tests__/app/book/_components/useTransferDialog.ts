import { ChangeEvent } from 'react'
import { act, renderHook } from '@testing-library/react'
import { Book } from '@/resource/book'
import { useTransferDialog } from '@/app/book/_components/useTransferDialog'

const mockRefresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

const book: Book = {
  id: 10,
  category: { id: 1, name: '小説', color: '#ff0000' },
  name: '吾輩は猫である',
  authors: '夏目漱石',
  leadText: '近代文学の代表作です。',
  totalAmount: 5,
  branchStocks: [
    {
      id: 1,
      branchId: 1,
      branchName: '中央図書館',
      municipalityId: 1,
      municipalityName: '渋谷区',
      amount: 3,
    },
    {
      id: 2,
      branchId: 2,
      branchName: '東図書館',
      municipalityId: 1,
      municipalityName: '渋谷区',
      amount: 2,
    },
  ],
  publicationDate: '2026-01-01',
}

describe('useTransferDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  test('openTransferDialogが呼び出された時に対象書籍と初期移動元を保持するべき', () => {
    /**
     * シナリオ:
     * - 入力: 支店別所蔵数を持つ書籍。
     * - 処理: openTransferDialog を呼び出す。
     * - 期待値: ダイアログが開き、先頭の所蔵支店と冊数1が初期値になること。
     */
    const { result } = renderHook(() => useTransferDialog('1'))

    act(() => {
      result.current.openTransferDialog(book)
    })

    expect(result.current.isTransferDialogOpen).toBe(true)
    expect(result.current.selectedBook).toEqual(book)
    expect(result.current.formValues.fromBranch).toBe('1')
    expect(result.current.formValues.amount).toBe('1')
  })

  test('openTransferDialogが呼び出された時に0冊の支店を初期移動元にしないべき', () => {
    /**
     * シナリオ:
     * - 入力: 先頭に0冊の支店、次に在庫あり支店を持つ書籍。
     * - 処理: openTransferDialog を呼び出す。
     * - 期待値: 0冊支店を飛ばし、在庫あり支店が移動元初期値になること。
     */
    const { result } = renderHook(() => useTransferDialog('1'))

    act(() => {
      result.current.openTransferDialog({
        ...book,
        branchStocks: [
          {
            id: 3,
            branchId: 3,
            branchName: '空支店',
            municipalityId: 1,
            municipalityName: '渋谷区',
            amount: 0,
          },
          {
            id: 4,
            branchId: 4,
            branchName: '在庫あり支店',
            municipalityId: 1,
            municipalityName: '渋谷区',
            amount: 1,
          },
        ],
      })
    })

    expect(result.current.formValues.fromBranch).toBe('4')
  })

  test('onTransferが成功した時に支店間移動APIへPOSTして一覧を再取得するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 移動元1、移動先2、冊数2のフォーム入力。
     * - 処理: onTransfer を呼び出す。
     * - 期待値: 数値化したpayloadでPOSTし、ダイアログを閉じて一覧を再取得すること。
     */
    jest.mocked(global.fetch).mockResolvedValue({ ok: true } as Response)
    const { result } = renderHook(() => useTransferDialog('1'))

    act(() => {
      result.current.openTransferDialog(book)
      result.current.onTransferInputChange({
        target: { name: 'toBranch', value: '2' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onTransferInputChange({
        target: { name: 'amount', value: '2' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onTransfer()
    })

    expect(global.fetch).toHaveBeenCalledWith('/api/bookman/branch-book-stocks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        book: 10,
        municipality: 1,
        fromBranch: 1,
        toBranch: 2,
        amount: 2,
      }),
    })
    expect(result.current.isTransferDialogOpen).toBe(false)
    expect(mockRefresh).toHaveBeenCalledTimes(1)
  })

  test('移動元を変更して移動先と同じ支店になった時に移動先をクリアするべき', () => {
    /**
     * シナリオ:
     * - 入力: 移動先に支店2を選択済みのフォーム。
     * - 処理: 移動元を支店2に変更する。
     * - 期待値: 移動元と移動先が同じにならないよう、移動先が空に戻ること。
     */
    const { result } = renderHook(() => useTransferDialog('1'))

    act(() => {
      result.current.openTransferDialog(book)
      result.current.onTransferInputChange({
        target: { name: 'toBranch', value: '2' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onTransferInputChange({
        target: { name: 'fromBranch', value: '2' },
      } as ChangeEvent<HTMLInputElement>)
    })

    expect(result.current.formValues.fromBranch).toBe('2')
    expect(result.current.formValues.toBranch).toBe('')
  })

  test('移動冊数が移動元所蔵数を超える時にAPIを呼ばずエラーを保持するべき', async () => {
    /**
     * シナリオ:
     * - 入力: 移動元所蔵数3に対して冊数4のフォーム入力。
     * - 処理: onTransfer を呼び出す。
     * - 期待値: APIを呼ばず、所蔵数不足エラーを表示すること。
     */
    const { result } = renderHook(() => useTransferDialog('1'))

    act(() => {
      result.current.openTransferDialog(book)
      result.current.onTransferInputChange({
        target: { name: 'toBranch', value: '2' },
      } as ChangeEvent<HTMLInputElement>)
      result.current.onTransferInputChange({
        target: { name: 'amount', value: '4' },
      } as ChangeEvent<HTMLInputElement>)
    })

    await act(async () => {
      await result.current.onTransfer()
    })

    expect(global.fetch).not.toHaveBeenCalled()
    expect(result.current.transferErrorMessage).toBe('移動元支店の所蔵数が不足しています。')
  })
})
