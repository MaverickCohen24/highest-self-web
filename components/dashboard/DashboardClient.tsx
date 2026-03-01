'use client'
import Link from 'next/link'
import { Sun, Moon, CheckSquare, Activity, ChevronRight, Flame, Quote, ShieldCheck } from 'lucide-react'

interface Props {
  date: string
  entry: { morningCompleted: boolean; eveningCompleted: boolean } | null
  habitCount: { buildTotal: number; buildDone: number; breakTotal: number; breakDone: number }
  masteryHours: number
  identity: { content: string } | null
  skillCount: number
  formattedDate: string
}

function Ring({ pct, color, icon, label, href }: {
  pct: number; color: string; icon: React.ReactNode; label: string; href: string
}) {
  const r = 26
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <Link href={href} className="flex flex-col items-center gap-2 group">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="#252525" strokeWidth="4" />
          <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="4"
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[#a8a5a0] group-hover:text-[#e8e6e3] transition-colors">
          {icon}
        </div>
      </div>
      <div className="text-center">
        <div className={`text-xs font-medium ${pct === 100 ? 'text-[#e8e6e3]' : 'text-[#5a5855]'}`}>{label}</div>
        <div className="text-[10px] text-[#5a5855]">{Math.round(pct)}%</div>
      </div>
    </Link>
  )
}

export default function DashboardClient({ date, entry, habitCount, masteryHours, identity, skillCount, formattedDate }: Props) {
  const morningPct = entry?.morningCompleted ? 100 : 0
  const eveningPct = entry?.eveningCompleted ? 100 : 0
  const { buildTotal, buildDone, breakTotal, breakDone } = habitCount
  const buildPct = buildTotal > 0 ? (buildDone / buildTotal) * 100 : 0
  const breakPct = breakTotal > 0 ? (breakDone / breakTotal) * 100 : 0

  const incomplete = [
    !entry?.morningCompleted && { label: 'Morning Ritual', href: '/morning', icon: <Sun className="w-4 h-4" strokeWidth={1.5} /> },
    !entry?.eveningCompleted && { label: 'Evening Review', href: '/evening', icon: <Moon className="w-4 h-4" strokeWidth={1.5} /> },
    buildDone < buildTotal && { label: `Build habits (${buildDone}/${buildTotal})`, href: '/habits', icon: <CheckSquare className="w-4 h-4" strokeWidth={1.5} /> },
    breakTotal > 0 && breakDone < breakTotal && { label: `Break habits (${breakDone}/${breakTotal} resisted)`, href: '/habits', icon: <ShieldCheck className="w-4 h-4" strokeWidth={1.5} /> },
  ].filter(Boolean) as Array<{ label: string; href: string; icon: React.ReactNode }>

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-8 pt-10 pb-4">
        <p className="text-[#5a5855] text-sm mb-1">{formattedDate}</p>
        <h1 className="text-2xl font-semibold text-[#e8e6e3]">Good morning.</h1>
      </div>

      <div className="px-8 py-4 space-y-6 max-w-2xl">
        {identity && (
          <div className="bg-[#0a0a0a] rounded-xl p-5 border border-[#1e1e1e]">
            <div className="flex gap-3">
              <Quote className="w-4 h-4 text-[#c9a84c] shrink-0 mt-0.5" />
              <p className="text-[#e8e6e3] text-sm italic leading-relaxed">{identity.content}</p>
            </div>
          </div>
        )}

        <div className="card">
          <p className="section-title mb-5">Today's Progress</p>
          <div className="flex justify-around">
            <Ring pct={morningPct} color="#c9a84c" icon={<Sun className="w-5 h-5" strokeWidth={1.5} />} label="Morning" href="/morning" />
            <Ring pct={eveningPct} color="#8b7ab8" icon={<Moon className="w-5 h-5" strokeWidth={1.5} />} label="Evening" href="/evening" />
            <Ring pct={buildPct} color="#6b8f71" icon={<CheckSquare className="w-5 h-5" strokeWidth={1.5} />} label="Build" href="/habits" />
            <Ring pct={breakPct} color="#c47b5e" icon={<ShieldCheck className="w-5 h-5" strokeWidth={1.5} />} label="Break" href="/habits" />
            <Ring pct={0} color="#6b7fa3" icon={<Activity className="w-5 h-5" strokeWidth={1.5} />} label="Protocols" href="/protocols" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="card text-center">
            <div className="text-2xl font-light text-[#c9a84c]">{masteryHours.toFixed(1)}</div>
            <div className="text-xs text-[#5a5855] mt-1">mastery hrs / week</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-light text-[#6b8f71]">{buildDone}<span style={{ fontSize: '1rem', color: '#3a3a3a' }}>/{buildTotal}</span></div>
            <div className="text-xs text-[#5a5855] mt-1">habits built today</div>
          </div>
          <div className="card text-center">
            <div className="text-2xl font-light text-[#c47b5e]">{breakDone}<span style={{ fontSize: '1rem', color: '#3a3a3a' }}>/{breakTotal}</span></div>
            <div className="text-xs text-[#5a5855] mt-1">bad habits resisted</div>
          </div>
        </div>

        {incomplete.length > 0 ? (
          <div className="space-y-2">
            <p className="section-title">Still to complete</p>
            {incomplete.map(({ label, href, icon }) => (
              <Link key={href} href={href} className="flex items-center justify-between card-hover">
                <div className="flex items-center gap-3">
                  <span className="text-[#a8a5a0]">{icon}</span>
                  <span className="text-sm text-[#e8e6e3]">{label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-[#5a5855]" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="card text-center py-6">
            <Flame className="w-6 h-6 text-[#c9a84c] mx-auto mb-2" />
            <p className="text-[#e8e6e3] text-sm font-medium">All complete for today.</p>
            <p className="text-[#5a5855] text-xs mt-1">You showed up. That's everything.</p>
          </div>
        )}
      </div>
    </div>
  )
}
