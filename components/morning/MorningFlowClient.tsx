'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveMorningLog } from '@/actions/daily'
import { ChevronRight, Check, Sun } from 'lucide-react'

interface Entry {
  id: string
  morningCompleted: boolean
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

export default function MorningFlowClient({ entry, date }: Props) {
  const router = useRouter()
  const [step, setStep] = useState(entry.morningCompleted ? STEPS.length : 0)
  const [values, setValues] = useState<Record<string, string | boolean>>({})
  const [saving, setSaving] = useState(false)

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
        <div className="w-14 h-14 rounded-full bg-[#c9a84c]/10 flex items-center justify-center">
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
      {/* Progress dots */}
      <div className="flex items-center gap-1.5 px-8 pt-8 pb-2">
        {STEPS.map((_, i) => (
          <div key={i} className={`h-1 rounded-full transition-all duration-300 ${
            i < step ? 'bg-[#c9a84c] w-6' : i === step ? 'bg-[#c9a84c]/60 w-4' : 'bg-[#252525] w-2'
          }`} />
        ))}
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 max-w-xl">
        <p className="text-[#5a5855] text-xs font-medium uppercase tracking-widest mb-3">
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
                <button
                  key={opt}
                  onClick={() => setValue(val)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${
                    selected
                      ? 'border-[#c9a84c] bg-[#c9a84c]/10 text-[#c9a84c]'
                      : 'border-[#252525] text-[#5a5855] hover:border-[#3a3a3a] hover:text-[#a8a5a0]'
                  }`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {current.type === 'time' && (
          <input
            type="time"
            className="input-field w-40"
            value={(values[current.key] as string) || ''}
            onChange={e => setValue(e.target.value)}
            autoFocus
          />
        )}

        {current.type === 'number' && (
          <input
            type="number"
            className="input-field w-32"
            placeholder={current.placeholder}
            value={(values[current.key] as string) || ''}
            onChange={e => setValue(e.target.value)}
            autoFocus
            min={0}
          />
        )}

        {current.type === 'textarea' && (
          <textarea
            className="textarea-field"
            rows={current.key === 'top3' ? 5 : 3}
            placeholder={current.placeholder}
            value={(values[current.key] as string) || ''}
            onChange={e => setValue(e.target.value)}
            autoFocus
          />
        )}

        <div className="flex items-center justify-between mt-8">
          <p className="text-[#3a3a3a] text-xs">⌘↵ to continue</p>
          <button
            onClick={advance}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
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
