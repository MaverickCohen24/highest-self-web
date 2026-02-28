'use server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'

async function getUserId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

export async function getAllDailyEntries() {
  const userId = await getUserId()
  return prisma.dailyEntry.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 90,
    include: {
      morningLog: true,
      eveningLog: true,
    },
  })
}

export async function getDayEntry(date: string) {
  const userId = await getUserId()
  const entry = await prisma.dailyEntry.findUnique({
    where: { userId_date: { userId, date } },
    include: { morningLog: true, eveningLog: true },
  })
  const [completions, workouts, sleepLog, reflections, creativEntries, masterySessions] = await Promise.all([
    prisma.habitCompletion.findMany({
      where: { userId, date },
      include: { habit: { select: { name: true, identityStatement: true } } },
    }),
    prisma.workout.findMany({ where: { userId, date } }),
    prisma.sleepLog.findUnique({ where: { userId_date: { userId, date } } }),
    prisma.reflection.findMany({ where: { userId, date } }),
    prisma.creativeEntry.findMany({ where: { userId, date } }),
    prisma.masterySession.findMany({
      where: { userId, date },
      include: { skill: { select: { name: true } } },
    }),
  ])
  return { entry, completions, workouts, sleepLog, reflections, creativEntries, masterySessions }
}

export async function getProgressStats() {
  const userId = await getUserId()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const since = thirtyDaysAgo.toISOString().split('T')[0]

  const [entries, completions, sessions] = await Promise.all([
    prisma.dailyEntry.findMany({
      where: { userId, date: { gte: since } },
      orderBy: { date: 'asc' },
    }),
    prisma.habitCompletion.findMany({
      where: { userId, date: { gte: since }, completed: true },
      select: { date: true },
    }),
    prisma.masterySession.findMany({
      where: { userId, date: { gte: since } },
      select: { date: true, minutes: true },
    }),
  ])

  const morningStreak = calcStreak(entries.filter(e => e.morningCompleted).map(e => e.date))
  const eveningStreak = calcStreak(entries.filter(e => e.eveningCompleted).map(e => e.date))
  const morningTotal = entries.filter(e => e.morningCompleted).length
  const eveningTotal = entries.filter(e => e.eveningCompleted).length
  const habitDays = [...new Set(completions.map(c => c.date))].length
  const masteryMinutes = sessions.reduce((sum, s) => sum + s.minutes, 0)

  return { morningStreak, eveningStreak, morningTotal, eveningTotal, habitDays, masteryMinutes, totalDays: entries.length }
}

function calcStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const sorted = [...dates].sort((a, b) => b.localeCompare(a))
  let streak = 0
  let check = new Date()
  for (const d of sorted) {
    const entryDate = new Date(d + 'T12:00:00')
    const diff = Math.floor((check.getTime() - entryDate.getTime()) / 86400000)
    if (diff <= 1) { streak++; check = entryDate }
    else break
  }
  return streak
}
