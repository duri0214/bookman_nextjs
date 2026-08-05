import MuiDrawer from '@mui/material/Drawer'
import { styled } from '@mui/material'

export const drawerWidth: number = 240

export const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      color: '#2f332f',
      backgroundColor: '#f6f1e8',
      borderRight: '1px solid rgba(141, 113, 75, 0.24)',
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      '& .MuiToolbar-root': {
        backgroundColor: '#efe6d7',
      },
      '& .MuiDivider-root': {
        borderColor: 'rgba(141, 113, 75, 0.22)',
      },
      '& .MuiListSubheader-root': {
        color: '#6f6251',
        backgroundColor: '#f6f1e8',
      },
      '& .MuiListItemIcon-root': {
        color: '#5b6f73',
      },
      '& .MuiListItemButton-root:hover': {
        backgroundColor: 'rgba(63, 106, 142, 0.1)',
      },
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        '& .MuiListItemButton-root': {
          justifyContent: 'center',
          px: 1,
        },
        '& .MuiListItemIcon-root': {
          justifyContent: 'center',
          minWidth: 0,
        },
        '& .MuiListItemText-root, & .MuiListSubheader-root': {
          display: 'none',
        },
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
)
