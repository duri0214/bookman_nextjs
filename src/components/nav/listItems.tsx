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

export const mainListItems = (
  <>
    <ListItemButton component='a' href='/'>
      <ListItemIcon>
        <HomeIcon />
      </ListItemIcon>
      <ListItemText primary='Home' />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary='ダッシュボード' />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <AddHomeIcon />
      </ListItemIcon>
      <ListItemText primary='館管理' />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <AutoStoriesIcon />
      </ListItemIcon>
      <ListItemText primary='書籍管理' />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <LayersIcon />
      </ListItemIcon>
      <ListItemText primary='Integrations' />
    </ListItemButton>
  </>
)

export const secondaryListItems = (
  <>
    <ListSubheader component='div' inset>
      Saved reports
    </ListSubheader>
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary='Current month' />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary='Last quarter' />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary='Year-end sale' />
    </ListItemButton>
  </>
)
