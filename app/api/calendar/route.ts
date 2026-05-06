import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }, next: { revalidate: 1800 }
    })
    if (res.ok) {
      const data = await res.json()
      const events = data.map((e: any) => ({
        time: e.date ? new Date(e.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' }) : '—',
        currency: e.country?.toUpperCase() || '—',
        impact: e.impact === 'High' ? 'high' : e.impact === 'Medium' ? 'medium' : 'low',
        event: e.title || '—',
        actual: e.actual || '',
        forecast: e.forecast || '',
        previous: e.previous || ''
      }))
      return NextResponse.json({ events })
    }
  } catch {}
  return NextResponse.json({ events: [] })
}
