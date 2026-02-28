import { today } from '@/lib/utils'
import { getOrCreateDailyEntry } from '@/actions/daily'
import MorningFlowClient from '@/components/morning/MorningFlowClient'

export default async function MorningPage() {
  const date = today()
  const entry = await getOrCreateDailyEntry(date)
  return <MorningFlowClient entry={entry} date={date} />
}
