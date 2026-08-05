import { render, screen } from '@testing-library/react'
import { List as AuthorList } from '@/app/author/_components/List'
import { List as CategoryList } from '@/app/category/_components/List'
import { List as CustomerList } from '@/app/customer/_components/List'
import { List as MunicipalityList } from '@/app/municipality/_components/List'
import { List as StaffList } from '@/app/staff/_components/List'
import { Branch } from '@/resource/branch'

const getHeaderLabels = () =>
  screen.getAllByRole('columnheader').map((header) => header.textContent?.trim())

describe('management operation columns', () => {
  test('自治体管理は保存列と削除列を分けて表示するべき', () => {
    /**
     * シナリオ:
     * - 入力: 自治体一覧の表示に必要な自治体データ。
     * - 処理: 自治体一覧コンポーネントを表示する。
     * - 期待値: 保存と削除が1つの操作列にまとまらず、独立した列として表示されること。
     */
    render(
      <MunicipalityList
        municipalities={[{ id: 1, name: '渋谷区' }]}
        getEditingRow={(municipality) => ({ name: municipality.name })}
        onEditChange={() => jest.fn()}
        onUpdate={jest.fn()}
        savingMunicipalityId={null}
        onDelete={jest.fn()}
        deletingMunicipalityId={null}
        updateErrorMessage={null}
      />,
    )

    expect(getHeaderLabels()).toEqual(['#', '自治体名', '保存', '削除'])
  })

  test('職員管理は保存列と削除列を分けて表示するべき', () => {
    /**
     * シナリオ:
     * - 入力: 職員一覧の表示に必要な職員データと支店データ。
     * - 処理: 職員一覧コンポーネントを表示する。
     * - 期待値: 保存と削除が1つの操作列にまとまらず、独立した列として表示されること。
     */
    const branches: Branch[] = [
      {
        id: 1,
        municipalityId: 1,
        municipalityName: '渋谷区',
        name: '渋谷中央図書館',
        address: '',
        phone: '',
        remark: '',
      },
    ]

    render(
      <StaffList
        branches={branches}
        staff={[
          { id: 1, name: '山田 太郎', branchId: 1, branchName: '渋谷中央図書館', role: 'counter' },
        ]}
        getEditingRow={(staff) => ({
          name: staff.name,
          branch: String(staff.branchId),
          role: staff.role,
        })}
        onEditChange={() => jest.fn()}
        onUpdate={jest.fn()}
        savingStaffId={null}
        onDelete={jest.fn()}
        deletingStaffId={null}
        updateErrorMessage={null}
      />,
    )

    expect(getHeaderLabels()).toEqual(['#', '職員名', '所属支店', 'ロール', '保存', '削除'])
  })

  test('利用者台帳は保存列と削除列を分けて表示するべき', () => {
    /**
     * シナリオ:
     * - 入力: 利用者一覧の表示に必要な利用者データ。
     * - 処理: 利用者一覧コンポーネントを表示する。
     * - 期待値: 保存と削除が1つの操作列にまとまらず、独立した列として表示されること。
     */
    render(
      <CustomerList
        customers={[{ id: 1, name: '山田 太郎', phone: '03-0000-0000', maxLendingCount: 3 }]}
        getEditingRow={(customer) => ({
          name: customer.name,
          phone: customer.phone,
          max_lending_count: String(customer.maxLendingCount),
        })}
        onEditChange={() => jest.fn()}
        onUpdate={jest.fn()}
        savingCustomerId={null}
        onDelete={jest.fn()}
        deletingCustomerId={null}
        updateErrorMessage={null}
      />,
    )

    expect(getHeaderLabels()).toEqual(['#', '利用者名', '電話番号', '貸出上限数', '保存', '削除'])
  })

  test('著者管理は保存列と削除列を分けて表示するべき', () => {
    /**
     * シナリオ:
     * - 入力: 著者一覧の表示に必要な著者データ。
     * - 処理: 著者一覧コンポーネントを表示する。
     * - 期待値: 保存と削除が1つの操作列にまとまらず、独立した列として表示されること。
     */
    render(
      <AuthorList
        authors={[{ id: 1, name: '夏目漱石' }]}
        getEditingRow={(author) => ({ name: author.name })}
        onEditChange={() => jest.fn()}
        onUpdate={jest.fn()}
        savingAuthorId={null}
        onDelete={jest.fn()}
        deletingAuthorId={null}
        updateErrorMessage={null}
      />,
    )

    expect(getHeaderLabels()).toEqual(['#', '著者名', '保存', '削除'])
  })

  test('カテゴリ管理は保存列と削除列を分けて表示するべき', () => {
    /**
     * シナリオ:
     * - 入力: カテゴリ一覧の表示に必要なカテゴリデータ。
     * - 処理: カテゴリ一覧コンポーネントを表示する。
     * - 期待値: 保存と削除が1つの操作列にまとまらず、独立した列として表示されること。
     */
    render(
      <CategoryList
        categories={[{ id: 1, name: '小説', color: '#1976d2' }]}
        getEditingRow={(category) => ({ name: category.name, color: category.color })}
        onEditChange={() => jest.fn()}
        onUpdate={jest.fn()}
        savingCategoryId={null}
        onDelete={jest.fn()}
        deletingCategoryId={null}
        updateErrorMessage={null}
      />,
    )

    expect(getHeaderLabels()).toEqual(['#', 'カテゴリ名', '表示色', '保存', '削除'])
  })
})
