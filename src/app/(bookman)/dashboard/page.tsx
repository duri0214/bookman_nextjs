import Link from 'next/link'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { Copyright } from '@/components/Copyright'
import { getBookListData } from '@/app/book/_components/listData'
import { buildDashboardSummary } from './_components/dashboardSummary'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const { books, errorMessage, isMockData } = await getBookListData()
  const summary = buildDashboardSummary(books)

  return (
    <>
      <Toolbar />
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
          {errorMessage && (
            <Grid size={{ xs: 12 }}>
              <Alert severity='warning'>{errorMessage}</Alert>
            </Grid>
          )}
          {isMockData && (
            <Grid size={{ xs: 12 }}>
              <Alert severity='info'>
                バックエンド API
                に接続できないため、開発用モックデータで自治体全体ビューを表示しています。
              </Alert>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Box sx={{ pb: 1 }}>
              <Typography component='p' sx={{ color: '#3f6a8e', fontWeight: 800, mb: 1 }}>
                Bookman
              </Typography>
              <Typography component='h1' variant='h4' sx={{ fontWeight: 800, color: '#243039' }}>
                自治体全体の図書館業務
              </Typography>
              <Typography sx={{ color: '#53606a', mt: 1, maxWidth: 760, lineHeight: 1.8 }}>
                書籍と支店別所蔵を入口に、貸出、予約、期限注意へ広げていく全体ビューです。
                未接続の業務指標は、操作できる導線にせず実装状況を表示します。
              </Typography>
            </Box>
          </Grid>

          {summary.metrics.map((metric) => (
            <Grid key={metric.label} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Paper
                sx={{
                  p: 2.5,
                  height: '100%',
                  border: '1px solid rgba(63, 106, 142, 0.16)',
                  boxShadow: '0 8px 22px rgba(36, 48, 57, 0.08)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Typography sx={{ color: '#53606a', fontWeight: 700 }}>{metric.label}</Typography>
                  <Chip
                    size='small'
                    label={metric.status === 'connected' ? '接続済み' : '準備中'}
                    color={metric.status === 'connected' ? 'primary' : 'default'}
                    variant={metric.status === 'connected' ? 'filled' : 'outlined'}
                  />
                </Box>
                <Typography component='p' variant='h4' sx={{ mt: 2, fontWeight: 800 }}>
                  {metric.value}
                </Typography>
                <Typography sx={{ color: '#6f786f', mt: 1 }}>{metric.helperText}</Typography>
              </Paper>
            </Grid>
          ))}

          <Grid size={{ xs: 12, lg: 7 }}>
            <Paper sx={{ p: 2.5, height: '100%', border: '1px solid rgba(63, 106, 142, 0.16)' }}>
              <Typography component='h2' variant='h6' sx={{ fontWeight: 800, mb: 2 }}>
                支店別所蔵数
              </Typography>
              {summary.branchStocks.length === 0 ? (
                <Typography sx={{ color: '#53606a' }}>
                  支店別所蔵データはまだありません。書籍管理画面で所蔵を登録すると表示されます。
                </Typography>
              ) : (
                <Box sx={{ display: 'grid', gap: 2 }}>
                  {summary.branchStocks.map((branchStock) => (
                    <Box key={branchStock.branchName}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <Typography sx={{ fontWeight: 700 }}>{branchStock.branchName}</Typography>
                        <Typography sx={{ color: '#53606a' }}>
                          {branchStock.totalAmount.toLocaleString()}冊 / {branchStock.bookCount}
                          タイトル
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant='determinate'
                        value={
                          summary.totalStocks > 0
                            ? Math.round((branchStock.totalAmount / summary.totalStocks) * 100)
                            : 0
                        }
                        sx={{ mt: 1, height: 8, borderRadius: 1, bgcolor: '#eee7d9' }}
                      />
                    </Box>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper sx={{ p: 2.5, height: '100%', border: '1px solid rgba(63, 106, 142, 0.16)' }}>
              <Typography component='h2' variant='h6' sx={{ fontWeight: 800, mb: 2 }}>
                次に見る業務
              </Typography>
              <Box sx={{ display: 'grid', gap: 1.5 }}>
                {summary.actions.map((action) => (
                  <Box
                    key={action.label}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr auto' },
                      gap: 1.5,
                      alignItems: 'center',
                      p: 1.5,
                      border: '1px solid rgba(36, 48, 57, 0.12)',
                      borderRadius: 1,
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontWeight: 800 }}>{action.label}</Typography>
                      <Typography sx={{ color: '#53606a' }}>{action.helperText}</Typography>
                    </Box>
                    {action.href ? (
                      <Button component={Link} href={action.href} variant='outlined'>
                        開く
                      </Button>
                    ) : (
                      <Button variant='outlined' disabled>
                        準備中
                      </Button>
                    )}
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Copyright sx={{ pt: 4 }} />
      </Container>
    </>
  )
}
