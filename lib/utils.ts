export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export const today = (): string => new Date().toISOString().split('T')[0]

export const formatDate = (date: string): string =>
  new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

export const formatDateShort = (date: string): string =>
  new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export const getWeekStart = (date: string = today()): string => {
  const d = new Date(date + 'T12:00:00')
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff)).toISOString().split('T')[0]
}

export const getWeekEnd = (weekStart: string): string => {
  const d = new Date(weekStart + 'T12:00:00')
  d.setDate(d.getDate() + 6)
  return d.toISOString().split('T')[0]
}

export const daysAgo = (n: number): string => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

export const minutesToHours = (minutes: number): string => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export const RUBIN_PROMPTS = [
  "What are you noticing today that you haven't noticed before?",
  "What wants to exist through you?",
  "Describe beauty you encountered today.",
  "What rule are you ready to break?",
  "What would you create if no one would ever see it?",
  "What does your intuition know that your mind hasn't admitted yet?",
  "What are you afraid to make?",
  "Where is nature showing you something right now?",
  "What's the most honest thing you could say today?",
  "What are you trying too hard at?",
  "What would feel effortless to create?",
  "What idea keeps returning to you?",
  "Describe a moment of aliveness from today.",
  "What is trying to be born through your work?",
  "What old idea are you still carrying that no longer serves the work?",
  "What would you make if you had no fear of failure?",
  "What constraints are secretly liberating you?",
  "What are you not saying in your work?",
]

export const REFLECTION_PROMPTS = [
  { type: 'emotional', text: "What emotion drove most of my decisions today? What was underneath it?", tag: 'emotional-audit' },
  { type: 'shadow', text: "What did I deflect, avoid, or project onto others today?", tag: 'shadow' },
  { type: 'rationality', text: "Where did I let emotion masquerade as reason?", tag: 'rationality' },
  { type: 'role', text: "What role did I play today — performer, victim, rescuer? Was it conscious?", tag: 'roles' },
  { type: 'grandiosity', text: "Where did ego inflate my sense of importance today?", tag: 'grandiosity' },
  { type: 'envy', text: "Was there a moment of envy today? What does it reveal about my deepest desires?", tag: 'envy' },
  { type: 'mortality', text: "If this were my last month, would today's actions align with my deepest values?", tag: 'mortality' },
  { type: 'conformity', text: "Where did I conform when I wanted to diverge? What held me back?", tag: 'conformity' },
  { type: 'power', text: "Did I say more than necessary today? What would silence have accomplished?", tag: 'power', law: "Law 4" },
  { type: 'power', text: "Who held the most power in my interactions today? What gave them that power?", tag: 'power', law: "Law 1" },
  { type: 'mastery', text: "What would your future master self think of today's effort?", tag: 'mastery' },
  { type: 'mastery', text: "Where did you resist the discomfort of learning?", tag: 'mastery' },
  { type: 'mastery', text: "What feedback did you receive (explicitly or implicitly) today?", tag: 'mastery' },
]

export const getDailyRubinPrompt = (date: string): string => {
  const dayOfYear = Math.floor(
    (new Date(date).getTime() - new Date(new Date(date).getFullYear(), 0, 0).getTime()) / 86400000
  )
  return RUBIN_PROMPTS[dayOfYear % RUBIN_PROMPTS.length]
}

export const getDailyReflectionPrompt = (date: string) => {
  const dayOfYear = Math.floor(
    (new Date(date).getTime() - new Date(new Date(date).getFullYear(), 0, 0).getTime()) / 86400000
  )
  return REFLECTION_PROMPTS[dayOfYear % REFLECTION_PROMPTS.length]
}

export const GALPIN_ADAPTATIONS = [
  'Strength', 'Hypertrophy', 'Power', 'Speed',
  'VO2 Max', 'Lactate Threshold', 'Muscular Endurance', 'Long Slow Distance', 'Skill'
] as const
