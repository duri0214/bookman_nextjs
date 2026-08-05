import { Typography, TypographyProps } from '@mui/material'
import Link from '@mui/material/Link'

export function Copyright(props: TypographyProps) {
  return (
    <Typography variant='body2' color='text.secondary' align='center' {...props}>
      {'© 2019 henojiya. / '}
      <Link color='inherit' href='https://github.com/duri0214/bookman_nextjs'>
        GitHub bookman
      </Link>{' '}
    </Typography>
  )
}
