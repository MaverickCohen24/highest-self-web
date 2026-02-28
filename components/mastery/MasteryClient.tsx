'use client'
import { useState, useTransition } from 'react'
import { setLifeTask, createSkill, logMasterySession } from '@/actions/mastery'
import { Map, Plus, Clock, Zap } from 'lucide-react'

const PHASES = ['Apprentice', 'Active Mastery', 'True Mastery']

type Skill = {
  id: string
  name: string
  phase: string | null
  lifeTaskConnection: string | null
  totalMinutes: number
  sessionCount: number
}

type LifeTask = { statement: string } | null

interface Props {
  lifeTask: LifeTask
  skills: Skill[]
}

function LifeTaskSection({ lifeTask }: { lifeTask: LifeTask }) {
  const [editing, setEditing] = useState(!lifeTask)
  const [statement, setStatement] = useState(lifeTask?.statement ?? '')
  const [pending, startTransition] = useTransition()

  const save = () => {
    if (!statement.trim()) return
    startTransition(async () => {
      await setLifeTask(statement.trim())
      setEditing(false)
    })
  }

  if (!editing && lifeTask) {
    return (
      <div className="bg-[#0a0a0a] rounded-xl p-5 border border-[#1e1e1e]">
        <p className="text-xs text-[#5a5855] uppercase tracking-widest mb-2">Life's Task</p>
        <p className="text-[#e8e6e3] italic leading-relaxed">"{lifeTask.statement}"</p>
        <button onClick={() => setEditing(true)} className="text-xs text-[#5a5855] hover:text-[#a8a5a0] mt-3 transition-colors">
          Edit
        </button>
      </div>
    )
  }

  return (
    <div className="card space-y-3">
      <p className="section-title">Life's Task</p>
      <p className="text-xs text-[#5a5855]">What is your deepest calling? What were you meant to master?</p>
      <textarea
        className="textarea-field"
        rows={3}
        placeholder="I was born to..."
        value={statement}
        onChange={e => setStatement(e.target.value)}
        autoFocus
      />
      <div className="flex justify-end">
        <button onClick={save} disabled={pending || !statement.trim()} className="btn-primary">
          {pending ? 'Saving...' : 'Set Life\'s Task'}
        </button>
      </div>
    </div>
  )
}

function LogSessionModal({ skill, onDone }: { skill: Skill; onDone: () => void }) {
  const [minutes, setMinutes] = useState('')
  const [breakthrough, setBreakthrough] = useState('')
  const [obstacle, setObstacle] = useState('')
  const [pending, startTransition] = useTransition()

  const save = () => {
    if (!minutes) return
    const date = new Date().toISOString().split('T')[0]
    startTransition(async () => {
      await logMasterySession({
        skillId: skill.id, date, minutes: Number(minutes),
        breakthrough: breakthrough || undefined,
        obstacle: obstacle || undefined,
      })
      onDone()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#161616] border border-[#252525] rounded-2xl p-6 w-full max-w-md space-y-4">
        <p className="text-[#e8e6e3] font-medium">Log session — {skill.name}</p>
        <div>
          <label className="text-xs text-[#5a5855] mb-1 block">Minutes practiced</label>
          <input type="number" className="input-field w-32" value={minutes} onChange={e => setMinutes(e.target.value)} autoFocus min={1} />
        </div>
        <textarea className="textarea-field" rows={2} placeholder="Breakthrough or insight..." value={breakthrough} onChange={e => setBreakthrough(e.target.value)} />
        <textarea className="textarea-field" rows={2} placeholder="Obstacle or resistance..." value={obstacle} onChange={e => setObstacle(e.target.value)} />
        <div className="flex gap-2 justify-end">
          <button onClick={onDone} className="btn-ghost">Cancel</button>
          <button onClick={save} disabled={pending || !minutes} className="btn-primary">
            {pending ? 'Saving...' : 'Log session'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AddSkillForm({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('')
  const [connection, setConnection] = useState('')
  const [phase, setPhase] = useState('Apprentice')
  const [pending, startTransition] = useTransition()

  const save = () => {
    if (!name.trim()) return
    startTransition(async () => {
      await createSkill({ name: name.trim(), lifeTaskConnection: connection || undefined, phase })
      onDone()
    })
  }

  return (
    <div className="card space-y-3">
      <p className="section-title">Add Skill</p>
      <input className="input-field" placeholder="Skill name" value={name} onChange={e => setName(e.target.value)} autoFocus />
      <input className="input-field" placeholder="How does this connect to your Life's Task?" value={connection} onChange={e => setConnection(e.target.value)} />
      <div className="flex gap-2">
        {PHASES.map(p => (
          <button key={p} onClick={() => setPhase(p)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex-1 ${
              phase === p ? 'border-[#c9a84c] bg-[#c9a84c]/10 text-[#c9a84c]' : 'border-[#252525] text-[#5a5855]'
            }`}>{p}</button>
        ))}
      </div>
      <div className="flex gap-2 justify-end">
        <button onClick={onDone} className="btn-ghost">Cancel</button>
        <button onClick={save} disabled={pending || !name.trim()} className="btn-primary">
          {pending ? 'Saving...' : 'Add skill'}
        </button>
      </div>
    </div>
  )
}

export default function MasteryClient({ lifeTask, skills }: Props) {
  const [addingSkill, setAddingSkill] = useState(false)
  const [loggingSkill, setLoggingSkill] = useState<Skill | null>(null)

  const byPhase = PHASES.map(phase => ({
    phase,
    skills: skills.filter(s => (s.phase ?? 'Apprentice') === phase),
  }))

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-8 pt-10 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#e8e6e3]">Mastery</h1>
          <p className="text-[#5a5855] text-sm mt-1">The path of deep skill development</p>
        </div>
        <button onClick={() => setAddingSkill(a => !a)} className="btn-ghost flex items-center gap-1.5">
          <Plus className="w-4 h-4" /> Skill
        </button>
      </div>

      <div className="px-8 pb-8 space-y-4 max-w-2xl">
        <LifeTaskSection lifeTask={lifeTask} />

        {addingSkill && <AddSkillForm onDone={() => setAddingSkill(false)} />}

        {byPhase.map(({ phase, skills: phaseSkills }) => phaseSkills.length > 0 && (
          <div key={phase}>
            <p className="section-title mb-2 flex items-center gap-2">
              <Map className="w-3.5 h-3.5 text-[#c9a84c]" strokeWidth={1.5} /> {phase}
            </p>
            <div className="space-y-2">
              {phaseSkills.map(skill => (
                <div key={skill.id} className="card flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#e8e6e3]">{skill.name}</p>
                    {skill.lifeTaskConnection && (
                      <p className="text-xs text-[#5a5855] mt-0.5">{skill.lifeTaskConnection}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="flex items-center gap-1 text-[10px] text-[#5a5855]">
                        <Clock className="w-3 h-3" /> {Math.round(skill.totalMinutes / 60)}h total
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-[#5a5855]">
                        <Zap className="w-3 h-3" /> {skill.sessionCount} sessions
                      </span>
                    </div>
                  </div>
                  <button onClick={() => setLoggingSkill(skill)} className="btn-ghost text-xs">
                    Log session
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}

        {skills.length === 0 && !addingSkill && (
          <div className="card text-center py-10">
            <p className="text-[#5a5855] text-sm">No skills yet.</p>
            <p className="text-[#3a3a3a] text-xs mt-1">Add a skill to start your mastery path.</p>
          </div>
        )}
      </div>

      {loggingSkill && <LogSessionModal skill={loggingSkill} onDone={() => setLoggingSkill(null)} />}
    </div>
  )
}
