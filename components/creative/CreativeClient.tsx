'use client'
import { useState, useTransition } from 'react'
import { saveCreativeEntry, addQuickIdea, createCreativeProject } from '@/actions/creative'
import { Palette, Lightbulb, Plus, FolderOpen, Quote } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type Entry = { id: string; date: string; prompt: string | null; content: string | null }
type Project = { id: string; title: string; description: string | null; _count: { ideas: number } }
type Idea = { id: string; content: string; createdAt: Date; project: { title: string } | null }

interface Props {
  date: string
  prompt: string
  entries: Entry[]
  projects: Project[]
  ideas: Idea[]
}

function WriteSection({ date, prompt }: { date: string; prompt: string }) {
  const [content, setContent] = useState('')
  const [medium, setMedium] = useState('')
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const save = () => {
    if (!content.trim()) return
    startTransition(async () => {
      await saveCreativeEntry({ date, prompt, content: content.trim(), medium: medium || undefined })
      setContent('')
      setMedium('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  return (
    <div className="card space-y-4">
      <div className="flex items-start gap-3">
        <Quote className="w-4 h-4 text-[#c9a84c] shrink-0 mt-0.5" />
        <p className="text-[#e8e6e3] text-sm italic leading-relaxed">{prompt}</p>
      </div>
      <textarea
        className="textarea-field"
        rows={5}
        placeholder="Let it flow..."
        value={content}
        onChange={e => setContent(e.target.value)}
      />
      <div className="flex items-center gap-3">
        <input
          className="input-field flex-1"
          placeholder="Medium (writing, sketch, music...)"
          value={medium}
          onChange={e => setMedium(e.target.value)}
        />
        <button onClick={save} disabled={pending || !content.trim()} className="btn-primary whitespace-nowrap">
          {pending ? 'Saving...' : saved ? 'Saved!' : 'Save entry'}
        </button>
      </div>
    </div>
  )
}

function IdeaCapture({ projects }: { projects: Project[] }) {
  const [idea, setIdea] = useState('')
  const [projectId, setProjectId] = useState('')
  const [pending, startTransition] = useTransition()

  const save = () => {
    if (!idea.trim()) return
    startTransition(async () => {
      await addQuickIdea(idea.trim(), projectId || undefined)
      setIdea('')
    })
  }

  return (
    <div className="flex gap-2">
      <input
        className="input-field flex-1"
        placeholder="Capture an idea..."
        value={idea}
        onChange={e => setIdea(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save() }}
      />
      {projects.length > 0 && (
        <select className="input-field w-36 text-sm" value={projectId} onChange={e => setProjectId(e.target.value)}>
          <option value="">No project</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      )}
      <button onClick={save} disabled={pending || !idea.trim()} className="btn-primary">
        <Plus className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function CreativeClient({ date, prompt, entries, projects, ideas }: Props) {
  const [addingProject, setAddingProject] = useState(false)
  const [projectTitle, setProjectTitle] = useState('')
  const [pending, startTransition] = useTransition()

  const saveProject = () => {
    if (!projectTitle.trim()) return
    startTransition(async () => {
      await createCreativeProject(projectTitle.trim())
      setProjectTitle('')
      setAddingProject(false)
    })
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-8 pt-10 pb-4 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#e8e6e3]">Creative</h1>
          <p className="text-[#5a5855] text-sm mt-1">The act of noticing — Rick Rubin</p>
        </div>
        <button onClick={() => setAddingProject(a => !a)} className="btn-ghost flex items-center gap-1.5">
          <FolderOpen className="w-4 h-4" /> Project
        </button>
      </div>

      <div className="px-8 pb-8 space-y-5 max-w-2xl">
        <WriteSection date={date} prompt={prompt} />

        <div className="space-y-2">
          <p className="section-title flex items-center gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-[#c9a84c]" strokeWidth={1.5} /> Quick Capture
          </p>
          <IdeaCapture projects={projects} />
          {ideas.slice(0, 5).map(idea => (
            <div key={idea.id} className="card py-2.5 px-4">
              <p className="text-sm text-[#e8e6e3]">{idea.content}</p>
              {idea.project && <p className="text-xs text-[#5a5855] mt-0.5">{idea.project.title}</p>}
            </div>
          ))}
        </div>

        {addingProject && (
          <div className="card space-y-3">
            <p className="section-title">New Project</p>
            <input className="input-field" placeholder="Project title" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} autoFocus />
            <div className="flex gap-2 justify-end">
              <button onClick={() => setAddingProject(false)} className="btn-ghost">Cancel</button>
              <button onClick={saveProject} disabled={pending || !projectTitle.trim()} className="btn-primary">
                {pending ? 'Creating...' : 'Create project'}
              </button>
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div className="space-y-2">
            <p className="section-title flex items-center gap-2">
              <Palette className="w-3.5 h-3.5 text-[#c9a84c]" strokeWidth={1.5} /> Projects
            </p>
            {projects.map(p => (
              <div key={p.id} className="card">
                <p className="text-sm font-medium text-[#e8e6e3]">{p.title}</p>
                {p.description && <p className="text-xs text-[#5a5855] mt-0.5">{p.description}</p>}
                <p className="text-[10px] text-[#3a3a3a] mt-1">{p._count.ideas} ideas</p>
              </div>
            ))}
          </div>
        )}

        {entries.length > 0 && (
          <div className="space-y-2">
            <p className="section-title">Recent entries</p>
            {entries.slice(0, 5).map(e => (
              <div key={e.id} className="card">
                <p className="text-[10px] text-[#5a5855] mb-1">{formatDate(e.date)}</p>
                {e.prompt && <p className="text-xs text-[#5a5855] italic mb-2">"{e.prompt}"</p>}
                <p className="text-sm text-[#a8a5a0] leading-relaxed line-clamp-3">{e.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
