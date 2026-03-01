'use server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

function calcStreak(completions: { date: string }[], today: string): number {
  let streak = 0
  let check = new Date(today + 'T12:00:00')
  for (const c of completions) {
    const d = new Date(c.date + 'T12:00:00')
    const diff = Math.round((check.getTime() - d.getTime()) / 86400000)
    if (diff === 0 || diff === 1) { streak++; check = d }
    else break
  }
  return streak
}

export async function getHabits() {
  const userId = await getUserId()
  return prisma.habit.findMany({
    where: { userId, archivedAt: null },
    orderBy: { createdAt: 'asc' },
  })
}

export async function createHabit(data: {
  name: string
  identityStatement?: string
  implementation?: string
  habitStack?: string
  cue?: string
  craving?: string
  response?: string
  reward?: string
  twoMinuteVersion?: string
  type?: string
  frequency?: string
}) {
  const userId = await getUserId()
  await prisma.habit.create({ data: { userId, ...data } })
  revalidatePath('/habits')
}

export async function archiveHabit(id: string) {
  await getUserId()
  await prisma.habit.update({ where: { id }, data: { archivedAt: new Date() } })
  revalidatePath('/habits')
}

export async function getCompletionsForDate(date: string) {
  const userId = await getUserId()
  const habits = await prisma.habit.findMany({
    where: { userId, archivedAt: null },
    include: {
      completions: {
        where: { completed: true },
        orderBy: { date: 'desc' },
        take: 365,
      },
    },
    orderBy: { createdAt: 'asc' },
  })
  return habits.map((h: typeof habits[number]) => {
    const todayComp = h.completions.find((c: { date: string }) => c.date === date)
    const streak = calcStreak(h.completions, date)
    return {
      ...h,
      completed: todayComp?.completed ?? false,
      satisfaction: todayComp?.satisfaction ?? null,
      completionId: todayComp?.id ?? null,
      streak,
    }
  })
}

export async function setHabitCompletion(
  habitId: string, date: string, completed: boolean, satisfaction?: number
) {
  const userId = await getUserId()
  await prisma.habitCompletion.upsert({
    where: { habitId_date: { habitId, date } },
    create: { habitId, userId, date, completed, satisfaction },
    update: { completed, ...(satisfaction !== undefined ? { satisfaction } : {}) },
  })
  revalidatePath('/habits')
  revalidatePath('/dashboard')
}

export async function getTodayHabitCount(date: string) {
  const userId = await getUserId()
  const total = await prisma.habit.count({ where: { userId, archivedAt: null } })
  const done = await prisma.habitCompletion.count({
    where: { userId, date, completed: true }
  })
  return { total, done }
}
