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

export async function getOrCreateDailyEntry(date: string) {
  const userId = await getUserId()
  return prisma.dailyEntry.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date },
    update: {},
    include: { morningLog: true, eveningLog: true },
  })
}

export async function saveMorningLog(entryId: string, date: string, raw: Record<string, string | boolean>) {
  await getUserId()
  const data = {
    wakeTime: raw.wakeTime as string | undefined,
    sunlightMinutes: raw.sunlightMinutes ? Number(raw.sunlightMinutes) : undefined,
    caffeineDelayed90min: typeof raw.caffeineDelayed90min === 'boolean' ? raw.caffeineDelayed90min : undefined,
    coldExposure: typeof raw.coldExposure === 'boolean' ? raw.coldExposure : undefined,
    meditationMinutes: raw.meditationMinutes ? Number(raw.meditationMinutes) : undefined,
    exerciseDone: typeof raw.exercise === 'boolean' ? raw.exercise : undefined,
    intention: raw.intention as string | undefined,
    identityAffirmation: raw.identityAffirmation as string | undefined,
    creativeObservation: raw.creativeObservation as string | undefined,
    top3: raw.top3 as string | undefined,
  }
  await prisma.morningLog.upsert({
    where: { entryId },
    create: { entryId, ...data },
    update: data,
  })
  await prisma.dailyEntry.update({
    where: { id: entryId },
    data: { morningCompleted: true },
  })
  revalidatePath('/dashboard')
  revalidatePath('/morning')
}

export async function saveEveningLog(entryId: string, date: string, raw: Record<string, string>) {
  await getUserId()
  const data = {
    wins: raw.wins,
    ownedFailure: raw.ownedFailure,
    emotionalPattern: raw.emotionalPattern,
    shadowInsight: raw.shadowInsight,
    creativeCapture: raw.creativeCapture,
    tomorrowFocus: raw.tomorrowFocus,
    sleepTargetTime: raw.sleepTargetTime,
  }
  await prisma.eveningLog.upsert({
    where: { entryId },
    create: { entryId, ...data },
    update: data,
  })
  await prisma.dailyEntry.update({
    where: { id: entryId },
    data: { eveningCompleted: true },
  })
  revalidatePath('/dashboard')
  revalidatePath('/evening')
}
