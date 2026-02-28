import { today } from '@/lib/utils'
import { getCompletionsForDate } from '@/actions/habits'
import HabitsClient from '@/components/habits/HabitsClient'

export default async function HabitsPage() {
  const date = today()
  const habits = await getCompletionsForDate(date)
  return <HabitsClient habits={habits} date={date} />
}
