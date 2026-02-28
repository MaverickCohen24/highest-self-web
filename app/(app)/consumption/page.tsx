import { today } from '@/lib/utils'
import { getConsumptionLog, getRecentConsumptionLogs } from '@/actions/consumption'
import ConsumptionClient from '@/components/consumption/ConsumptionClient'

export default async function ConsumptionPage() {
  const date = today()
  const [log, history] = await Promise.all([
    getConsumptionLog(date),
    getRecentConsumptionLogs(),
  ])
  return <ConsumptionClient date={date} log={log} history={history} />
}
