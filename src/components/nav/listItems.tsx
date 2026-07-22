import Link from 'next/link'
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
import EventAvailableIcon from '@mui/icons-material/EventAvailable'

export const mainListItems = (
  <>
    <ListItemButton component={Link} href='/'>
      <ListItemIcon>
        <HomeIcon />
      </ListItemIcon>
      <ListItemText primary='Home' />
    </ListItemButton>
    <ListItemButton component={Link} href='/dashboard'>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary='ダッシュボード' />
    </ListItemButton>
    <ListItemButton component={Link} href='/branch'>
      <ListItemIcon>
        <AddHomeIcon />
      </ListItemIcon>
      <ListItemText primary='館管理' />
    </ListItemButton>
    <ListItemButton component={Link} href='/book'>
      <ListItemIcon>
        <AutoStoriesIcon />
      </ListItemIcon>
      <ListItemText primary='書籍管理' />
    </ListItemButton>
    <ListItemButton component={Link} href='/customer'>
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary='利用者台帳' />
    </ListItemButton>
    <ListItemButton component={Link} href='/lending'>
      <ListItemIcon>
        <LayersIcon />
      </ListItemIcon>
      <ListItemText primary='貸出・返却' />
    </ListItemButton>
    <ListItemButton component={Link} href='/reservation'>
      <ListItemIcon>
        <EventAvailableIcon />
      </ListItemIcon>
      <ListItemText primary='予約・取り置き' />
    </ListItemButton>
  </>
)

export const secondaryListItems = (
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
    <ListItemButton component={Link} href='/reservation'>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary='予約状況' />
    </ListItemButton>
    <ListItemButton disabled>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary='表彰候補（未接続）' />
    </ListItemButton>
  </>
)
