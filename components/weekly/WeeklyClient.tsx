'use client'
import { useState, useTransition } from 'react'
import { saveWeeklyReview } from '@/actions/reflections'
import { BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatDate } from '@/lib/utils'

type ProtocolScore = { sleepDays: number; workoutDays: number; meditationDays: number }
type HabitCount = { total: number; done: number }
type WeeklyReview = {
  wins: string | null; patterns: string | null; strategicLesson: string | null;
  identityEvolution: string | null; creativeOutput: string | null
} | null

interface Props {
  weekStart: string
  weekEnd: string
  masteryHours: number
  protocolScore: ProtocolScore
  habitCount: HabitCount
  existingReview: WeeklyReview
}

const CHART_COLOR = '#c9a84c'

export default function WeeklyClient({ weekStart, weekEnd, masteryHours, protocolScore, habitCount, existingReview }: Props) {
  const [wins, setWins] = useState(existingReview?.wins ?? '')
  const [patterns, setPatterns] = useState(existingReview?.patterns ?? '')
  const [lesson, setLesson] = useState(existingReview?.strategicLesson ?? '')
  const [identity, setIdentity] = useState(existingReview?.identityEvolution ?? '')
  const [creative, setCreative] = useState(existingReview?.creativeOutput ?? '')
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const save = () => {
    startTransition(async () => {
      await saveWeeklyReview(weekStart, {
        wins: wins || undefined,
        patterns: patterns || undefined,
        strategicLesson: lesson || undefined,
        identityEvolution: identity || undefined,
        creativeOutput: creative || undefined,
        masteryHours,
        habitScore: habitCount.total > 0 ? Math.round((habitCount.done / habitCount.total) * 100) : 0,
        protocolScore: Math.round(((protocolScore.sleepDays + protocolScore.workoutDays + protocolScore.meditationDays) / 21) * 100),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  const statsData = [
    { name: 'Sleep', value: protocolScore.sleepDays, max: 7 },
    { name: 'Workouts', value: protocolScore.workoutDays, max: 7 },
    { name: 'Meditation', value: protocolScore.meditationDays, max: 7 },
  ]

  const habitPct = habitCount.total > 0 ? Math.round((habitCount.done / habitCount.total) * 100) : 0

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-8 pt-10 pb-4">
        <h1 className="text-2xl font-semibold text-[#e8e6e3]">Weekly Review</h1>
        <p className="text-[#5a5855] text-sm mt-1">{formatDate(weekStart)} – {formatDate(weekEnd)}</p>
      </div>

      <div className="px-8 pb-8 space-y-5 max-w-2xl">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <div className="text-2xl font-light text-[#c9a84c]">{masteryHours.toFixed(1)}h</div>
            <div className="text-xs text-[#5a5855] mt-1">mastery</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-light text-[#6b8f71]">{habitPct}%</div>
            <div className="text-xs text-[#5a5855] mt-1">habits today</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-light text-[#6b7fa3]">
              {protocolScore.sleepDays + protocolScore.workoutDays + protocolScore.meditationDays}/21
            </div>
            <div className="text-xs text-[#5a5855] mt-1">protocol days</div>
          </div>
        </div>

        {/* Protocol chart */}
        <div className="card">
          <p className="section-title mb-4">Protocol Consistency</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={statsData} barSize={28}>
              <XAxis dataKey="name" tick={{ fill: '#5a5855', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis hide domain={[0, 7]} />
              <Tooltip
                contentStyle={{ background: '#161616', border: '1px solid #252525', borderRadius: 8, fontSize: 12 }}
                cursor={{ fill: '#1e1e1e' }}
                formatter={(v) => [`${v ?? 0} days`, '']}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {statsData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLOR} opacity={0.7 + (i * 0.1)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Reflection prompts */}
        <div className="card space-y-4">
          <p className="section-title">Week in Review</p>

          <div>
            <label className="text-xs text-[#5a5855] mb-1.5 block">Three wins this week</label>
            <textarea className="textarea-field" rows={3} placeholder="1.&#10;2.&#10;3." value={wins} onChange={e => setWins(e.target.value)} />
          </div>

          <div>
            <label className="text-xs text-[#5a5855] mb-1.5 block">Patterns that repeated</label>
            <textarea className="textarea-field" rows={3} placeholder="What patterns did you notice in your behavior, emotions, or results?" value={patterns} onChange={e => setPatterns(e.target.value)} />
          </div>

          <div>
            <label className="text-xs text-[#5a5855] mb-1.5 block">Strategic lesson (Greene's Rational Observer)</label>
            <textarea className="textarea-field" rows={3} placeholder="If you watched yourself from the outside this week, what would you see?" value={lesson} onChange={e => setLesson(e.target.value)} />
          </div>

          <div>
            <label className="text-xs text-[#5a5855] mb-1.5 block">Creative output</label>
            <textarea className="textarea-field" rows={2} placeholder="What did you create, ship, or make progress on?" value={creative} onChange={e => setCreative(e.target.value)} />
          </div>

          <div>
            <label className="text-xs text-[#5a5855] mb-1.5 block">How did your identity evolve?</label>
            <textarea className="textarea-field" rows={2} placeholder="I am becoming..." value={identity} onChange={e => setIdentity(e.target.value)} />
          </div>

          <div className="flex justify-end">
            <button onClick={save} disabled={pending} className="btn-primary">
              {pending ? 'Saving...' : saved ? 'Saved!' : 'Save review'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
