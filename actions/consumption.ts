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

export async function getConsumptionLog(date: string) {
  const userId = await getUserId()
  return prisma.consumptionLog.findUnique({
    where: { userId_date: { userId, date } },
  })
}

export async function saveConsumptionLog(date: string, data: {
  phoneMinutes?: number
  socialMediaMinutes?: number
  mainApps?: string
  contentQuality?: number
  mentalImpact?: string
  whatTriggered?: string
  intention?: string
}) {
  const userId = await getUserId()
  await prisma.consumptionLog.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, ...data },
    update: data,
  })
  revalidatePath('/consumption')
}

export async function getRecentConsumptionLogs() {
  const userId = await getUserId()
  return prisma.consumptionLog.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 30,
  })
}
