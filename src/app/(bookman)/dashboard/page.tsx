import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import SpeedIcon from '@mui/icons-material/Speed'
import { Copyright } from '@/components/Copyright'
import { getBookListData } from '@/app/book/_components/listData'
import { getLendingPageData } from '@/app/lending/_components/listData'
import { buildDashboardSummary } from './_components/dashboardSummary'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function Page({ searchParams }: PageProps) {
  const paramsPromise: Promise<Record<string, string | string[] | undefined>> =
    searchParams ?? Promise.resolve({})
  const [bookData, lendingData, params] = await Promise.all([
    getBookListData(),
    getLendingPageData(),
    paramsPromise,
  ])
  const selectedMunicipalityParam = Array.isArray(params.municipalityId)
    ? params.municipalityId[0]
    : params.municipalityId
  const selectedMunicipalityId = selectedMunicipalityParam
    ? Number(selectedMunicipalityParam)
    : undefined
  const summary = buildDashboardSummary(
    bookData.books,
    lendingData.lendings,
    lendingData.reservations,
    bookData.municipalities,
    Number.isFinite(selectedMunicipalityId) ? selectedMunicipalityId : undefined,
  )

  return (
    <>
      <Toolbar />
      <Container maxWidth='lg' sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
          {bookData.errorMessage && (
            <Grid size={{ xs: 12 }}>
              <Alert severity='warning'>{bookData.errorMessage}</Alert>
            </Grid>
          )}
          {lendingData.errorMessage && (
            <Grid size={{ xs: 12 }}>
              <Alert severity='warning'>{lendingData.errorMessage}</Alert>
            </Grid>
          )}
          {(bookData.isMockData || lendingData.isMockData) && (
            <Grid size={{ xs: 12 }}>
              <Alert severity='info'>
                バックエンド API
                に接続できないデータは、開発用モックデータで自治体全体ビューを表示しています。
              </Alert>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr auto' },
                gap: 2,
                alignItems: 'end',
                pb: 1,
              }}
            >
              <Box>
                <Typography component='p' sx={{ color: '#356f96', fontWeight: 800, mb: 1 }}>
                  Bookman
                </Typography>
                <Typography component='h1' variant='h4' sx={{ fontWeight: 800, color: '#2f332f' }}>
                  自治体全体の図書館業務
                </Typography>
                <Typography sx={{ color: '#5f5a51', mt: 1, maxWidth: 760, lineHeight: 1.8 }}>
                  書籍、支店別所蔵、貸出、予約、期限注意を実データで確認する業務ビューです。
                </Typography>
              </Box>
              <Box component='form' action='/dashboard' sx={{ minWidth: { xs: '100%', md: 240 } }}>
                <TextField
                  select
                  fullWidth
                  size='small'
                  label='自治体'
                  name='municipalityId'
                  defaultValue={summary.selectedMunicipalityId?.toString() ?? ''}
                >
                  {summary.municipalityOptions.length === 0 && (
                    <MenuItem value=''>自治体なし</MenuItem>
                  )}
                  {summary.municipalityOptions.map((municipality) => (
                    <MenuItem key={municipality.id} value={municipality.id.toString()}>
                      {municipality.name}
                    </MenuItem>
                  ))}
                </TextField>
                <Button type='submit' variant='outlined' sx={{ mt: 1, width: '100%' }}>
                  表示を更新
                </Button>
              </Box>
            </Box>
          </Grid>

          {summary.metrics.map((metric) => (
            <Grid key={metric.label} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Paper
                sx={{
                  p: 2.5,
                  height: '100%',
                  bgcolor: '#fffaf0',
                  border: '1px solid rgba(141, 113, 75, 0.2)',
                  boxShadow: '0 8px 22px rgba(47, 51, 47, 0.08)',
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                  <Typography sx={{ color: '#5f5a51', fontWeight: 700 }}>{metric.label}</Typography>
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
            <Paper
              sx={{
                p: 2.5,
                height: '100%',
                bgcolor: '#fffaf0',
                border: '1px solid rgba(141, 113, 75, 0.2)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <SpeedIcon color='primary' />
                <Typography component='h2' variant='h6' sx={{ fontWeight: 800 }}>
                  支店別所蔵数
                </Typography>
              </Box>
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
            <Paper
              sx={{
                p: 2.5,
                height: '100%',
                bgcolor: '#fffaf0',
                border: '1px solid rgba(141, 113, 75, 0.2)',
              }}
            >
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
                      <Button href={action.href} variant='outlined'>
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
