import { today, getWeekStart, getWeekEnd } from '@/lib/utils'
import { getWeeklyMasteryHours } from '@/actions/mastery'
import { getWeeklyProtocolScore } from '@/actions/protocols'
import { getTodayHabitCount } from '@/actions/habits'
import { getWeeklyReview } from '@/actions/reflections'
import WeeklyClient from '@/components/weekly/WeeklyClient'

export default async function WeeklyPage() {
  const date = today()
  const ws = getWeekStart()
  const we = getWeekEnd(ws)

  const [masteryHours, protocolScore, habitCount, existingReview] = await Promise.all([
    getWeeklyMasteryHours(ws, we),
    getWeeklyProtocolScore(ws, we),
    getTodayHabitCount(date),
    getWeeklyReview(ws),
  ])

  return (
    <WeeklyClient
      weekStart={ws}
      weekEnd={we}
      masteryHours={masteryHours}
      protocolScore={protocolScore}
      habitCount={habitCount}
      existingReview={existingReview}
    />
  )
}
