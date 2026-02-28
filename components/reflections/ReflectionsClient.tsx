'use client'
import { useState, useTransition } from 'react'
import { saveReflection } from '@/actions/reflections'
import { BookOpen, Quote } from 'lucide-react'
import { formatDate } from '@/lib/utils'

type Prompt = { type: string; text: string; tag: string; law?: string }
type Reflection = { id: string; date: string; content: string | null; promptType: string | null; patternTag: string | null; lawRef: string | null }

interface Props {
  date: string
  prompt: Prompt
  reflections: Reflection[]
  tags: string[]
}

export default function ReflectionsClient({ date, prompt, reflections, tags }: Props) {
  const [content, setContent] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)

  const save = () => {
    if (!content.trim()) return
    startTransition(async () => {
      await saveReflection({
        date,
        promptType: prompt.type,
        content: content.trim(),
        lawRef: prompt.law,
        patternTag: prompt.tag,
      })
      setContent('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  const filtered = activeTag
    ? reflections.filter(r => r.patternTag === activeTag)
    : reflections

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-8 pt-10 pb-4">
        <h1 className="text-2xl font-semibold text-[#e8e6e3]">Reflections</h1>
        <p className="text-[#5a5855] text-sm mt-1">Laws of Human Nature · 48 Laws of Power</p>
      </div>

      <div className="px-8 pb-8 space-y-5 max-w-2xl">
        <div className="card space-y-4">
          <div className="flex items-start gap-3">
            <Quote className="w-4 h-4 text-[#8b7ab8] shrink-0 mt-0.5" />
            <div>
              <p className="text-[#e8e6e3] text-sm leading-relaxed">{prompt.text}</p>
              {prompt.law && <p className="text-[10px] text-[#5a5855] mt-1">{prompt.law} · {prompt.tag}</p>}
            </div>
          </div>
          <textarea
            className="textarea-field"
            rows={5}
            placeholder="Write honestly..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
          <div className="flex justify-end">
            <button onClick={save} disabled={pending || !content.trim()} className="btn-primary">
              {pending ? 'Saving...' : saved ? 'Saved!' : 'Save reflection'}
            </button>
          </div>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTag(null)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                !activeTag ? 'border-[#8b7ab8] bg-[#8b7ab8]/10 text-[#8b7ab8]' : 'border-[#252525] text-[#5a5855]'
              }`}
            >All</button>
            {tags.map(tag => (
              <button key={tag} onClick={() => setActiveTag(t => t === tag ? null : tag)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  activeTag === tag ? 'border-[#8b7ab8] bg-[#8b7ab8]/10 text-[#8b7ab8]' : 'border-[#252525] text-[#5a5855]'
                }`}>{tag}</button>
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="space-y-3">
            <p className="section-title flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5" strokeWidth={1.5} /> History
            </p>
            {filtered.map(r => (
              <div key={r.id} className="card">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-[10px] text-[#5a5855]">{formatDate(r.date)}</p>
                  {r.patternTag && (
                    <span className="text-[10px] px-2 py-0.5 bg-[#1e1e1e] rounded-full text-[#5a5855]">{r.patternTag}</span>
                  )}
                </div>
                <p className="text-sm text-[#a8a5a0] leading-relaxed">{r.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
