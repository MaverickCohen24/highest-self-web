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

export async function saveReflection(data: {
  date: string; promptType?: string; content?: string; lawRef?: string; patternTag?: string
}) {
  const userId = await getUserId()
  const r = await prisma.reflection.create({ data: { userId, ...data } })
  revalidatePath('/reflections')
  return r
}

export async function getReflectionsForDate(date: string) {
  const userId = await getUserId()
  return prisma.reflection.findMany({ where: { userId, date }, orderBy: { createdAt: 'asc' } })
}

export async function searchReflections(query: string) {
  const userId = await getUserId()
  return prisma.reflection.findMany({
    where: {
      userId,
      OR: [
        { content: { contains: query, mode: 'insensitive' } },
        { patternTag: { contains: query, mode: 'insensitive' } },
        { lawRef: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
}

export async function getRecentReflections() {
  const userId = await getUserId()
  return prisma.reflection.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 20 })
}

export async function getAllPatternTags() {
  const userId = await getUserId()
  const tags = await prisma.reflection.findMany({
    where: { userId, patternTag: { not: null } },
    select: { patternTag: true },
    distinct: ['patternTag'],
  })
  return tags.map((t: { patternTag: string | null }) => t.patternTag!).filter(Boolean)
}

export async function getWeeklyReview(weekStart: string) {
  const userId = await getUserId()
  return prisma.weeklyReview.findUnique({ where: { userId_weekStart: { userId, weekStart } } })
}

export async function saveWeeklyReview(weekStart: string, data: {
  wins?: string; patterns?: string; protocolScore?: number; habitScore?: number
  masteryHours?: number; creativeOutput?: string; strategicLesson?: string; identityEvolution?: string
}) {
  const userId = await getUserId()
  await prisma.weeklyReview.upsert({
    where: { userId_weekStart: { userId, weekStart } },
    create: { userId, weekStart, ...data },
    update: data,
  })
  revalidatePath('/weekly')
}
