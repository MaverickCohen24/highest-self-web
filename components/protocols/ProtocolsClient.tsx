'use client'
import { useState, useTransition } from 'react'
import { saveSleepLog, logWorkout } from '@/actions/protocols'
import { Moon, Activity, Plus } from 'lucide-react'

const GALPIN = [
  'Strength', 'Hypertrophy', 'Power', 'Speed',
  'VO2 Max', 'Lactate Threshold', 'Muscular Endurance', 'Long Slow Distance', 'Skill',
]

type SleepLog = { bedtime: string | null; wakeTime: string | null; quality: number | null; notes: string | null } | null
type Workout = { id: string; type: string; galpinAdaptation: string | null; durationMin: number | null; intensity: number | null }

interface Props {
  date: string
  sleepLog: SleepLog
  workouts: Workout[]
}

function SleepSection({ date, sleepLog }: { date: string; sleepLog: SleepLog }) {
  const [bedtime, setBedtime] = useState(sleepLog?.bedtime ?? '')
  const [wakeTime, setWakeTime] = useState(sleepLog?.wakeTime ?? '')
  const [quality, setQuality] = useState(sleepLog?.quality?.toString() ?? '')
  const [notes, setNotes] = useState(sleepLog?.notes ?? '')
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const save = () => {
    startTransition(async () => {
      await saveSleepLog({
        date,
        bedtime: bedtime || undefined,
        wakeTime: wakeTime || undefined,
        quality: quality ? Number(quality) : undefined,
        notes: notes || undefined,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-2">
        <Moon className="w-4 h-4 text-[#8b7ab8]" strokeWidth={1.5} />
        <p className="section-title">Sleep</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#5a5855] mb-1 block">Bedtime</label>
          <input type="time" className="input-field" value={bedtime} onChange={e => setBedtime(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-[#5a5855] mb-1 block">Wake time</label>
          <input type="time" className="input-field" value={wakeTime} onChange={e => setWakeTime(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="text-xs text-[#5a5855] mb-1 block">Quality (1–10)</label>
        <input type="number" min={1} max={10} className="input-field w-24" value={quality} onChange={e => setQuality(e.target.value)} />
      </div>
      <textarea className="textarea-field" rows={2} placeholder="Notes..." value={notes} onChange={e => setNotes(e.target.value)} />
      <div className="flex justify-end">
        <button onClick={save} disabled={pending} className="btn-primary">
          {pending ? 'Saving...' : saved ? 'Saved!' : 'Save sleep log'}
        </button>
      </div>
    </div>
  )
}

function AddWorkoutForm({ date, onDone }: { date: string; onDone: () => void }) {
  const [type, setType] = useState('')
  const [adaptation, setAdaptation] = useState('')
  const [duration, setDuration] = useState('')
  const [intensity, setIntensity] = useState('')
  const [notes, setNotes] = useState('')
  const [pending, startTransition] = useTransition()

  const save = () => {
    if (!type.trim()) return
    startTransition(async () => {
      await logWorkout({
        date,
        type: type.trim(),
        galpinAdaptation: adaptation || undefined,
        durationMin: duration ? Number(duration) : undefined,
        intensity: intensity ? Number(intensity) : undefined,
        notes: notes || undefined,
      })
      onDone()
    })
  }

  return (
    <div className="card space-y-3">
      <p className="section-title">Log Workout</p>
      <input className="input-field" placeholder="Type (e.g. Run, Lift, Swim)" value={type} onChange={e => setType(e.target.value)} autoFocus />
      <div>
        <label className="text-xs text-[#5a5855] mb-1 block">Galpin Adaptation</label>
        <div className="flex flex-wrap gap-1.5">
          {GALPIN.map(g => (
            <button key={g} onClick={() => setAdaptation(a => a === g ? '' : g)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                adaptation === g
                  ? 'border-[#c9a84c] bg-[#c9a84c]/10 text-[#c9a84c]'
                  : 'border-[#252525] text-[#5a5855] hover:border-[#3a3a3a]'
              }`}>{g}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[#5a5855] mb-1 block">Duration (min)</label>
          <input type="number" className="input-field" value={duration} onChange={e => setDuration(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-[#5a5855] mb-1 block">Intensity (1–10)</label>
          <input type="number" min={1} max={10} className="input-field" value={intensity} onChange={e => setIntensity(e.target.value)} />
        </div>
      </div>
      <textarea className="textarea-field" rows={2} placeholder="Notes..." value={notes} onChange={e => setNotes(e.target.value)} />
      <div className="flex gap-2 justify-end">
        <button onClick={onDone} className="btn-ghost">Cancel</button>
        <button onClick={save} disabled={pending || !type.trim()} className="btn-primary">
          {pending ? 'Saving...' : 'Log workout'}
        </button>
      </div>
    </div>
  )
}

export default function ProtocolsClient({ date, sleepLog, workouts }: Props) {
  const [addingWorkout, setAddingWorkout] = useState(false)

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-8 pt-10 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#e8e6e3]">Protocols</h1>
          <p className="text-[#5a5855] text-sm mt-1">Sleep · Movement · Recovery</p>
        </div>
        <button onClick={() => setAddingWorkout(a => !a)} className="btn-ghost flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Workout
        </button>
      </div>

      <div className="px-8 pb-8 space-y-4 max-w-2xl">
        <SleepSection date={date} sleepLog={sleepLog} />

        {addingWorkout && <AddWorkoutForm date={date} onDone={() => setAddingWorkout(false)} />}

        {workouts.length > 0 && (
          <div className="space-y-2">
            <p className="section-title flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#6b7fa3]" strokeWidth={1.5} /> Today's Workouts
            </p>
            {workouts.map(w => (
              <div key={w.id} className="card flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#e8e6e3]">{w.type}</p>
                  {w.galpinAdaptation && <p className="text-xs text-[#5a5855]">{w.galpinAdaptation}</p>}
                </div>
                <div className="text-right">
                  {w.durationMin && <p className="text-sm text-[#a8a5a0]">{w.durationMin} min</p>}
                  {w.intensity && <p className="text-xs text-[#5a5855]">intensity {w.intensity}/10</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
