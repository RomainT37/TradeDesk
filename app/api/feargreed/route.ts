import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://api.alternative.me/fng/?limit=1', { next: { revalidate: 3600 } })
    const data = await res.json()
    const value = parseInt(data?.data?.[0]?.value)
    if (!isNaN(value)) return NextResponse.json({ value })
  } catch {}
  try {
    const res = await fetch('https://production.dataviz.cnn.io/index/fearandgreed/graphdata', {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.cnn.com/' }, next: { revalidate: 3600 }
    })
    const data = await res.json()
    const value = Math.round(data?.fear_and_greed?.score)
    if (!isNaN(value)) return NextResponse.json({ value })
  } catch {}
  return NextResponse.json({ value: null })
}
