import { getUserDate } from '@/lib/utils'
import { getOrCreateDailyEntry } from '@/actions/daily'
import MorningFlowClient from '@/components/morning/MorningFlowClient'

export default async function MorningPage() {
  const date = await getUserDate()
  const entry = await getOrCreateDailyEntry(date)
  return <MorningFlowClient entry={entry} date={date} />
}
