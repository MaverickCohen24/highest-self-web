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

export async function saveCreativeEntry(data: {
  date: string; prompt?: string; content?: string; medium?: string; observations?: string
}) {
  const userId = await getUserId()
  const entry = await prisma.creativeEntry.create({ data: { userId, ...data } })
  revalidatePath('/creative')
  return entry
}

export async function getCreativeEntriesForDate(date: string) {
  const userId = await getUserId()
  return prisma.creativeEntry.findMany({
    where: { userId, date },
    orderBy: { createdAt: 'asc' },
  })
}

export async function getRecentCreativeEntries() {
  const userId = await getUserId()
  return prisma.creativeEntry.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
}

export async function getCreativeProjects() {
  const userId = await getUserId()
  return prisma.creativeProject.findMany({
    where: { userId, status: { not: 'archived' } },
    include: { _count: { select: { ideas: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createCreativeProject(title: string, description?: string) {
  const userId = await getUserId()
  await prisma.creativeProject.create({ data: { userId, title, description } })
  revalidatePath('/creative')
}

export async function addQuickIdea(content: string, projectId?: string) {
  const userId = await getUserId()
  await prisma.quickIdea.create({ data: { userId, content, projectId } })
  revalidatePath('/creative')
}

export async function getRecentIdeas() {
  const userId = await getUserId()
  return prisma.quickIdea.findMany({
    where: { userId },
    include: { project: { select: { title: true } } },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })
}
