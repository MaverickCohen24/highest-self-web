'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveEveningLog } from '@/actions/daily'
import { Check, Moon, ChevronRight } from 'lucide-react'

type EveningLog = {
  wins: string | null
  ownedFailure: string | null
  emotionalPattern: string | null
  shadowInsight: string | null
  creativeCapture: string | null
  tomorrowFocus: string | null
  sleepTargetTime: string | null
} | null

interface Props {
  entry: { id: string; eveningCompleted: boolean; eveningLog: EveningLog }
  date: string
}

const STEPS = [
  { key: 'wins', label: 'Wins', prompt: 'Three wins today — minimum.', type: 'textarea', placeholder: '1.\n2.\n3.' },
  { key: 'ownedFailure', label: 'Ownership', prompt: 'What did you own today? No excuses. (Jocko)', type: 'textarea', placeholder: 'I take full responsibility for...' },
  { key: 'emotionalPattern', label: 'Emotional Audit', prompt: 'What drove your emotions today? (Laws of Human Nature)', type: 'textarea', placeholder: 'I noticed I was triggered by / motivated by...' },
  { key: 'shadowInsight', label: 'Shadow Work', prompt: 'What did you deflect, avoid, or project today?', type: 'textarea', placeholder: 'I avoided looking at...' },
  { key: 'creativeCapture', label: 'Creative Capture', prompt: 'What did you observe, create, or notice?', type: 'textarea', placeholder: 'A thought, image, conversation, or beauty I encountered...' },
  { key: 'tomorrowFocus', label: 'Tomorrow', prompt: "Tomorrow's single most important focus.", type: 'textarea', placeholder: 'Tomorrow I will...' },
  { key: 'sleepTargetTime', label: 'Sleep Target', prompt: 'What time are you targeting sleep tonight?', type: 'time' },
]

function LogView({ log }: { log: NonNullable<EveningLog> }) {
  const items = [
    { label: 'Wins', value: log.wins },
    { label: 'What I owned', value: log.ownedFailure },
    { label: 'Emotional pattern', value: log.emotionalPattern },
    { label: 'Shadow insight', value: log.shadowInsight },
    { label: 'Creative capture', value: log.creativeCapture },
    { label: "Tomorrow's focus", value: log.tomorrowFocus },
    { label: 'Sleep target', value: log.sleepTargetTime },
  ]

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-8 pt-10 pb-4 flex items-center gap-3">
        <Moon className="w-5 h-5 text-[#8b7ab8]" strokeWidth={1.5} />
        <h1 className="text-2xl font-semibold text-[#e8e6e3]">Evening log</h1>
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

export default function EveningReviewClient({ entry, date }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [showLog, setShowLog] = useState(entry.eveningCompleted)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const setValue = (val: string) => setValues(v => ({ ...v, [current.key]: val }))

  const advance = async () => {
    if (isLast) {
      setSaving(true)
      await saveEveningLog(entry.id, date, values)
      setSaving(false)
      setShowLog(true)
    } else {
      setStep(s => s + 1)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') advance()
  }

  if (showLog && entry.eveningLog) {
    return <LogView log={entry.eveningLog} />
  }

  return (
    <div className="flex flex-col h-full" onKeyDown={handleKey}>
      <div className="flex items-center gap-1.5 px-8 pt-8 pb-2">
        {STEPS.map((_, i) => (
          <div key={i} style={{
            height: '0.25rem', borderRadius: '9999px', transition: 'all 300ms',
            background: i < step ? '#8b7ab8' : i === step ? 'rgba(139,122,184,0.6)' : '#252525',
            width: i < step ? '1.5rem' : i === step ? '1rem' : '0.5rem'
          }} />
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 max-w-xl" onKeyDown={handleKey}>
        <p style={{ color: '#5a5855', fontSize: '0.625rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>
          {current.label}
        </p>
        <h2 className="text-xl font-medium text-[#e8e6e3] mb-8 leading-snug">
          {current.prompt}
        </h2>

        {current.type === 'textarea' && (
          <textarea className="textarea-field" rows={4}
            placeholder={(current as any).placeholder}
            value={values[current.key] || ''}
            onChange={e => setValue(e.target.value)} autoFocus />
        )}

        {current.type === 'time' && (
          <input type="time" className="input-field w-40"
            value={values[current.key] || ''}
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
