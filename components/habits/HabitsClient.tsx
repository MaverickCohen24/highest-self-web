'use client'
import { useState, useTransition } from 'react'
import { setHabitCompletion, createHabit, archiveHabit } from '@/actions/habits'
import { CheckSquare, Square, Plus, X, ChevronDown, ChevronUp, Flame, ShieldCheck } from 'lucide-react'

type Habit = {
  id: string
  name: string
  type: string
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

// Build: 4 Laws · Break: Inverted 4 Laws
const BUILD_LAWS = {
  1: { color: '#6b7fa3', label: 'Make it Obvious' },
  2: { color: '#c9a84c', label: 'Make it Attractive' },
  3: { color: '#6b8f71', label: 'Make it Easy' },
  4: { color: '#a07cc5', label: 'Make it Satisfying' },
}
const BREAK_LAWS = {
  1: { color: '#c47b5e', label: 'Make it Invisible' },
  2: { color: '#a07cc5', label: 'Make it Unattractive' },
  3: { color: '#6b7fa3', label: 'Make it Difficult' },
  4: { color: '#5a8a72', label: 'Make it Unsatisfying' },
}

function SatisfactionDots({ value, onChange }: { value: number | null; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} onClick={() => onChange(n)} style={{
          width: '1.125rem', height: '1.125rem', borderRadius: '50%',
          background: value !== null && n <= value ? '#a07cc5' : 'transparent',
          border: `1px solid ${value !== null && n <= value ? '#a07cc5' : '#252525'}`,
          cursor: 'pointer', transition: 'all 0.15s',
        }} />
      ))}
    </div>
  )
}

function HabitRow({ habit, date }: { habit: Habit; date: string }) {
  const isBreak = habit.type === 'break'
  const [expanded, setExpanded] = useState(false)
  const [localSatisfaction, setLocalSatisfaction] = useState<number | null>(habit.satisfaction)
  const [pending, startTransition] = useTransition()
  const laws = isBreak ? BREAK_LAWS : BUILD_LAWS

  const toggle = () => startTransition(() => setHabitCompletion(habit.id, date, !habit.completed))

  const rateSatisfaction = (n: number) => {
    setLocalSatisfaction(n)
    startTransition(() => setHabitCompletion(habit.id, date, true, n))
  }

  const remove = () => {
    if (!confirm(`Archive "${habit.name}"?`)) return
    startTransition(() => archiveHabit(habit.id))
  }

  const hasDetails = habit.identityStatement || habit.implementation || habit.habitStack ||
    habit.craving || habit.reward || habit.twoMinuteVersion

  const completedBorder = isBreak ? '#2e1e1e' : '#1e2e1e'
  const completedColor = isBreak ? '#c47b5e' : '#6b8f71'

  return (
    <div style={{
      background: '#161616', borderRadius: '0.75rem',
      border: `1px solid ${habit.completed ? completedBorder : '#252525'}`,
      padding: '0.875rem 1rem',
      opacity: habit.completed && !expanded ? 0.7 : 1,
      transition: 'all 0.2s',
    }}>
      <div className="flex items-center gap-3">
        <button onClick={toggle} disabled={pending} style={{ color: habit.completed ? completedColor : '#5a5855', flexShrink: 0, transition: 'color 0.15s' }}>
          {habit.completed
            ? isBreak
              ? <ShieldCheck className="w-5 h-5" strokeWidth={1.5} />
              : <CheckSquare className="w-5 h-5" strokeWidth={1.5} />
            : <Square className="w-5 h-5" strokeWidth={1.5} />}
        </button>

        <div className="flex-1 min-w-0">
          <p style={{
            fontSize: '0.875rem', fontWeight: 500,
            color: habit.completed ? '#5a5855' : '#e8e6e3',
            textDecoration: habit.completed && !isBreak ? 'line-through' : 'none',
          }}>
            {habit.name}
          </p>
          {habit.identityStatement && (
            <p style={{ fontSize: '0.625rem', color: '#5a5855', marginTop: '0.125rem', fontStyle: 'italic' }}>
              {isBreak ? 'I am the type of person who doesn\'t' : 'I am the type of person who'} {habit.identityStatement}
            </p>
          )}
        </div>

        {habit.streak > 0 && (
          <div className="flex items-center gap-0.5" style={{ color: habit.streak >= 7 ? '#c9a84c' : '#5a5855' }}>
            <Flame className="w-3 h-3" strokeWidth={1.5} />
            <span style={{ fontSize: '0.625rem', fontWeight: 500 }}>{habit.streak}</span>
          </div>
        )}

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

      {/* After completion */}
      {habit.completed && (
        <div className="flex items-center gap-2 mt-2.5 ml-8">
          {isBreak ? (
            <span style={{ fontSize: '0.625rem', color: '#5a8a72' }}>Clean today ✓</span>
          ) : (
            <>
              <span style={{ fontSize: '0.625rem', color: '#5a5855' }}>Satisfaction</span>
              <SatisfactionDots value={localSatisfaction} onChange={rateSatisfaction} />
            </>
          )}
        </div>
      )}

      {/* Expanded: laws breakdown */}
      {expanded && hasDetails && (
        <div className="mt-3 pt-3 space-y-2.5" style={{ borderTop: '1px solid #1e1e1e', marginLeft: '2rem' }}>
          {(habit.implementation || habit.habitStack) && (
            <div>
              <p style={{ fontSize: '0.5rem', color: laws[1].color, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '0.375rem' }}>
                {isBreak ? 'Inversion 1' : 'Law 1'} · {laws[1].label}
              </p>
              {habit.implementation && (
                <p style={{ fontSize: '0.75rem', color: '#a8a5a0', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#5a5855' }}>{isBreak ? 'Remove cues: ' : 'When: '}</span>{habit.implementation}
                </p>
              )}
              {habit.habitStack && (
                <p style={{ fontSize: '0.75rem', color: '#a8a5a0' }}>
                  <span style={{ color: '#5a5855' }}>{isBreak ? 'Instead: ' : 'After: '}</span>{habit.habitStack}
                </p>
              )}
            </div>
          )}

          {habit.craving && (
            <div>
              <p style={{ fontSize: '0.5rem', color: laws[2].color, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '0.375rem' }}>
                {isBreak ? 'Inversion 2' : 'Law 2'} · {laws[2].label}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#a8a5a0' }}>
                {isBreak && <span style={{ color: '#5a5855' }}>Real cost: </span>}{habit.craving}
              </p>
            </div>
          )}

          {habit.twoMinuteVersion && (
            <div>
              <p style={{ fontSize: '0.5rem', color: laws[3].color, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '0.375rem' }}>
                {isBreak ? 'Inversion 3' : 'Law 3'} · {laws[3].label}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#a8a5a0' }}>
                <span style={{ color: '#5a5855' }}>{isBreak ? 'Friction: ' : '2-min: '}</span>{habit.twoMinuteVersion}
              </p>
            </div>
          )}

          {habit.reward && (
            <div>
              <p style={{ fontSize: '0.5rem', color: laws[4].color, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: '0.375rem' }}>
                {isBreak ? 'Inversion 4' : 'Law 4'} · {laws[4].label}
              </p>
              <p style={{ fontSize: '0.75rem', color: '#a8a5a0' }}>
                <span style={{ color: '#5a5855' }}>{isBreak ? 'Accountability: ' : 'Reward: '}</span>{habit.reward}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function AddHabitForm({ defaultType, onDone }: { defaultType: 'build' | 'break'; onDone: () => void }) {
  const [type, setType] = useState<'build' | 'break'>(defaultType)
  const [name, setName] = useState('')
  const [identity, setIdentity] = useState('')
  const [implementation, setImplementation] = useState('')
  const [habitStack, setHabitStack] = useState('')
  const [craving, setCraving] = useState('')
  const [twoMin, setTwoMin] = useState('')
  const [reward, setReward] = useState('')
  const [pending, startTransition] = useTransition()
  const isBreak = type === 'break'
  const laws = isBreak ? BREAK_LAWS : BUILD_LAWS

  const submit = () => {
    if (!name.trim()) return
    startTransition(async () => {
      await createHabit({
        name: name.trim(),
        type,
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

  const Divider = ({ n }: { n: 1 | 2 | 3 | 4 }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.75rem', marginTop: '0.25rem', borderTop: '1px solid #1e1e1e' }}>
      <span style={{ fontSize: '0.5rem', color: laws[n].color, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, whiteSpace: 'nowrap' }}>
        {isBreak ? `Inversion ${n}` : `Law ${n}`} · {laws[n].label}
      </span>
      <div style={{ flex: 1, height: '1px', background: laws[n].color, opacity: 0.2 }} />
    </div>
  )

  return (
    <div style={{ background: '#161616', borderRadius: '0.75rem', border: '1px solid #252525', padding: '1rem' }}>
      {/* Type toggle */}
      <div className="flex gap-1 mb-4" style={{ background: '#0a0a0a', borderRadius: '0.5rem', padding: '0.25rem' }}>
        {(['build', 'break'] as const).map(t => (
          <button key={t} onClick={() => setType(t)} style={{
            flex: 1, padding: '0.375rem', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
            background: type === t ? (t === 'break' ? 'rgba(196,123,94,0.15)' : 'rgba(107,143,113,0.15)') : 'transparent',
            color: type === t ? (t === 'break' ? '#c47b5e' : '#6b8f71') : '#5a5855',
            border: 'none', transition: 'all 0.15s',
          }}>
            {t === 'build' ? 'Build a habit' : 'Break a habit'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div>
          <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.375rem' }}>
            {isBreak ? 'Bad habit to break *' : 'Habit to build *'}
          </label>
          <input className="input-field"
            placeholder={isBreak ? 'e.g. Doomscrolling before bed' : 'e.g. Morning meditation'}
            value={name} onChange={e => setName(e.target.value)} autoFocus />
        </div>

        <div>
          <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.375rem' }}>Identity</label>
          <input className="input-field"
            placeholder={isBreak ? "doesn't [bad habit] — e.g. scroll mindlessly" : 'I am the type of person who...'}
            value={identity} onChange={e => setIdentity(e.target.value)} />
        </div>

        <Divider n={1} />

        <div>
          <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.375rem' }}>
            {isBreak ? 'Remove the cues' : 'Implementation intention'}
          </label>
          <input className="input-field"
            placeholder={isBreak ? 'How will you hide or eliminate the trigger?' : 'I will [behavior] at [time] in [location]'}
            value={implementation} onChange={e => setImplementation(e.target.value)} />
        </div>

        <div>
          <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.375rem' }}>
            {isBreak ? 'Replacement behavior' : 'Habit stack'}
          </label>
          <input className="input-field"
            placeholder={isBreak ? 'When the urge hits, I will do [X] instead' : 'After [current habit], I will [new habit]'}
            value={habitStack} onChange={e => setHabitStack(e.target.value)} />
        </div>

        <Divider n={2} />

        <div>
          <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.375rem' }}>
            {isBreak ? 'The real cost' : 'Why does this matter?'}
          </label>
          <input className="input-field"
            placeholder={isBreak ? 'What is this habit actually costing you?' : 'The craving / motivation behind this habit'}
            value={craving} onChange={e => setCraving(e.target.value)} />
        </div>

        <Divider n={3} />

        <div>
          <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.375rem' }}>
            {isBreak ? 'Add friction' : '2-minute version'}
          </label>
          <input className="input-field"
            placeholder={isBreak ? 'What obstacle will make this harder to do?' : 'The smallest possible version of this habit'}
            value={twoMin} onChange={e => setTwoMin(e.target.value)} />
        </div>

        <Divider n={4} />

        <div>
          <label style={{ color: '#5a5855', fontSize: '0.75rem', display: 'block', marginBottom: '0.375rem' }}>
            {isBreak ? 'Accountability' : 'Reward / celebration'}
          </label>
          <input className="input-field"
            placeholder={isBreak ? "Who knows about this? What's the cost of slipping?" : 'How will you celebrate completing this?'}
            value={reward} onChange={e => setReward(e.target.value)} />
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button onClick={onDone} className="btn-ghost">Cancel</button>
          <button onClick={submit} disabled={pending || !name.trim()} className="btn-primary">
            {pending ? 'Saving...' : isBreak ? 'Track this habit' : 'Add habit'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function HabitsClient({ habits, date }: Props) {
  const [tab, setTab] = useState<'build' | 'break'>('build')
  const [adding, setAdding] = useState(false)

  const build = habits.filter(h => h.type !== 'break')
  const breaks = habits.filter(h => h.type === 'break')
  const active = tab === 'build' ? build : breaks

  const done = active.filter(h => h.completed).length
  const total = active.length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  const handleTabChange = (t: 'build' | 'break') => {
    setTab(t)
    setAdding(false)
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-8 pt-10 pb-4">
        <h1 className="text-2xl font-semibold text-[#e8e6e3]">Habits</h1>
        <p style={{ color: '#5a5855', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          {done}/{total} {tab === 'break' ? 'resisted' : 'done'} today
        </p>
      </div>

      {/* Tab bar */}
      <div className="px-8 pb-4 max-w-2xl">
        <div className="flex gap-1" style={{ background: '#0a0a0a', borderRadius: '0.625rem', padding: '0.25rem' }}>
          <button onClick={() => handleTabChange('build')} style={{
            flex: 1, padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
            background: tab === 'build' ? 'rgba(107,143,113,0.15)' : 'transparent',
            color: tab === 'build' ? '#6b8f71' : '#5a5855',
            border: 'none', transition: 'all 0.15s',
          }}>
            Build ({build.length})
          </button>
          <button onClick={() => handleTabChange('break')} style={{
            flex: 1, padding: '0.5rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer',
            background: tab === 'break' ? 'rgba(196,123,94,0.12)' : 'transparent',
            color: tab === 'break' ? '#c47b5e' : '#5a5855',
            border: 'none', transition: 'all 0.15s',
          }}>
            Break ({breaks.length})
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="px-8 pb-4 max-w-2xl">
          <div style={{ height: '2px', background: '#1e1e1e', borderRadius: '9999px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: '9999px', width: `${pct}%`,
              transition: 'width 0.4s ease',
              background: pct === 100
                ? (tab === 'break' ? '#5a8a72' : '#6b8f71')
                : (tab === 'break' ? '#c47b5e' : '#c9a84c'),
            }} />
          </div>
        </div>
      )}

      <div className="px-8 pb-8 space-y-3 max-w-2xl">
        {/* Add button */}
        <div className="flex justify-end">
          <button onClick={() => setAdding(a => !a)} className="btn-ghost flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            {tab === 'build' ? 'New habit' : 'Track bad habit'}
          </button>
        </div>

        {adding && <AddHabitForm defaultType={tab} onDone={() => setAdding(false)} />}

        {active.length === 0 && !adding && (
          <div style={{ background: '#161616', borderRadius: '0.75rem', border: '1px solid #252525', padding: '3rem 1rem', textAlign: 'center' }}>
            {tab === 'build' ? (
              <>
                <p style={{ color: '#5a5855', fontSize: '0.875rem', marginBottom: '0.5rem' }}>No habits yet</p>
                <p style={{ color: '#3a3a3a', fontSize: '0.75rem' }}>Add your first using the 4 Laws of Behavior Change</p>
              </>
            ) : (
              <>
                <p style={{ color: '#5a5855', fontSize: '0.875rem', marginBottom: '0.5rem' }}>No bad habits tracked</p>
                <p style={{ color: '#3a3a3a', fontSize: '0.75rem' }}>Use the inverted 4 Laws to make bad habits invisible, unattractive, difficult, and unsatisfying</p>
              </>
            )}
          </div>
        )}

        {active.map(h => <HabitRow key={h.id} habit={h} date={date} />)}

        {total > 0 && (
          <div style={{ paddingTop: '0.5rem', borderTop: '1px solid #1e1e1e' }}>
            <p style={{ fontSize: '0.625rem', color: '#3a3a3a', textAlign: 'center' }}>
              {tab === 'build'
                ? 'Make it Obvious · Make it Attractive · Make it Easy · Make it Satisfying'
                : 'Make it Invisible · Make it Unattractive · Make it Difficult · Make it Unsatisfying'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
