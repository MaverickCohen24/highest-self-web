'use client'
import Link from 'next/link'
import { Sun, Moon, CheckSquare, Activity, Map, Palette, BookOpen, ChevronLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type DayData = {
  entry: {
    morningCompleted: boolean
    eveningCompleted: boolean
    morningLog: {
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
    eveningLog: {
      wins: string | null
      ownedFailure: string | null
      emotionalPattern: string | null
      shadowInsight: string | null
      creativeCapture: string | null
      tomorrowFocus: string | null
      sleepTargetTime: string | null
    } | null
  } | null
  completions: { habit: { name: string; identityStatement: string | null }; completed: boolean }[]
  workouts: { type: string; galpinAdaptation: string | null; durationMin: number | null }[]
  sleepLog: { bedtime: string | null; wakeTime: string | null; quality: number | null } | null
  reflections: { content: string | null; patternTag: string | null }[]
  creativEntries: { content: string | null; prompt: string | null }[]
  masterySessions: { minutes: number; skill: { name: string }; breakthrough: string | null }[]
}

function Section({ icon, title, color, children }: {
  icon: React.ReactNode; title: string; color: string; children: React.ReactNode
}) {
  return (
    <div style={{ background: '#161616', borderRadius: '0.75rem', border: '1px solid #252525', padding: '1rem' }}>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color }}>{icon}</span>
        <p style={{ color: '#5a5855', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>{title}</p>
      </div>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <p style={{ color: '#5a5855', fontSize: '0.625rem', marginBottom: '0.25rem' }}>{label}</p>
      <p style={{ color: '#a8a5a0', fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{value}</p>
    </div>
  )
}

export default function DayEntryClient({ date, data }: { date: string; data: DayData }) {
  const { entry, completions, workouts, sleepLog, reflections, creativEntries, masterySessions } = data
  const m = entry?.morningLog
  const e = entry?.eveningLog
  const doneHabits = completions.filter(c => c.completed)

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-8 pt-10 pb-4 flex items-center gap-3">
        <Link href="/journal" style={{ color: '#5a5855', display: 'flex', alignItems: 'center' }}>
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-semibold text-[#e8e6e3]">{formatDate(date)}</h1>
      </div>

      <div className="px-8 pb-8 space-y-4 max-w-2xl">
        {/* Morning */}
        {m && (
          <Section icon={<Sun className="w-4 h-4" strokeWidth={1.5} />} title="Morning" color="#c9a84c">
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { label: 'Wake', value: m.wakeTime },
                { label: 'Sunlight', value: m.sunlightMinutes ? `${m.sunlightMinutes}min` : null },
                { label: 'Meditation', value: m.meditationMinutes ? `${m.meditationMinutes}min` : null },
              ].map(({ label, value }) => value && (
                <div key={label} style={{ background: '#0f0f0f', borderRadius: '0.5rem', padding: '0.5rem', textAlign: 'center' }}>
                  <p style={{ color: '#c9a84c', fontSize: '0.875rem', fontWeight: 500 }}>{value}</p>
                  <p style={{ color: '#5a5855', fontSize: '0.625rem', marginTop: '0.125rem' }}>{label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mb-3">
              {[
                { label: 'Caffeine ✓', active: m.caffeineDelayed90min },
                { label: 'Exercise ✓', active: m.exerciseDone },
                { label: 'Cold ✓', active: m.coldExposure },
              ].map(({ label, active }) => (
                <span key={label} style={{
                  fontSize: '0.625rem', padding: '0.25rem 0.5rem', borderRadius: '9999px',
                  background: active ? 'rgba(201,168,76,0.1)' : '#252525',
                  color: active ? '#c9a84c' : '#3a3a3a',
                }}>{label}</span>
              ))}
            </div>
            {m.identityAffirmation && <Field label="Identity" value={`I am the type of person who ${m.identityAffirmation}`} />}
            <Field label="Intention" value={m.intention} />
            <Field label="Creative eye" value={m.creativeObservation} />
            <Field label="Top 3" value={m.top3} />
          </Section>
        )}

        {/* Evening */}
        {e && (
          <Section icon={<Moon className="w-4 h-4" strokeWidth={1.5} />} title="Evening" color="#8b7ab8">
            <Field label="Wins" value={e.wins} />
            <Field label="What I owned" value={e.ownedFailure} />
            <Field label="Emotional pattern" value={e.emotionalPattern} />
            <Field label="Shadow insight" value={e.shadowInsight} />
            <Field label="Creative capture" value={e.creativeCapture} />
            <Field label="Tomorrow's focus" value={e.tomorrowFocus} />
            {e.sleepTargetTime && <Field label="Sleep target" value={e.sleepTargetTime} />}
          </Section>
        )}

        {/* Habits */}
        {completions.length > 0 && (
          <Section icon={<CheckSquare className="w-4 h-4" strokeWidth={1.5} />} title={`Habits — ${doneHabits.length}/${completions.length}`} color="#6b8f71">
            <div className="space-y-1.5">
              {completions.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div style={{ width: '0.375rem', height: '0.375rem', borderRadius: '9999px', background: c.completed ? '#6b8f71' : '#252525', flexShrink: 0 }} />
                  <p style={{ fontSize: '0.875rem', color: c.completed ? '#e8e6e3' : '#5a5855' }}>{c.habit.name}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Workouts */}
        {workouts.length > 0 && (
          <Section icon={<Activity className="w-4 h-4" strokeWidth={1.5} />} title="Workouts" color="#6b7fa3">
            {workouts.map((w, i) => (
              <div key={i} style={{ marginBottom: '0.5rem' }}>
                <p style={{ color: '#e8e6e3', fontSize: '0.875rem' }}>{w.type}</p>
                <p style={{ color: '#5a5855', fontSize: '0.75rem' }}>
                  {[w.galpinAdaptation, w.durationMin ? `${w.durationMin}min` : null].filter(Boolean).join(' · ')}
                </p>
              </div>
            ))}
          </Section>
        )}

        {/* Sleep */}
        {sleepLog && (sleepLog.bedtime || sleepLog.wakeTime || sleepLog.quality) && (
          <Section icon={<Moon className="w-4 h-4" strokeWidth={1.5} />} title="Sleep" color="#8b7ab8">
            <div className="flex gap-4">
              {sleepLog.bedtime && <Field label="Bedtime" value={sleepLog.bedtime} />}
              {sleepLog.wakeTime && <Field label="Wake" value={sleepLog.wakeTime} />}
              {sleepLog.quality && <Field label="Quality" value={`${sleepLog.quality}/10`} />}
            </div>
          </Section>
        )}

        {/* Mastery */}
        {masterySessions.length > 0 && (
          <Section icon={<Map className="w-4 h-4" strokeWidth={1.5} />} title="Mastery" color="#c9a84c">
            {masterySessions.map((s, i) => (
              <div key={i} style={{ marginBottom: '0.5rem' }}>
                <p style={{ color: '#e8e6e3', fontSize: '0.875rem' }}>{s.skill.name} — {s.minutes}min</p>
                {s.breakthrough && <p style={{ color: '#5a5855', fontSize: '0.75rem', marginTop: '0.125rem' }}>{s.breakthrough}</p>}
              </div>
            ))}
          </Section>
        )}

        {/* Creative */}
        {creativEntries.length > 0 && (
          <Section icon={<Palette className="w-4 h-4" strokeWidth={1.5} />} title="Creative" color="#c9a84c">
            {creativEntries.map((c, i) => (
              <div key={i} style={{ marginBottom: '0.75rem' }}>
                {c.prompt && <p style={{ color: '#5a5855', fontSize: '0.75rem', fontStyle: 'italic', marginBottom: '0.25rem' }}>"{c.prompt}"</p>}
                <p style={{ color: '#a8a5a0', fontSize: '0.875rem', lineHeight: 1.6 }}>{c.content}</p>
              </div>
            ))}
          </Section>
        )}

        {/* Reflections */}
        {reflections.length > 0 && (
          <Section icon={<BookOpen className="w-4 h-4" strokeWidth={1.5} />} title="Reflections" color="#8b7ab8">
            {reflections.map((r, i) => (
              <div key={i} style={{ marginBottom: '0.75rem' }}>
                {r.patternTag && <span style={{ fontSize: '0.625rem', padding: '0.125rem 0.5rem', borderRadius: '9999px', background: '#252525', color: '#5a5855', marginBottom: '0.25rem', display: 'inline-block' }}>{r.patternTag}</span>}
                <p style={{ color: '#a8a5a0', fontSize: '0.875rem', lineHeight: 1.6 }}>{r.content}</p>
              </div>
            ))}
          </Section>
        )}
      </div>
    </div>
  )
}
