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

export async function getSleepLog(date: string) {
  const userId = await getUserId()
  return prisma.sleepLog.findUnique({ where: { userId_date: { userId, date } } })
}

export async function saveSleepLog(data: {
  date: string; bedtime?: string; wakeTime?: string; quality?: number; notes?: string
}) {
  const userId = await getUserId()
  await prisma.sleepLog.upsert({
    where: { userId_date: { userId, date: data.date } },
    create: { userId, ...data },
    update: data,
  })
  revalidatePath('/protocols')
}

export async function getRecentSleepLogs() {
  const userId = await getUserId()
  return prisma.sleepLog.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 14,
  })
}

export async function logWorkout(data: {
  date: string; type: string; galpinAdaptation?: string
  durationMin?: number; intensity?: number; notes?: string
}) {
  const userId = await getUserId()
  await prisma.workout.create({ data: { userId, ...data } })
  revalidatePath('/protocols')
}

export async function getWorkoutsForDate(date: string) {
  const userId = await getUserId()
  return prisma.workout.findMany({ where: { userId, date }, orderBy: { createdAt: 'asc' } })
}

export async function getWeeklyProtocolScore(weekStart: string, weekEnd: string) {
  const userId = await getUserId()
  const [sleepDays, workoutDays, meditationDays] = await Promise.all([
    prisma.sleepLog.count({ where: { userId, date: { gte: weekStart, lte: weekEnd } } }),
    prisma.workout.groupBy({ by: ['date'], where: { userId, date: { gte: weekStart, lte: weekEnd } } })
      .then((r: { date: string }[]) => r.length),
    prisma.morningLog.count({
      where: {
        meditationMinutes: { gt: 0 },
        entry: { userId, date: { gte: weekStart, lte: weekEnd } },
      },
    }),
  ])
  return { sleepDays, workoutDays, meditationDays }
}
