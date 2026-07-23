import { ReactNode } from 'react'
import { CommonLayout } from '@/components/nav/CommonLayout'

const routeTitles = {
  '/dashboard': '自治体ダッシュボード',
  '/branch': '館管理',
  '/book': '書籍管理',
  '/customer': '利用者台帳',
  '/lending': '貸出・返却',
  '/reservation': '予約・取り置き',
} as const

export default function BookmanLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <CommonLayout routeTitles={routeTitles}>{children}</CommonLayout>
}
