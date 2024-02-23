'use client'
import { ReactNode } from 'react'
import { CommonLayout } from '@/components/nav/CommonLayout'

export default function Layout({ children }: Readonly<{ children: ReactNode }>) {
  return <CommonLayout title='書籍管理'>{children}</CommonLayout>
}
