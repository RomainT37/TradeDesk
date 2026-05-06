import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get('symbol')
  if (!symbol) return NextResponse.json({ error: 'No symbol' }, { status: 400 })

  try {
    const url = `https://stooq.com/q/l/?s=${symbol}&f=sd2t2ohlcv&h&e=csv`
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 60 } })
    const text = await res.text()
    const lines = text.trim().split('\n')
    if (lines.length >= 2) {
      const cols = lines[1].split(',')
      const close = parseFloat(cols[6])
      const open = parseFloat(cols[3])
      if (!isNaN(close) && close > 0) {
        const change = ((close - open) / open * 100).toFixed(2)
        return NextResponse.json({ price: close.toFixed(close < 10 ? 4 : 2), change })
      }
    }
  } catch {}

  try {
    const ys = symbol.replace('^', '%5E').replace('/', '')
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${ys}?interval=1d&range=2d`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'Accept': 'application/json' }
    })
    const data = await res.json()
    const meta = data?.chart?.result?.[0]?.meta
    if (meta?.regularMarketPrice) {
      const price = meta.regularMarketPrice
      const prev = meta.chartPreviousClose || meta.previousClose
      const change = prev ? ((price - prev) / prev * 100).toFixed(2) : '0.00'
      return NextResponse.json({ price: price.toFixed(price < 10 ? 4 : 2), change })
    }
  } catch {}

  return NextResponse.json({ price: '—', change: '0.00' })
}
