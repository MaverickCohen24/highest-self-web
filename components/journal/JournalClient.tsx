'use client'
import Link from 'next/link'
import { BookOpen, Sun, Moon, CheckSquare, Flame, Zap } from 'lucide-react'
import { formatDate, formatDateShort } from '@/lib/utils'

type Entry = {
  id: string
  date: string
  morningCompleted: boolean
  eveningCompleted: boolean
}

type Stats = {
  morningStreak: number
  eveningStreak: number
  morningTotal: number
  eveningTotal: number
  habitDays: number
  masteryMinutes: number
  totalDays: number
}

interface Props {
  entries: Entry[]
  stats: Stats
}

export default function JournalClient({ entries, stats }: Props) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-8 pt-10 pb-4">
        <h1 className="text-2xl font-semibold text-[#e8e6e3]">Journal</h1>
        <p style={{ color: '#5a5855', fontSize: '0.875rem', marginTop: '0.25rem' }}>Your daily record</p>
      </div>

      <div className="px-8 pb-8 space-y-5 max-w-2xl">
        {/* Progress stats */}
        <div className="grid grid-cols-2 gap-3">
          <div style={{ background: '#161616', borderRadius: '0.75rem', border: '1px solid #252525', padding: '1rem' }}>
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-[#c9a84c]" strokeWidth={1.5} />
              <p style={{ color: '#5a5855', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>Streaks</p>
            </div>
            <div className="flex justify-between">
              <div>
                <p style={{ fontSize: '1.5rem', fontWeight: 300, color: '#c9a84c' }}>{stats.morningStreak}</p>
                <p style={{ fontSize: '0.625rem', color: '#5a5855', marginTop: '0.125rem' }}>morning days</p>
              </div>
              <div>
                <p style={{ fontSize: '1.5rem', fontWeight: 300, color: '#8b7ab8' }}>{stats.eveningStreak}</p>
                <p style={{ fontSize: '0.625rem', color: '#5a5855', marginTop: '0.125rem' }}>evening days</p>
              </div>
            </div>
          </div>

          <div style={{ background: '#161616', borderRadius: '0.75rem', border: '1px solid #252525', padding: '1rem' }}>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-[#6b7fa3]" strokeWidth={1.5} />
              <p style={{ color: '#5a5855', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>Last 30 days</p>
            </div>
            <div className="flex justify-between">
              <div>
                <p style={{ fontSize: '1.5rem', fontWeight: 300, color: '#6b8f71' }}>{stats.habitDays}</p>
                <p style={{ fontSize: '0.625rem', color: '#5a5855', marginTop: '0.125rem' }}>habit days</p>
              </div>
              <div>
                <p style={{ fontSize: '1.5rem', fontWeight: 300, color: '#6b7fa3' }}>{Math.round(stats.masteryMinutes / 60)}h</p>
                <p style={{ fontSize: '0.625rem', color: '#5a5855', marginTop: '0.125rem' }}>mastery</p>
              </div>
            </div>
          </div>
        </div>

        {/* Completion heatmap row */}
        {entries.length > 0 && (
          <div style={{ background: '#161616', borderRadius: '0.75rem', border: '1px solid #252525', padding: '1rem' }}>
            <p style={{ color: '#5a5855', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: '0.75rem' }}>
              Completion — last {entries.length} days
            </p>
            <div className="flex gap-1 flex-wrap">
              {[...entries].reverse().map(e => {
                const both = e.morningCompleted && e.eveningCompleted
                const one = e.morningCompleted || e.eveningCompleted
                return (
                  <div key={e.date} title={formatDateShort(e.date)} style={{
                    width: '1rem', height: '1rem', borderRadius: '0.2rem',
                    background: both ? '#c9a84c' : one ? 'rgba(201,168,76,0.4)' : '#252525',
                  }} />
                )
              })}
            </div>
            <div className="flex gap-4 mt-2">
              {[
                { color: '#c9a84c', label: 'Both complete' },
                { color: 'rgba(201,168,76,0.4)', label: 'Partial' },
                { color: '#252525', label: 'None' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1">
                  <div style={{ width: '0.625rem', height: '0.625rem', borderRadius: '0.125rem', background: color }} />
                  <span style={{ fontSize: '0.625rem', color: '#5a5855' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Day list */}
        <div className="space-y-2">
          <p style={{ color: '#5a5855', fontSize: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500 }}>Daily entries</p>
          {entries.length === 0 && (
            <div style={{ background: '#161616', borderRadius: '0.75rem', border: '1px solid #252525', padding: '2.5rem 1rem', textAlign: 'center' }}>
              <p style={{ color: '#5a5855', fontSize: '0.875rem' }}>No entries yet. Complete your morning or evening ritual to start your journal.</p>
            </div>
          )}
          {entries.map(entry => (
            <Link key={entry.id} href={`/journal/${entry.date}`}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#161616', borderRadius: '0.75rem', border: '1px solid #252525',
                padding: '0.875rem 1rem', textDecoration: 'none', transition: 'border-color 150ms',
              }}
              className="hover:border-[#2e2e2e]"
            >
              <div>
                <p style={{ color: '#e8e6e3', fontSize: '0.875rem', fontWeight: 500 }}>{formatDate(entry.date)}</p>
                <div className="flex gap-3 mt-1">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.625rem', color: entry.morningCompleted ? '#c9a84c' : '#3a3a3a' }}>
                    <Sun className="w-3 h-3" strokeWidth={1.5} /> Morning
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.625rem', color: entry.eveningCompleted ? '#8b7ab8' : '#3a3a3a' }}>
                    <Moon className="w-3 h-3" strokeWidth={1.5} /> Evening
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {entry.morningCompleted && entry.eveningCompleted && (
                  <Flame className="w-4 h-4 text-[#c9a84c]" strokeWidth={1.5} />
                )}
                <BookOpen className="w-4 h-4" style={{ color: '#5a5855' }} strokeWidth={1.5} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
