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

export async function getLifeTask() {
  const userId = await getUserId()
  return prisma.lifeTask.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } })
}

export async function setLifeTask(statement: string) {
  const userId = await getUserId()
  await prisma.lifeTask.create({ data: { userId, statement } })
  revalidatePath('/mastery')
}

export async function getSkills() {
  const userId = await getUserId()
  const skills = await prisma.skill.findMany({
    where: { userId },
    include: { sessions: true },
    orderBy: { createdAt: 'asc' },
  })
  return skills.map((s: typeof skills[number]) => ({
    ...s,
    totalMinutes: s.sessions.reduce((sum: number, sess: { minutes: number }) => sum + sess.minutes, 0),
    sessionCount: s.sessions.length,
  }))
}

export async function createSkill(data: {
  name: string; lifeTaskConnection?: string; phase?: string
}) {
  const userId = await getUserId()
  await prisma.skill.create({ data: { userId, ...data } })
  revalidatePath('/mastery')
}

export async function updateSkill(id: string, data: { phase?: string; name?: string }) {
  await getUserId()
  await prisma.skill.update({ where: { id }, data })
  revalidatePath('/mastery')
}

export async function logMasterySession(data: {
  skillId: string; date: string; minutes: number
  breakthrough?: string; obstacle?: string; mentorNotes?: string
}) {
  const userId = await getUserId()
  await prisma.masterySession.create({ data: { userId, ...data } })
  revalidatePath('/mastery')
  revalidatePath('/dashboard')
}

export async function getSessionsForSkill(skillId: string) {
  await getUserId()
  return prisma.masterySession.findMany({
    where: { skillId },
    orderBy: { date: 'desc' },
    take: 20,
  })
}

export async function getWeeklyMasteryHours(weekStart: string, weekEnd: string) {
  const userId = await getUserId()
  const result = await prisma.masterySession.aggregate({
    where: { userId, date: { gte: weekStart, lte: weekEnd } },
    _sum: { minutes: true },
  })
  return (result._sum.minutes ?? 0) / 60
}

export async function getIdentityStatements() {
  const userId = await getUserId()
  return prisma.identityStatement.findMany({
    where: { userId, isActive: true },
    orderBy: { createdAt: 'desc' },
  })
}

export async function addIdentityStatement(content: string) {
  const userId = await getUserId()
  await prisma.identityStatement.create({ data: { userId, content } })
  revalidatePath('/reflections')
}
