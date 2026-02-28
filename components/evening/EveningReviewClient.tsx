'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveEveningLog } from '@/actions/daily'
import { Check, Moon, ChevronRight } from 'lucide-react'

interface Props {
  entry: { id: string; eveningCompleted: boolean }
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

export default function EveningReviewClient({ entry, date }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(entry.eveningCompleted ? STEPS.length : 0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const done = step === STEPS.length

  const setValue = (val: string) => setValues(v => ({ ...v, [current.key]: val }))

  const advance = async () => {
    if (isLast) {
      setSaving(true)
      await saveEveningLog(entry.id, date, values)
      setSaving(false)
      setStep(STEPS.length)
    } else {
      setStep(s => s + 1)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') advance()
  }

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-8">
        <div className="w-14 h-14 rounded-full bg-[#8b7ab8]/10 flex items-center justify-center">
          <Moon className="w-7 h-7 text-[#8b7ab8]" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-[#e8e6e3] mb-2">Evening complete.</h2>
          <p className="text-[#5a5855] text-sm">Rest well. Tomorrow you go again.</p>
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
          <div key={i} className={`h-1 rounded-full transition-all duration-300 ${
            i < step ? 'bg-[#8b7ab8] w-6' : i === step ? 'bg-[#8b7ab8]/60 w-4' : 'bg-[#252525] w-2'
          }`} />
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 max-w-xl" onKeyDown={handleKey}>
        <p className="text-[#5a5855] text-xs font-medium uppercase tracking-widest mb-3">
          {current.label}
        </p>
        <h2 className="text-xl font-medium text-[#e8e6e3] mb-8 leading-snug">
          {current.prompt}
        </h2>

        {current.type === 'textarea' && (
          <textarea
            className="textarea-field"
            rows={4}
            placeholder={(current as any).placeholder}
            value={values[current.key] || ''}
            onChange={e => setValue(e.target.value)}
            autoFocus
          />
        )}

        {current.type === 'time' && (
          <input
            type="time"
            className="input-field w-40"
            value={values[current.key] || ''}
            onChange={e => setValue(e.target.value)}
            autoFocus
          />
        )}

        <div className="flex items-center justify-between mt-8">
          <p className="text-[#3a3a3a] text-xs">⌘↵ to continue</p>
          <button onClick={advance} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? 'Saving...' : isLast ? (
              <><Check className="w-4 h-4" /> Complete</>
            ) : (
              <>Next <ChevronRight className="w-4 h-4" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
