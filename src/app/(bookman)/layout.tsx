import { ReactNode } from 'react'
import { CommonLayout } from '@/components/nav/CommonLayout'

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/branch': '館管理',
  '/book': '書籍管理',
} as const

export default function BookmanLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <CommonLayout routeTitles={routeTitles}>{children}</CommonLayout>
}
