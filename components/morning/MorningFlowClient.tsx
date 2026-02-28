'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveMorningLog } from '@/actions/daily'
import { ChevronRight, Check, Sun } from 'lucide-react'

type MorningLog = {
  wakeTime: string | null
  sunlightMinutes: number
  caffeineDelayed90min: boolean
  coldExposure: boolean
  meditationMinutes: number
  exerciseDone: boolean
  intention: string | null
  identityAffirmation: string | null
  creativeObservation: string | null
  top3: string | null
} | null

interface Entry {
  id: string
  morningCompleted: boolean
  morningLog: MorningLog
}

interface Props {
  entry: Entry
  date: string
}

const STEPS = [
  { key: 'wakeTime', label: 'Wake Time', prompt: 'What time did you wake up?', type: 'time' },
  { key: 'sunlightMinutes', label: 'Sunlight', prompt: 'Minutes of morning sunlight exposure?', type: 'number', placeholder: '10' },
  { key: 'caffeineDelayed90min', label: 'Caffeine Delay', prompt: 'Did you wait 90 min before caffeine?', type: 'boolean' },
  { key: 'exercise', label: 'Movement', prompt: 'Any exercise or movement today?', type: 'boolean' },
  { key: 'coldExposure', label: 'Cold Exposure', prompt: 'Cold shower or plunge?', type: 'boolean' },
  { key: 'meditationMinutes', label: 'NSDR / Meditation', prompt: 'Minutes of meditation or NSDR?', type: 'number', placeholder: '0' },
  { key: 'identityAffirmation', label: 'Identity', prompt: 'Complete: "I am the type of person who..."', type: 'textarea', placeholder: 'shows up every day regardless of how I feel.' },
  { key: 'intention', label: 'Intention', prompt: "Today's mission — what must get done?", type: 'textarea', placeholder: 'My singular focus today is...' },
  { key: 'creativeObservation', label: 'Creative Eye', prompt: 'What will you notice today? (Rick Rubin)', type: 'textarea', placeholder: 'I will pay attention to...' },
  { key: 'top3', label: 'Top 3', prompt: 'Your three priorities. One per line.', type: 'textarea', placeholder: '1.\n2.\n3.' },
]

function LogView({ log }: { log: NonNullable<MorningLog> }) {
  const items = [
    { label: 'Wake time', value: log.wakeTime },
    { label: 'Sunlight', value: log.sunlightMinutes ? `${log.sunlightMinutes} min` : null },
    { label: 'Caffeine delayed 90min', value: log.caffeineDelayed90min ? 'Yes' : 'No' },
    { label: 'Exercise', value: log.exerciseDone ? 'Yes' : 'No' },
    { label: 'Cold exposure', value: log.coldExposure ? 'Yes' : 'No' },
    { label: 'Meditation / NSDR', value: log.meditationMinutes ? `${log.meditationMinutes} min` : null },
    { label: 'Identity', value: log.identityAffirmation ? `I am the type of person who ${log.identityAffirmation}` : null },
    { label: 'Intention', value: log.intention },
    { label: 'Creative eye', value: log.creativeObservation },
    { label: 'Top 3', value: log.top3 },
  ]

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-8 pt-10 pb-4 flex items-center gap-3">
        <Sun className="w-5 h-5 text-[#c9a84c]" strokeWidth={1.5} />
        <h1 className="text-2xl font-semibold text-[#e8e6e3]">Morning log</h1>
      </div>
      <div className="px-8 pb-8 space-y-3 max-w-2xl">
        {items.filter(i => i.value).map(({ label, value }) => (
          <div key={label} style={{ background: '#161616', borderRadius: '0.75rem', border: '1px solid #252525', padding: '1rem' }}>
            <p style={{ color: '#5a5855', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: '0.375rem' }}>{label}</p>
            <p style={{ color: '#e8e6e3', fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MorningFlowClient({ entry, date }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, string | boolean>>({})
  const [saving, setSaving] = useState(false)
  const [showLog, setShowLog] = useState(entry.morningCompleted)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const done = step === STEPS.length

  const setValue = (val: string | boolean) => {
    setValues(v => ({ ...v, [current.key]: val }))
  }

  const advance = async () => {
    if (isLast) {
      setSaving(true)
      await saveMorningLog(entry.id, date, values)
      setSaving(false)
      setShowLog(true)
    } else {
      setStep(s => s + 1)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') advance()
  }

  if (showLog && entry.morningLog) {
    return (
      <div className="flex flex-col h-full">
        <LogView log={entry.morningLog} />
      </div>
    )
  }

  if (done && !entry.morningLog) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-8">
        <div style={{ width: '3.5rem', height: '3.5rem', borderRadius: '9999px', background: 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sun className="w-7 h-7 text-[#c9a84c]" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-[#e8e6e3] mb-2">Morning complete.</h2>
          <p className="text-[#5a5855] text-sm">You've set the tone. Now go execute.</p>
        </div>
        <button onClick={() => router.push('/dashboard')} className="btn-primary">
          Back to today
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" onKeyDown={handleKey}>
      <div className="flex items-center gap-1.5 px-8 pt-8 pb-2">
        {STEPS.map((_, i) => (
          <div key={i} style={{
            height: '0.25rem', borderRadius: '9999px', transition: 'all 300ms',
            background: i < step ? '#c9a84c' : i === step ? 'rgba(201,168,76,0.6)' : '#252525',
            width: i < step ? '1.5rem' : i === step ? '1rem' : '0.5rem'
          }} />
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 max-w-xl">
        <p style={{ color: '#5a5855', fontSize: '0.625rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
          {current.label}
        </p>
        <h2 className="text-xl font-medium text-[#e8e6e3] mb-8 leading-snug">
          {current.prompt}
        </h2>

        {current.type === 'boolean' && (
          <div className="flex gap-3">
            {['Yes', 'No'].map(opt => {
              const val = opt === 'Yes'
              const selected = values[current.key] === val
              return (
                <button key={opt} onClick={() => setValue(val)}
                  style={{
                    flex: 1, padding: '0.75rem', borderRadius: '0.75rem',
                    border: `1px solid ${selected ? '#c9a84c' : '#252525'}`,
                    background: selected ? 'rgba(201,168,76,0.1)' : 'transparent',
                    color: selected ? '#c9a84c' : '#5a5855',
                    fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
                  }}>
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {current.type === 'time' && (
          <input type="time" className="input-field w-40"
            value={(values[current.key] as string) || ''}
            onChange={e => setValue(e.target.value)} autoFocus />
        )}

        {current.type === 'number' && (
          <input type="number" className="input-field w-32"
            placeholder={(current as any).placeholder}
            value={(values[current.key] as string) || ''}
            onChange={e => setValue(e.target.value)} autoFocus min={0} />
        )}

        {current.type === 'textarea' && (
          <textarea className="textarea-field"
            rows={current.key === 'top3' ? 5 : 3}
            placeholder={(current as any).placeholder}
            value={(values[current.key] as string) || ''}
            onChange={e => setValue(e.target.value)} autoFocus />
        )}

        <div className="flex items-center justify-between mt-8">
          <p style={{ color: '#3a3a3a', fontSize: '0.75rem' }}>⌘↵ to continue</p>
          <button onClick={advance} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? 'Saving...' : isLast ? <><Check className="w-4 h-4" /> Complete</> : <>Next <ChevronRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>
    </div>
  )
}
