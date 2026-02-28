'use client'
import { useState, useTransition } from 'react'
import { setHabitCompletion, createHabit, archiveHabit } from '@/actions/habits'
import { CheckSquare, Square, Plus, X, ChevronDown, ChevronUp, Flame } from 'lucide-react'

type Habit = {
  id: string
  name: string
  identityStatement: string | null
  implementation: string | null
  habitStack: string | null
  cue: string | null
  craving: string | null
  reward: string | null
  twoMinuteVersion: string | null
  completed: boolean
  satisfaction: number | null
  streak: number
}

interface Props {
  habits: Habit[]
  date: string
}

const LAW_COLORS = {
  1: '#6b7fa3',
  2: '#c9a84c',
  3: '#6b8f71',
  4: '#a07cc5',
}

function SatisfactionDots({ value, onChange }: { value: number | null; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          style={{
            width: '1.25rem', height: '1.25rem', borderRadius: '50%',
            background: value !== null && n <= value ? '#a07cc5' : 'transparent',
            border: `1px solid ${value !== null && n <= value ? '#a07cc5' : '#252525'}`,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        />
      ))}
    </div>
  )
}

function HabitRow({ habit, date }: { habit: Habit; date: string }) {
  const [expanded, setExpanded] = useState(false)
  const [localSatisfaction, setLocalSatisfaction] = useState<number | null>(habit.satisfaction)
  const [pending, startTransition] = useTransition()

  const toggle = () => {
    startTransition(() => setHabitCompletion(habit.id, date, !habit.completed))
  }

  const rateSatisfaction = (n: number) => {
    setLocalSatisfaction(n)
    startTransition(() => setHabitCompletion(habit.id, date, true, n))
  }

  const remove = () => {
    if (!confirm(`Archive "${habit.name}"?`)) return
    startTransition(() => archiveHabit(habit.id))
  }

  const hasDetails = habit.identityStatement || habit.implementation || habit.habitStack ||
    habit.cue || habit.craving || habit.reward || habit.twoMinuteVersion

  return (
    <div style={{
      background: '#161616', borderRadius: '0.75rem',
      border: `1px solid ${habit.completed ? '#1e2e1e' : '#252525'}`,
      padding: '0.875rem 1rem',
      opacity: habit.completed && !expanded ? 0.7 : 1,
      transition: 'all 0.2s',
    }}>
      <div className="flex items-center gap-3">
        {/* Checkbox */}
        <button onClick={toggle} disabled={pending} style={{ color: habit.completed ? '#6b8f71' : '#5a5855', flexShrink: 0, transition: 'color 0.15s' }}>
          {habit.completed
            ? <CheckSquare className="w-5 h-5" strokeWidth={1.5} />
            : <Square className="w-5 h-5" strokeWidth={1.5} />}
        </button>

        {/* Name + identity */}
        <div className="flex-1 min-w-0">
          <p style={{
            fontSize: '0.875rem', fontWeight: 500,
            color: habit.completed ? '#5a5855' : '#e8e6e3',
            textDecoration: habit.completed ? 'line-through' : 'none',
          }}>
            {habit.name}
          </p>
          {habit.identityStatement && (
            <p style={{ fontSize: '0.625rem', color: '#5a5855', marginTop: '0.125rem', fontStyle: 'italic' }}>
              I am the type of person who {habit.identityStatement}
            </p>
          )}
        </div>

        {/* Streak */}
        {habit.streak > 0 && (
          <div className="flex items-center gap-0.5" style={{ color: habit.streak >= 7 ? '#c9a84c' : '#5a5855' }}>
            <Flame className="w-3 h-3" strokeWidth={1.5} />
            <span style={{ fontSize: '0.625rem', fontWeight: 500 }}>{habit.streak}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          {hasDetails && (
            <button onClick={() => setExpanded(e => !e)} style={{ color: '#5a5855', padding: '0.25rem' }}>
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
          <button onClick={remove} style={{ color: '#5a5855', padding: '0.25rem' }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Satisfaction rating after completion */}
      {habit.completed && (
        <div className="flex items-center gap-2 mt-2.5 ml-8">
          <span style={{ fontSize: '0.625rem', color: '#5a5855' }}>Satisfaction</span>
          <SatisfactionDots value={localSatisfaction} onChange={rateSatisfaction} />
        </div>
      )}

      {/* Expanded: 4 Laws breakdown */}
      {expanded && hasDetails && (
        <div className="mt-3 pt-3 space-y-2.5" style={{ borderTop: '1px solid #1e1e1e', marginLeft: '2rem' }}>

          {(habit.implementation || habit.habitStack) && (
            <div>
              <p style={{ fontSize: '0.5rem', color: LAW_COLORS[1], textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '0.375rem' }}>
                Law 1 · Make it Obvious
              </p>
              {habit.implementation && (
                <p style={{ fontSize: '0.75rem', color: '#a8a5a0', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#5a5855' }}>When: </span>{habit.implementation}
                </p>
              )}
              {habit.habitStack && (
                <p style={{ fontSize: '0.75rem', color: '#a8a5a0' }}>
                  <span style={{ color: '#5a5855' }}>After: </span>{habit.habitStack}
                </p>
              )}
            </div>
          )}

          {habit.craving && (
            <div>
              <p style={{ fontSize: '0.5rem', color: LAW_COLORS[2], textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '0.375rem' }}>
                Law 2 · Make it Attractive
              </p>
              <p style={{ fontSize: '0.75rem', color: '#a8a5a0' }}>{habit.craving}</p>
            </div>
          )}

          {habit.twoMinuteVersion && (
            <div>
              <p style={{ fontSize: '0.5rem', color: LAW_COLORS[3], textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '0.375rem' }}>
                Law 3 · Make it Easy
              </p>
              <p style={{ fontSize: '0.75rem', color: '#a8a5a0' }}>
                <span style={{ color: '#5a5855' }}>2-min: </span>{habit.twoMinuteVersion}
              </p>
            </div>
          )}

          {habit.reward && (
            <div>
              <p style={{ fontSize: '0.5rem', color: LAW_COLORS[4], textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '0.375rem' }}>
                Law 4 · Make it Satisfying
              </p>
              <p style={{ fontSize: '0.75rem', color: '#a8a5a0' }}>
                <span style={{ color: '#5a5855' }}>Reward: </span>{habit.reward}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AddHabitForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('')
  const [identity, setIdentity] = useState('')
  const [implementation, setImplementation] = useState('')
  const [habitStack, setHabitStack] = useState('')
  const [craving, setCraving] = useState('')
  const [twoMin, setTwoMin] = useState('')
  const [reward, setReward] = useState('')
  const [pending, startTransition] = useTransition()

  const submit = () => {
    if (!name.trim()) return
    startTransition(async () => {
      await createHabit({
        name: name.trim(),
        identityStatement: identity.trim() || undefined,
        implementation: implementation.trim() || undefined,
        habitStack: habitStack.trim() || undefined,
        craving: craving.trim() || undefined,
        twoMinuteVersion: twoMin.trim() || undefined,
        reward: reward.trim() || undefined,
      })
      onDone()
    })
  }

  const Section = ({ law, color, label }: { law: number; color: string; label: string }) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      paddingTop: '0.75rem', marginTop: '0.25rem', borderTop: '1px solid #1e1e1e',
    }}>
      <span style={{
        fontSize: '0.5rem', color, textTransform: 'uppercase',
        letterSpacing: '0.12em', fontWeight: 600, whiteSpace: 'nowrap',
      }}>
        Law {law} · {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: color, opacity: 0.2 }} />
    </div>
  )

  return (
    <div style={{ background: '#161616', borderRadius: '0.75rem', border: '1px solid #252525', padding: '1rem' }}>
      <p style={{ color: '#5a5855', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: '0.75rem' }}>
        New Habit
      </p>

      <div className="space-y-3">
        <div>
          <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.375rem' }}>Habit name *</label>
          <input className="input-field" placeholder="e.g. Morning meditation" value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>

        <div>
          <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.375rem' }}>Identity</label>
          <input className="input-field" placeholder="I am the type of person who..." value={identity} onChange={e => setIdentity(e.target.value)} />
        </div>

        <Section law={1} color={LAW_COLORS[1]} label="Make it Obvious" />

        <div>
          <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.375rem' }}>Implementation intention</label>
          <input className="input-field" placeholder="I will [behavior] at [time] in [location]" value={implementation} onChange={e => setImplementation(e.target.value)} />
        </div>

        <div>
          <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.375rem' }}>Habit stack</label>
          <input className="input-field" placeholder="After [current habit], I will [new habit]" value={habitStack} onChange={e => setHabitStack(e.target.value)} />
        </div>

        <Section law={2} color={LAW_COLORS[2]} label="Make it Attractive" />

        <div>
          <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.375rem' }}>Why does this matter?</label>
          <input className="input-field" placeholder="The craving / motivation behind this habit" value={craving} onChange={e => setCraving(e.target.value)} />
        </div>

        <Section law={3} color={LAW_COLORS[3]} label="Make it Easy" />

        <div>
          <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.375rem' }}>2-minute version</label>
          <input className="input-field" placeholder="The smallest possible version of this habit" value={twoMin} onChange={e => setTwoMin(e.target.value)} />
        </div>

        <Section law={4} color={LAW_COLORS[4]} label="Make it Satisfying" />

        <div>
          <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.375rem' }}>Reward / celebration</label>
          <input className="input-field" placeholder="How will you celebrate completing this?" value={reward} onChange={e => setReward(e.target.value)} />
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onDone} className="btn-ghost">Cancel</button>
          <button onClick={submit} disabled={pending || !name.trim()} className="btn-primary">
            {pending ? 'Saving...' : 'Add habit'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HabitsClient({ habits, date }: Props) {
  const [adding, setAdding] = useState(false)
  const done = habits.filter(h => h.completed).length
  const total = habits.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-8 pt-10 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#e8e6e3]">Habits</h1>
          <p style={{ color: '#5a5855', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {done}/{total} today · {pct}% complete
          </p>
        </div>
        <button onClick={() => setAdding(a => !a)} className="btn-ghost flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> New habit
        </button>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="px-8 pb-4 max-w-2xl">
          <div style={{ height: '2px', background: '#1e1e1e', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '9999px',
              width: `${pct}%`, transition: 'width 0.4s ease',
              background: pct === 100 ? '#6b8f71' : '#c9a84c',
            }} />
          </div>
        </div>
      )}

      <div className="px-8 pb-8 space-y-3 max-w-2xl">
        {adding && <AddHabitForm onDone={() => setAdding(false)} />}

        {habits.length === 0 && !adding && (
          <div style={{ background: '#161616', borderRadius: '0.75rem', border: '1px solid #252525', padding: '3rem 1rem', textAlign: 'center' }}>
            <p style={{ color: '#5a5855', fontSize: '0.875rem', marginBottom: '0.5rem' }}>No habits yet</p>
            <p style={{ color: '#3a3a3a', fontSize: '0.75rem' }}>
              Add your first habit using the 4 Laws of Behavior Change
            </p>
          </div>
        )}

        {habits.map(h => <HabitRow key={h.id} habit={h} date={date} />)}

        {total > 0 && (
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #1e1e1e' }}>
            <p style={{ fontSize: '0.625rem', color: '#3a3a3a', textAlign: 'center' }}>
              Make it Obvious · Make it Attractive · Make it Easy · Make it Satisfying
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
