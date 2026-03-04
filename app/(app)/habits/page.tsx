import { getUserDate } from '@/lib/utils'
import { getCompletionsForDate } from '@/actions/habits'
import HabitsClient from '@/components/habits/HabitsClient'

export default async function HabitsPage() {
  const date = await getUserDate()
  const habits = await getCompletionsForDate(date)
  return <HabitsClient habits={habits} date={date} />
}
