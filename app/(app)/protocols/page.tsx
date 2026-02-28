import { today } from '@/lib/utils'
import { getSleepLog, getWorkoutsForDate } from '@/actions/protocols'
import ProtocolsClient from '@/components/protocols/ProtocolsClient'

export default async function ProtocolsPage() {
  const date = today()
  const [sleepLog, workouts] = await Promise.all([
    getSleepLog(date),
    getWorkoutsForDate(date),
  ])
  return <ProtocolsClient date={date} sleepLog={sleepLog} workouts={workouts} />
}
