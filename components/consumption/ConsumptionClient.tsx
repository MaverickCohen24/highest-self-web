'use client'
import { useState, useTransition } from 'react'
import { saveConsumptionLog } from '@/actions/consumption'
import { Smartphone, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'

type Log = {
  phoneMinutes: number | null
  socialMediaMinutes: number | null
  mainApps: string | null
  contentQuality: number | null
  mentalImpact: string | null
  whatTriggered: string | null
  intention: string | null
} | null

type HistoryItem = Log & { date: string; id: string }

interface Props {
  date: string
  log: Log
  history: HistoryItem[]
}

const QUALITY_LABELS = ['', 'Noise', 'Mostly noise', 'Mixed', 'Mostly meaningful', 'Deeply meaningful']
const TRIGGER_OPTIONS = ['Boredom', 'Anxiety', 'Habit', 'Procrastination', 'Social pressure', 'FOMO', 'Intentional']

export default function ConsumptionClient({ date, log, history }: Props) {
  const [phoneMin, setPhoneMin] = useState(log?.phoneMinutes?.toString() ?? '')
  const [socialMin, setSocialMin] = useState(log?.socialMediaMinutes?.toString() ?? '')
  const [apps, setApps] = useState(log?.mainApps ?? '')
  const [quality, setQuality] = useState(log?.contentQuality?.toString() ?? '')
  const [impact, setImpact] = useState(log?.mentalImpact ?? '')
  const [triggered, setTriggered] = useState(log?.whatTriggered ?? '')
  const [intention, setIntention] = useState(log?.intention ?? '')
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const save = () => {
    startTransition(async () => {
      await saveConsumptionLog(date, {
        phoneMinutes: phoneMin ? Number(phoneMin) : undefined,
        socialMediaMinutes: socialMin ? Number(socialMin) : undefined,
        mainApps: apps || undefined,
        contentQuality: quality ? Number(quality) : undefined,
        mentalImpact: impact || undefined,
        whatTriggered: triggered || undefined,
        intention: intention || undefined,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  const avgQuality = history.filter(h => h.contentQuality).reduce((s, h) => s + (h.contentQuality ?? 0), 0) /
    (history.filter(h => h.contentQuality).length || 1)

  const avgPhone = history.filter(h => h.phoneMinutes).reduce((s, h) => s + (h.phoneMinutes ?? 0), 0) /
    (history.filter(h => h.phoneMinutes).length || 1)

  const trend = history.length >= 2 && history[0].phoneMinutes && history[1].phoneMinutes
    ? history[0].phoneMinutes - history[1].phoneMinutes
    : null

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-8 pt-10 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#e8e6e3]">Consumption</h1>
          <p style={{ color: '#5a5855', fontSize: '0.875rem', marginTop: '0.25rem' }}>Phone · Social media · Mental diet</p>
        </div>
      </div>

      <div className="px-8 pb-8 space-y-4 max-w-2xl">
        {/* Stats row */}
        {history.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div style={{ background: '#161616', borderRadius: '0.75rem', border: '1px solid #252525', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 300, color: '#6b7fa3' }}>{Math.round(avgPhone)}m</div>
              <div style={{ fontSize: '0.625rem', color: '#5a5855', marginTop: '0.25rem' }}>avg phone / day</div>
            </div>
            <div style={{ background: '#161616', borderRadius: '0.75rem', border: '1px solid #252525', padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 300, color: avgQuality >= 3.5 ? '#6b8f71' : avgQuality >= 2.5 ? '#c9a84c' : '#c47b5e' }}>
                {avgQuality.toFixed(1)}
              </div>
              <div style={{ fontSize: '0.625rem', color: '#5a5855', marginTop: '0.25rem' }}>avg content quality</div>
            </div>
            <div style={{ background: '#161616', borderRadius: '0.75rem', border: '1px solid #252525', padding: '1rem', textAlign: 'center' }}>
              <div className="flex items-center justify-center gap-1" style={{ fontSize: '1.5rem', fontWeight: 300, color: trend === null ? '#5a5855' : trend < 0 ? '#6b8f71' : '#c47b5e' }}>
                {trend === null ? <Minus className="w-5 h-5" /> : trend < 0 ? <TrendingDown className="w-5 h-5" /> : <TrendingUp className="w-5 h-5" />}
                {trend !== null && `${Math.abs(trend)}m`}
              </div>
              <div style={{ fontSize: '0.625rem', color: '#5a5855', marginTop: '0.25rem' }}>vs yesterday</div>
            </div>
          </div>
        )}

        {/* Today's log */}
        <div style={{ background: '#161616', borderRadius: '0.75rem', border: '1px solid #252525', padding: '1rem' }}>
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-4 h-4" style={{ color: '#6b7fa3' }} strokeWidth={1.5} />
            <p style={{ color: '#5a5855', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>Today's log</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.375rem' }}>Total phone time (min)</label>
              <input type="number" className="input-field" value={phoneMin} onChange={e => setPhoneMin(e.target.value)} placeholder="e.g. 120" min={0} />
            </div>
            <div>
              <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.375rem' }}>Social media (min)</label>
              <input type="number" className="input-field" value={socialMin} onChange={e => setSocialMin(e.target.value)} placeholder="e.g. 45" min={0} />
            </div>
          </div>

          <div className="mb-4">
            <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.375rem' }}>Main apps / platforms</label>
            <input className="input-field" value={apps} onChange={e => setApps(e.target.value)} placeholder="Instagram, YouTube, Twitter..." />
          </div>

          <div className="mb-4">
            <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>Content quality (1–5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} onClick={() => setQuality(quality === n.toString() ? '' : n.toString())}
                  style={{
                    flex: 1, padding: '0.5rem', borderRadius: '0.5rem',
                    border: `1px solid ${quality === n.toString() ? '#c9a84c' : '#252525'}`,
                    background: quality === n.toString() ? 'rgba(201,168,76,0.1)' : 'transparent',
                    color: quality === n.toString() ? '#c9a84c' : '#5a5855',
                    fontSize: '0.875rem', cursor: 'pointer',
                  }}>{n}</button>
              ))}
            </div>
            {quality && (
              <p style={{ color: '#5a5855', fontSize: '0.625rem', marginTop: '0.375rem' }}>
                {QUALITY_LABELS[Number(quality)]}
              </p>
            )}
          </div>

          <div className="mb-4">
            <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.5rem' }}>What triggered the usage?</label>
            <div className="flex flex-wrap gap-1.5">
              {TRIGGER_OPTIONS.map(t => (
                <button key={t} onClick={() => setTriggered(tr => tr === t ? '' : t)}
                  style={{
                    padding: '0.25rem 0.75rem', borderRadius: '9999px',
                    border: `1px solid ${triggered === t ? '#6b7fa3' : '#252525'}`,
                    background: triggered === t ? 'rgba(107,127,163,0.1)' : 'transparent',
                    color: triggered === t ? '#6b7fa3' : '#5a5855',
                    fontSize: '0.75rem', cursor: 'pointer',
                  }}>{t}</button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.375rem' }}>How did it affect your mind / mood?</label>
            <textarea className="textarea-field" rows={3}
              placeholder="Did you feel more anxious, scattered, calm, inspired? What did the content do to your thinking?"
              value={impact} onChange={e => setImpact(e.target.value)} />
          </div>

          <div className="mb-4">
            <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.375rem' }}>Intention for tomorrow's consumption</label>
            <textarea className="textarea-field" rows={2}
              placeholder="Tomorrow I will be more intentional about..."
              value={intention} onChange={e => setIntention(e.target.value)} />
          </div>

          <div className="flex justify-end">
            <button onClick={save} disabled={pending} className="btn-primary">
              {pending ? 'Saving...' : saved ? 'Saved!' : 'Save log'}
            </button>
          </div>
        </div>

        {/* History */}
        {history.length > 1 && (
          <div style={{ background: '#161616', borderRadius: '0.75rem', border: '1px solid #252525', padding: '1rem' }}>
            <p style={{ color: '#5a5855', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: '0.75rem' }}>
              Recent history
            </p>
            <div className="space-y-2">
              {history.slice(0, 14).map(h => (
                <div key={h.id} className="flex items-center justify-between">
                  <p style={{ color: '#a8a5a0', fontSize: '0.75rem' }}>{formatDateShort(h.date)}</p>
                  <div className="flex items-center gap-4">
                    {h.phoneMinutes && (
                      <span style={{ fontSize: '0.75rem', color: h.phoneMinutes > 180 ? '#c47b5e' : h.phoneMinutes > 90 ? '#c9a84c' : '#6b8f71' }}>
                        {h.phoneMinutes}m phone
                      </span>
                    )}
                    {h.contentQuality && (
                      <span style={{ fontSize: '0.75rem', color: '#5a5855' }}>
                        {h.contentQuality}/5 quality
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
