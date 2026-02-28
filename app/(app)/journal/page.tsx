import { getAllDailyEntries, getProgressStats } from '@/actions/journal'
import JournalClient from '@/components/journal/JournalClient'

export default async function JournalPage() {
  const [entries, stats] = await Promise.all([
    getAllDailyEntries(),
    getProgressStats(),
  ])
  return <JournalClient entries={entries} stats={stats} />
}
