'use client'
import { useState, useTransition } from 'react'
import { setHabitCompletion, createHabit, archiveHabit } from '@/actions/habits'
import { CheckSquare, Square, Plus, X, ChevronDown, ChevronUp } from 'lucide-react'

type Habit = {
  id: string
  name: string
  identityStatement: string | null
  twoMinuteVersion: string | null
  cue: string | null
  completed: boolean
  satisfaction: number | null
}

interface Props {
  habits: Habit[]
  date: string
}

function HabitRow({ habit, date }: { habit: Habit; date: string }) {
  const [expanded, setExpanded] = useState(false)
  const [pending, startTransition] = useTransition()

  const toggle = () => {
    startTransition(() => setHabitCompletion(habit.id, date, !habit.completed))
  }

  const remove = () => {
    startTransition(() => archiveHabit(habit.id))
  }

  return (
    <div className={`card transition-all ${habit.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3">
        <button onClick={toggle} disabled={pending} className="text-[#a8a5a0] hover:text-[#6b8f71] transition-colors shrink-0">
          {habit.completed
            ? <CheckSquare className="w-5 h-5 text-[#6b8f71]" strokeWidth={1.5} />
            : <Square className="w-5 h-5" strokeWidth={1.5} />}
        </button>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${habit.completed ? 'line-through text-[#5a5855]' : 'text-[#e8e6e3]'}`}>
            {habit.name}
          </p>
          {habit.identityStatement && (
            <p className="text-[10px] text-[#5a5855] mt-0.5 truncate italic">
              I am the type of person who {habit.identityStatement}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setExpanded(e => !e)} className="text-[#5a5855] hover:text-[#a8a5a0] transition-colors p-1">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <button onClick={remove} className="text-[#5a5855] hover:text-red-400 transition-colors p-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-[#1e1e1e] space-y-1.5">
          {habit.cue && (
            <p className="text-xs text-[#5a5855]">
              <span className="text-[#a8a5a0]">Cue:</span> {habit.cue}
            </p>
          )}
          {habit.twoMinuteVersion && (
            <p className="text-xs text-[#5a5855]">
              <span className="text-[#a8a5a0]">2-min version:</span> {habit.twoMinuteVersion}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function AddHabitForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('')
  const [identity, setIdentity] = useState('')
  const [cue, setCue] = useState('')
  const [twoMin, setTwoMin] = useState('')
  const [pending, startTransition] = useTransition()

  const submit = () => {
    if (!name.trim()) return
    startTransition(async () => {
      await createHabit({
        name: name.trim(),
        identityStatement: identity.trim() || undefined,
        cue: cue.trim() || undefined,
        twoMinuteVersion: twoMin.trim() || undefined,
      })
      onDone()
    })
  }

  return (
    <div className="card space-y-3">
      <p className="section-title">New Habit</p>
      <input className="input-field" placeholder="Habit name" value={name} onChange={e => setName(e.target.value)} autoFocus />
      <input className="input-field" placeholder="Identity: I am the type of person who..." value={identity} onChange={e => setIdentity(e.target.value)} />
      <input className="input-field" placeholder="Cue / trigger" value={cue} onChange={e => setCue(e.target.value)} />
      <input className="input-field" placeholder="2-minute version (for hard days)" value={twoMin} onChange={e => setTwoMin(e.target.value)} />
      <div className="flex gap-2 justify-end">
        <button onClick={onDone} className="btn-ghost">Cancel</button>
        <button onClick={submit} disabled={pending || !name.trim()} className="btn-primary">
          {pending ? 'Saving...' : 'Add habit'}
        </button>
      </div>
    </div>
  )
}

export default function HabitsClient({ habits, date }: Props) {
  const [adding, setAdding] = useState(false)
  const done = habits.filter(h => h.completed).length
  const total = habits.length

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-8 pt-10 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#e8e6e3]">Habits</h1>
          <p className="text-[#5a5855] text-sm mt-1">{done}/{total} complete today</p>
        </div>
        <button onClick={() => setAdding(a => !a)} className="btn-ghost flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="px-8 pb-8 space-y-3 max-w-2xl">
        {adding && <AddHabitForm onDone={() => setAdding(false)} />}

        {habits.length === 0 && !adding && (
          <div className="card text-center py-10">
            <p className="text-[#5a5855] text-sm">No habits yet.</p>
            <p className="text-[#3a3a3a] text-xs mt-1">Add your first atomic habit above.</p>
          </div>
        )}

        {habits.map(h => <HabitRow key={h.id} habit={h} date={date} />)}
      </div>
    </div>
  )
}
