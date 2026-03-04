import { getUserDate } from '@/lib/utils'
import { getOrCreateDailyEntry } from '@/actions/daily'
import EveningReviewClient from '@/components/evening/EveningReviewClient'

export default async function EveningPage() {
  const date = await getUserDate()
  const entry = await getOrCreateDailyEntry(date)
  return <EveningReviewClient entry={entry} date={date} />
}
