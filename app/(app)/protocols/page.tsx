import { getUserDate } from '@/lib/utils'
import { getSleepLog, getWorkoutsForDate } from '@/actions/protocols'
import ProtocolsClient from '@/components/protocols/ProtocolsClient'

export default async function ProtocolsPage() {
  const date = await getUserDate()
  const [sleepLog, workouts] = await Promise.all([
    getSleepLog(date),
    getWorkoutsForDate(date),
  ])
  return <ProtocolsClient date={date} sleepLog={sleepLog} workouts={workouts} />
}
