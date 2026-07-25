import Link from 'next/link'
import type { ReactNode } from 'react'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import ListSubheader from '@mui/material/ListSubheader'
import HomeIcon from '@mui/icons-material/Home'
import DashboardIcon from '@mui/icons-material/Dashboard'
import AddHomeIcon from '@mui/icons-material/AddHome'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import LayersIcon from '@mui/icons-material/Layers'
import AssignmentIcon from '@mui/icons-material/Assignment'
import PeopleIcon from '@mui/icons-material/People'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import EventAvailableIcon from '@mui/icons-material/EventAvailable'
import BadgeIcon from '@mui/icons-material/Badge'
import LocationCityIcon from '@mui/icons-material/LocationCity'
import CategoryIcon from '@mui/icons-material/Category'

const isActivePath = (pathname: string, href: string): boolean =>
  href === '/' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)

const activeItemSx = {
  '&.Mui-selected': {
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    '&:hover': {
      bgcolor: 'primary.dark',
    },
    '& .MuiListItemIcon-root': {
      color: 'inherit',
    },
  },
}

interface NavItemProps {
  href: string
  pathname: string
  icon: ReactNode
  label: string
}

function NavItem({ href, pathname, icon, label }: NavItemProps) {
  return (
    <ListItemButton
      component={Link}
      href={href}
      selected={isActivePath(pathname, href)}
      sx={activeItemSx}
    >
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={label} />
    </ListItemButton>
  )
}

export const mainListItems = (pathname: string) => (
  <>
    <NavItem href='/' pathname={pathname} icon={<HomeIcon />} label='Home' />
    <NavItem
      href='/dashboard'
      pathname={pathname}
      icon={<DashboardIcon />}
      label='ダッシュボード'
    />
    <NavItem
      href='/municipality'
      pathname={pathname}
      icon={<LocationCityIcon />}
      label='自治体管理'
    />
    <NavItem href='/branch' pathname={pathname} icon={<AddHomeIcon />} label='館管理' />
    <NavItem href='/staff' pathname={pathname} icon={<BadgeIcon />} label='職員管理' />
    <NavItem href='/author' pathname={pathname} icon={<PersonAddIcon />} label='著者管理' />
    <NavItem href='/category' pathname={pathname} icon={<CategoryIcon />} label='カテゴリ管理' />
    <NavItem href='/book' pathname={pathname} icon={<AutoStoriesIcon />} label='書籍管理' />
    <NavItem href='/customer' pathname={pathname} icon={<PeopleIcon />} label='利用者台帳' />
    <NavItem href='/lending' pathname={pathname} icon={<LayersIcon />} label='貸出・返却' />
    <NavItem
      href='/reservation'
      pathname={pathname}
      icon={<EventAvailableIcon />}
      label='予約・取り置き'
    />
  </>
)

export const secondaryListItems = (pathname: string) => (
  <>
    <ListSubheader component='div' inset>
      業務指標
    </ListSubheader>
    <ListItemButton disabled>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary='今月の貸出（未接続）' />
    </ListItemButton>
    <NavItem href='/reservation' pathname={pathname} icon={<AssignmentIcon />} label='予約状況' />
    <ListItemButton disabled>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary='表彰候補（未接続）' />
    </ListItemButton>
  </>
)
