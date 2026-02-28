import { today, formatDate, getWeekStart, getWeekEnd } from '@/lib/utils'
import { getOrCreateDailyEntry } from '@/actions/daily'
import { getTodayHabitCount } from '@/actions/habits'
import { getWeeklyMasteryHours, getIdentityStatements, getSkills } from '@/actions/mastery'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const date = today()
  const ws = getWeekStart()
  const we = getWeekEnd(ws)

  const [entry, habitCount, masteryHours, identityStatements, skills] = await Promise.all([
    getOrCreateDailyEntry(date),
    getTodayHabitCount(date),
    getWeeklyMasteryHours(ws, we),
    getIdentityStatements(),
    getSkills(),
  ])

  const identityOfDay = identityStatements.length > 0
    ? identityStatements[new Date().getDate() % identityStatements.length]
    : null

  return (
    <DashboardClient
      date={date}
      entry={entry}
      habitCount={habitCount}
      masteryHours={masteryHours}
      identity={identityOfDay}
      skillCount={skills.length}
      formattedDate={formatDate(date)}
    />
  )
}
